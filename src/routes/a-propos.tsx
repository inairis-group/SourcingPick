import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import source from "@/site/boards/apropos.html?raw";

export const Route = createFileRoute("/a-propos")({
  head: () => seoHead("/a-propos"),
  component: () => <Board name="apropos" source={source} />,
});
