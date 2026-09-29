import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/entrepot")({
  head: () => seoHead("/entrepot"),
  component: () => <Board name="entrepot" />,
});
