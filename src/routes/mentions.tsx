import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/mentions")({
  head: () => seoHead("/mentions"),
  component: () => <Board name="mentions" />,
});
