/**
 * Pre-build guard — Next.js 16 `"use server"` files may only export
 * async functions. Non-async exports compile but blow up at runtime
 * with an opaque stack pointing at the minified bundle chunk.
 *
 * This script walks every src/**\/*.ts(x) whose first directive is
 * `"use server"` and asserts every top-level export is `export async
 * function`. Exits non-zero on the first violation so CI / a
 * `prebuild` hook can block the broken artefact from shipping.
 *
 * Run: `npx tsx scripts/check-use-server.ts`
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  createSourceFile,
  forEachChild,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
  type Node,
  type SourceFile,
  type Statement,
} from "typescript";

const ROOT = join(process.cwd(), "src");
const REPO = process.cwd();

type Violation = {
  file: string;
  line: number;
  exportName: string;
  kind: string;
  reason: string;
};

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      yield* walk(p);
    } else if (
      st.isFile() &&
      (p.endsWith(".ts") || p.endsWith(".tsx")) &&
      !p.endsWith(".d.ts")
    ) {
      yield p;
    }
  }
}

function hasUseServerDirective(source: SourceFile): boolean {
  // Walk leading statements until we hit a non-string-expression. Any
  // ExpressionStatement that's a string literal counts as a directive
  // prologue. "use server" must appear in that prologue.
  for (const stmt of source.statements) {
    if (stmt.kind !== SyntaxKind.ExpressionStatement) break;
    const expr = (stmt as { expression?: Node }).expression;
    if (!expr || expr.kind !== SyntaxKind.StringLiteral) break;
    const text = (expr as { text: string }).text;
    if (text === "use server") return true;
  }
  return false;
}

function lineOf(source: SourceFile, pos: number): number {
  return source.getLineAndCharacterOfPosition(pos).line + 1;
}

/**
 * A top-level export from a "use server" file is OK iff it is:
 *   `export async function foo(...) { ... }`
 *
 * Anything else — `export const`, `export type`, `export interface`,
 * `export enum`, `export { ... }`, `export * from ...`, `export
 * function` (sync), `export default <not async function>`, default
 * exports of any kind — is a runtime hazard.
 */
function violationsFor(
  source: SourceFile,
  file: string,
): Violation[] {
  const out: Violation[] = [];

  for (const stmt of source.statements) {
    const v = checkStatement(stmt, source, file);
    if (v) out.push(...v);
  }
  return out;
}

function checkStatement(
  stmt: Statement,
  source: SourceFile,
  file: string,
): Violation[] | null {
  // We only care about statements that look like exports.
  const modifiers = (
    stmt as { modifiers?: ReadonlyArray<{ kind: SyntaxKind }> }
  ).modifiers;
  const isExport = modifiers?.some((m) => m.kind === SyntaxKind.ExportKeyword);
  const isDefault = modifiers?.some(
    (m) => m.kind === SyntaxKind.DefaultKeyword,
  );

  if (
    stmt.kind === SyntaxKind.ExportDeclaration ||
    stmt.kind === SyntaxKind.ExportAssignment
  ) {
    return [
      {
        file,
        line: lineOf(source, stmt.getStart(source)),
        exportName: stmt.getText(source).slice(0, 80),
        kind: SyntaxKind[stmt.kind],
        reason:
          "Re-exports / default export bindings are not allowed in a 'use server' file.",
      },
    ];
  }

  if (!isExport) return null;

  switch (stmt.kind) {
    case SyntaxKind.FunctionDeclaration: {
      const fn = stmt as {
        modifiers?: ReadonlyArray<{ kind: SyntaxKind }>;
        name?: { text: string };
      };
      const isAsync = fn.modifiers?.some(
        (m) => m.kind === SyntaxKind.AsyncKeyword,
      );
      if (!isAsync) {
        return [
          {
            file,
            line: lineOf(source, stmt.getStart(source)),
            exportName: fn.name?.text ?? "<anon>",
            kind: "FunctionDeclaration (not async)",
            reason: "Exported function must be `async`.",
          },
        ];
      }
      if (isDefault) {
        return [
          {
            file,
            line: lineOf(source, stmt.getStart(source)),
            exportName: fn.name?.text ?? "<default>",
            kind: "default async function",
            reason:
              "Default exports are not addressable as server actions; export by name.",
          },
        ];
      }
      return null;
    }

    case SyntaxKind.VariableStatement: {
      // Inspect each `export const X = <init>` to see whether the
      // initializer is an async arrow / function. Anything else
      // (primitive, object, sync function, enum value, plain
      // reference) is the runtime hazard Next.js flags as
      // "A 'use server' file can only export async functions,
      // found string/object/etc."
      const decls = collectVarDecls(stmt);
      const flagged: Violation[] = [];
      for (const d of decls) {
        if (!d.initIsAsyncFunction) {
          flagged.push({
            file,
            line: lineOf(source, stmt.getStart(source)),
            exportName: d.name,
            kind: `VariableStatement (${d.initKind})`,
            reason:
              "Initializer is not an async function — Next.js will throw at runtime.",
          });
        }
      }
      return flagged.length ? flagged : null;
    }

    // Type-only exports are erased by tsc before bundling, so they
    // are safe — Next.js only checks runtime values. Skip.
    case SyntaxKind.TypeAliasDeclaration:
    case SyntaxKind.InterfaceDeclaration:
      return null;

    case SyntaxKind.EnumDeclaration:
    case SyntaxKind.ClassDeclaration:
    case SyntaxKind.ModuleDeclaration: {
      const decl = stmt as { name?: { text: string } };
      return [
        {
          file,
          line: lineOf(source, stmt.getStart(source)),
          exportName: decl.name?.text ?? "<anon>",
          kind: SyntaxKind[stmt.kind],
          reason:
            "Resolves to a runtime object, not an async function — move to a sibling file.",
        },
      ];
    }

    default:
      return [
        {
          file,
          line: lineOf(source, stmt.getStart(source)),
          exportName: stmt.getText(source).slice(0, 80),
          kind: SyntaxKind[stmt.kind],
          reason:
            "Unexpected export shape — only async function declarations are allowed.",
        },
      ];
  }
}

