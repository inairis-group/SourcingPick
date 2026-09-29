import { createFileRoute } from "@tanstack/react-router";
import { probeHealth } from "@/lib/log.server";

export const Route = createFileRoute("/sante")({
  server: {
    handlers: {
      GET: async () => {
        const health = await probeHealth();
        return new Response(
          JSON.stringify({
            ok: health.ok,
            uptimeSec: health.uptimeSec,
            memoryMb: health.memoryMb,
            db: health.db,
            lagMs: health.lagMs,
          }),
          {
            status: health.ok ? 200 : 503,
            headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
          },
        );
      },
    },
  },
});
