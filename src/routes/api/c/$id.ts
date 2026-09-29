import { createFileRoute } from "@tanstack/react-router";
import { recordClick, safeClickTarget } from "@/lib/mail-track.server";

export const Route = createFileRoute("/api/c/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const target = safeClickTarget(new URL(request.url).searchParams.get("u") || "");
        const dest = target || "https://sourcingpick.com";
        try {
          if (target) await recordClick(params.id, target);
        } catch (error) {
          console.error("mail-click", error);
        }
        return Response.redirect(dest, 302);
      },
    },
  },
});
