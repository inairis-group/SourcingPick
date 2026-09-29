import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { ORG_JSON, seoHead } from "@/lib/seo";
import source from "@/site/boards/accueil.html?raw";

export const Route = createFileRoute("/")({
  head: () => seoHead("/", { jsonLd: ORG_JSON }),
  component: () => <Board name="accueil" source={source} />,
});
