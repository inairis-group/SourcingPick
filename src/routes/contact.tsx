import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import source from "@/site/boards/contact.html?raw";

export const Route = createFileRoute("/contact")({
  head: () => seoHead("/contact"),
  component: () => <Board name="contact" source={source} />,
});
