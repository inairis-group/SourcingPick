import { createFileRoute } from "@tanstack/react-router";
import { ProductDesk } from "@/components/product-desk";

export const Route = createFileRoute("/gestion/marketplace")({
  head: () => ({ meta: [{ title: "SourcingPick — Marketplace" }] }),
  component: () => <ProductDesk kind="sale" />,
});
