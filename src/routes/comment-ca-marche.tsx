import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/comment-ca-marche")({
  head: () => seoHead("/comment-ca-marche"),
  component: () => <Board name="comment" />,
});
