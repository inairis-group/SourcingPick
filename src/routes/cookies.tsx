import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/cookies")({
  head: () => seoHead("/cookies"),
  component: () => <Board name="cookies" />,
});
