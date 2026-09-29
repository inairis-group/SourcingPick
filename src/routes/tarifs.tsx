import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/tarifs")({
  head: () => seoHead("/tarifs"),
  component: () => <Board name="tarifs" />,
});
