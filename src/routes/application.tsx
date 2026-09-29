import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/application")({
  head: () => seoHead("/application"),
  component: () => <Board name="application" />,
});
