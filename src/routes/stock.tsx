import { createFileRoute } from "@tanstack/react-router";
import { StockApp } from "@/components/stock-app";

export const Route = createFileRoute("/stock")({
  head: () => ({ meta: [{ title: "SourcingPick Stock" }] }),
  component: StockApp,
});
