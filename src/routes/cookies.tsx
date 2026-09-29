import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import source from "@/site/boards/cookies.html?raw";

export const Route = createFileRoute("/cookies")({
  head: () => seoHead("/cookies"),
  component: () => <Board name="cookies" source={source} />,
});
