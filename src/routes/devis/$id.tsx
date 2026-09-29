import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";

export const Route = createFileRoute("/devis/$id")({ component: Page });

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const real = id.startsWith("q_");

  useEffect(() => {
    if (!real) return;
    void navigate({ to: "/devis/nouveau", search: { id }, replace: true });
  }, [id, navigate, real]);

  return (
    <Shell>
      <PageHead title="Devis" />
      {real ? (
        <p className="text-sm text-muted">Ouverture du devis…</p>
      ) : (
        <>
          <p className="mb-4 max-w-xl text-sm text-muted">
            Ce brouillon n’est pas un devis enregistré. Les anciens clients locaux ne sont plus proposés : seuls les comptes clients actifs apparaissent.
          </p>
          <Link to="/devis" className="btn btn-primary">Voir les devis</Link>
        </>
      )}
    </Shell>
  );
}
