import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import source from "@/site/boards/application.html?raw";

export const Route = createFileRoute("/application")({
  head: () => seoHead("/application"),
  component: () => <Board name="application" source={source} />,
});
