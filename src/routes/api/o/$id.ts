import { createFileRoute } from "@tanstack/react-router";
import { recordOpen } from "@/lib/mail-track.server";

const GIF = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), (char) => char.charCodeAt(0));

export const Route = createFileRoute("/api/o/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          await recordOpen(params.id);
        } catch (error) {
          console.error("mail-open", error);
        }
        return new Response(GIF, {
          headers: {
            "Content-Type": "image/gif",
            "Cache-Control": "no-store, no-cache, must-revalidate, private",
            "Content-Length": String(GIF.length),
          },
        });
      },
    },
  },
});
