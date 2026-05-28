import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The React Compiler correctness rules (bundled by eslint-config-next at
    // error severity) guard against bugs that only manifest once the React
    // Compiler's memoization is enabled — and it is NOT enabled in this
    // project (no `reactCompiler` in next.config, no babel plugin). Until we
    // turn the compiler on, these are advisory: keep them visible as
    // warnings rather than failing CI on patterns that are safe today
    // (server-component `Date.now()`, mount-hydration `setState` in effects,
    // `document.cookie` writes in event handlers, etc.). Revisit + fix +
    // re-escalate to "error" when/if we adopt the React Compiler.
    rules: {
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Tests run under node:test via tsx; not part of the app lint surface.
    "tests/**",
  ]),
]);

export default eslintConfig;
