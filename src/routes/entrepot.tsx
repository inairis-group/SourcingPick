import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import source from "@/site/boards/entrepot.html?raw";

export const Route = createFileRoute("/entrepot")({
  head: () => seoHead("/entrepot"),
  component: () => <Board name="entrepot" source={source} />,
});
