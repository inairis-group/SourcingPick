import { createFileRoute } from "@tanstack/react-router";
import { ProductDesk } from "@/components/product-desk";

export const Route = createFileRoute("/gestion/encheres")({
  head: () => ({ meta: [{ title: "SourcingPick — Enchères" }] }),
  component: () => <ProductDesk kind="auction" />,
});
