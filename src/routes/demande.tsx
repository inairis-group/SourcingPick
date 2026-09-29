import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/demande")({
  head: () => seoHead("/demande"),
  component: () => <Board name="devis" />,
});
