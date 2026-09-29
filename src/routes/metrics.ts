import { createFileRoute } from "@tanstack/react-router";
import { register } from "@/lib/metrics.server";

export const Route = createFileRoute("/metrics")({
  server: {
    handlers: {
      GET: async () => {
        const body = await register.metrics();
        return new Response(body, {
          headers: {
            "content-type": "text/plain; version=0.0.4; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
