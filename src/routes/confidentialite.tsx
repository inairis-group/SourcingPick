import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/confidentialite")({
  head: () => seoHead("/confidentialite"),
  component: () => <Board name="confidentialite" />,
});
