import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/a-propos")({
  head: () => seoHead("/a-propos"),
  component: () => <Board name="apropos" />,
});
