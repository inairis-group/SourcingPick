import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { FAQ_JSON, seoHead } from "@/lib/seo";
import source from "@/site/boards/faq.html?raw";

export const Route = createFileRoute("/faq")({
  head: () => seoHead("/faq", { jsonLd: FAQ_JSON }),
  component: () => <Board name="faq" source={source} />,
});
