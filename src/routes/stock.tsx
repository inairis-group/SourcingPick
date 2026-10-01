import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { opsMarket } from "@/lib/commerce.functions";
import { useOps } from "@/components/ops-ui";
import { loadSession, peekSession } from "@/lib/session";

export const Route = createFileRoute("/stock")({
  head: () => ({ meta: [{ title: "SourcingPick Stock" }] }),
  component: StockGate,
});

function StockGate() {
  const navigate = useNavigate();
  const cached = peekSession()?.user;
  const [open, setOpen] = useState(Boolean(cached && cached.role === "admin"));
  useEffect(() => {
    let live = true;
    loadSession()
      .then((session) => {
        if (!live) return;
        if (session.user?.role !== "admin") {
          void navigate({ to: session.user ? "/espace" : "/connexion" });
          return;
        }
        setOpen(true);
      })
      .catch(() => {
        if (live) void navigate({ to: "/connexion" });
      });
    return () => {
      live = false;
    };
  }, [navigate]);
  if (!open) return null;
  return <StockFrame />;
}

function StockFrame() {
  const sales = useOps(() => opsMarket({ data: "sale" }), "stock-sales");
  const auctions = useOps(() => opsMarket({ data: "auction" }), "stock-auctions");
  // Mémoïsé : sinon la fusion + le filtre repartent à chaque rendu.
  const low = useMemo(
    () =>
      [...(sales.data ?? []), ...(auctions.data ?? [])].filter(
        (item) => item.qty <= item.minQty && item.stage !== "Expédié" && item.stage !== "Vendu",
      ),
    [sales.data, auctions.data],
  );
  return (
    <Shell>
      <div className="-mx-4 -my-6 flex h-[calc(100dvh-68px)] flex-col lg:-mx-7 lg:-my-7 lg:h-[calc(100dvh-76px)]">
        {low.length > 0 ? (
          <p className="shrink-0 border-b border-[#f3c7c7] bg-[#fde8e8] px-4 py-2 text-sm text-[#8a1c1c]">
            Stock bas : {low.map((item) => `${item.title} (${item.qty})`).join(" · ")}
          </p>
        ) : null}
        <iframe title="SourcingPick Stock" src="/stock/" className="min-h-0 w-full flex-1 border-0 bg-white" />
      </div>
    </Shell>
  );
}
