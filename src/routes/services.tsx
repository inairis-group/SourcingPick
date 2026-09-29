import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { SERVICE_JSON, seoHead } from "@/lib/seo";
import source from "@/site/boards/services.html?raw";

export const Route = createFileRoute("/services")({
  head: () => seoHead("/services", { jsonLd: SERVICE_JSON }),
  component: () => <Board name="services" source={source} />,
});