type VarDeclInfo = {
  name: string;
  initIsAsyncFunction: boolean;
  initKind: string;
};

function collectVarDecls(stmt: Statement): VarDeclInfo[] {
  const out: VarDeclInfo[] = [];
  const list = (stmt as {
    declarationList?: { declarations: Array<Node & { initializer?: Node; name?: Node }> };
  }).declarationList;
  if (!list) return out;
  for (const decl of list.declarations) {
    const nameNode = decl.name as (Node & { text?: string }) | undefined;
    const name =
      nameNode && "text" in nameNode && typeof nameNode.text === "string"
        ? nameNode.text
        : "<destructured>";
    const init = decl.initializer;
    const { isAsync, kind } = describeInitializer(init);
    out.push({ name, initIsAsyncFunction: isAsync, initKind: kind });
  }
  return out;
}

function describeInitializer(
  init: Node | undefined,
): { isAsync: boolean; kind: string } {
  if (!init) return { isAsync: false, kind: "no initializer" };
  switch (init.kind) {
    case SyntaxKind.ArrowFunction:
    case SyntaxKind.FunctionExpression: {
      const fn = init as { modifiers?: ReadonlyArray<{ kind: SyntaxKind }> };
      const isAsync = !!fn.modifiers?.some(
        (m) => m.kind === SyntaxKind.AsyncKeyword,
      );
      return {
        isAsync,
        kind: isAsync ? "async arrow/function" : "sync arrow/function",
      };
    }
    case SyntaxKind.StringLiteral:
    case SyntaxKind.NoSubstitutionTemplateLiteral:
    case SyntaxKind.TemplateExpression:
      return { isAsync: false, kind: "string" };
    case SyntaxKind.NumericLiteral:
    case SyntaxKind.BigIntLiteral:
      return { isAsync: false, kind: "number" };
    case SyntaxKind.TrueKeyword:
    case SyntaxKind.FalseKeyword:
      return { isAsync: false, kind: "boolean" };
    case SyntaxKind.NullKeyword:
      return { isAsync: false, kind: "null" };
    case SyntaxKind.ObjectLiteralExpression:
      return { isAsync: false, kind: "object literal" };
    case SyntaxKind.ArrayLiteralExpression:
      return { isAsync: false, kind: "array literal" };
    case SyntaxKind.NewExpression:
      return { isAsync: false, kind: "new instance" };
    case SyntaxKind.CallExpression:
      return { isAsync: false, kind: "function call result" };
    case SyntaxKind.Identifier:
    case SyntaxKind.PropertyAccessExpression:
      return { isAsync: false, kind: "reference" };
    case SyntaxKind.AsExpression:
    case SyntaxKind.TypeAssertionExpression:
    case SyntaxKind.SatisfiesExpression: {
      // Recurse past the cast.
      const inner = (init as { expression?: Node }).expression;
      return describeInitializer(inner);
    }
    default:
      return { isAsync: false, kind: SyntaxKind[init.kind] };
  }
}

function main() {
  const allFiles = [...walk(ROOT)];
  const violations: Violation[] = [];
  let scanned = 0;

  for (const file of allFiles) {
    const text = readFileSync(file, "utf8");
    if (!text.includes('"use server"') && !text.includes("'use server'")) {
      continue;
    }
    const source = createSourceFile(
      file,
      text,
      ScriptTarget.Latest,
      /* setParentNodes */ true,
      file.endsWith(".tsx") ? ScriptKind.TSX : ScriptKind.TS,
    );
    if (!hasUseServerDirective(source)) continue;
    scanned++;
    const v = violationsFor(source, file);
    if (v.length > 0) violations.push(...v);
    void forEachChild;
  }

  if (violations.length === 0) {
    console.log(
      `✓ check-use-server: ${scanned} server-action file(s) scanned, no violations.`,
    );
    // tsx (and node --import tsx) defaults to exit 1 on natural end —
    // explicit exit makes the script reliable as a prebuild gate.
    process.exit(0);
  }

  console.error(
    `✗ check-use-server: ${violations.length} violation(s) across ${scanned} server-action file(s).\n`,
  );
  for (const v of violations) {
    const rel = relative(REPO, v.file);
    console.error(`  ${rel}:${v.line}`);
    console.error(`    export: ${v.exportName}`);
    console.error(`    kind:   ${v.kind}`);
    console.error(`    why:    ${v.reason}\n`);
  }
  process.exit(1);
}

main();
