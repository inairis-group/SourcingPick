import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/cgv")({
  head: () => seoHead("/cgv"),
  component: () => <Board name="cgv" />,
});
