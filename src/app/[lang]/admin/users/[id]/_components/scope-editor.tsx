"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminScope } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { updateAdminScopesAction } from "@/lib/admin/scope-actions";
import { cn } from "@/lib/utils";

type ScopeDoc = Record<AdminScope, { surfaces: string[] }>;

/**
 * Scope checklist for an admin user. SUPER toggles every other check
 * off — they're irrelevant when SUPER is set. Save is disabled until
 * something actually changed so the audit log doesn't churn.
 */
export function AdminScopeEditor({
  userId,
  isSelf,
  initial,
  scopeDoc,
  labels,
  ui,
}: {
  userId: string;
  isSelf: boolean;
  initial: AdminScope[];
  scopeDoc: ScopeDoc;
  labels: Record<AdminScope, string>;
  ui: { saveCta: string; superHint: string; surfacesLabel: string };
}) {
  const router = useRouter();
  const [scopes, setScopes] = useState<Set<AdminScope>>(new Set(initial));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [_, startTransition] = useTransition();

  const hasSuper = scopes.has(AdminScope.SUPER);

  const toggle = (s: AdminScope) => {
    setError(null);
    setScopes((current) => {
      const next = new Set(current);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const initialSet = new Set(initial);
  const dirty =
    scopes.size !== initialSet.size ||
    Array.from(scopes).some((s) => !initialSet.has(s));

  const save = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await updateAdminScopesAction(userId, {
        scopes: Array.from(scopes),
      });
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  };

  // Render order: SUPER first, then alphabetical.
  const ordered = (Object.keys(scopeDoc) as AdminScope[]).sort((a, b) => {
    if (a === AdminScope.SUPER) return -1;
    if (b === AdminScope.SUPER) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex flex-col gap-3">
      {error && <FormError>{error}</FormError>}

      {hasSuper && (
        <div className="rounded-md border border-brand-edge bg-brand-50/50 px-3 py-2 text-xs text-fg">
          {ui.superHint}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {ordered.map((scope) => {
          const checked = scopes.has(scope);
          const dimmed = hasSuper && scope !== AdminScope.SUPER;
          return (
            <li key={scope}>
              <label
                className={cn(
                  "flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors duration-fast",
                  checked
                    ? "border-brand-edge bg-brand-50/40"
                    : "border-line bg-surface hover:bg-subtle/30",
                  dimmed && "opacity-60",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(scope)}
                  disabled={pending}
                  className="mt-0.5 h-4 w-4 rounded border-line text-brand-700 focus:ring-focus"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-fg">
                    {labels[scope]}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    <span className="font-medium">{ui.surfacesLabel}:</span>{" "}
                    {scopeDoc[scope].surfaces.join(" · ")}
                  </p>
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-end pt-2">
        <Button
          type="button"
          variant="primary"
          size="md"
          loading={pending}
          disabled={!dirty || pending}
          onClick={save}
        >
          {ui.saveCta}
        </Button>
      </div>

      {/* Reserved for the future self-lockout hint we may wish to surface
          eagerly — for now the server returns a meaningful error. */}
      {isSelf && <span className="hidden" />}
    </div>
  );
}
