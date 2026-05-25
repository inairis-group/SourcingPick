import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { subscribeToThread } from "@/lib/messaging/pubsub";

export const dynamic = "force-dynamic";

/**
 * SSE stream of new messages for a thread.
 *
 * Auth: the requester must be a ThreadParticipant. We also send a keep-alive
 * comment every 25s — many proxies (nginx, Cloudflare) close idle TCP
 * connections at 30s, and SSE doesn't survive a drop without reconnect.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params;
  const user = await requireAuth();

  const participant = await prisma.threadParticipant.findUnique({
    where: { threadId_userId: { threadId, userId: user.id } },
    select: { threadId: true },
  });
  if (!participant) {
    return NextResponse.json({ error: "Not a participant." }, { status: 403 });
  }

  const encoder = new TextEncoder();
  let closed = false;
  let keepAlive: ReturnType<typeof setInterval> | undefined;
  let unsubscribe: (() => Promise<void>) | undefined;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          // Stream torn down; cleanup will run.
        }
      };

      try {
        unsubscribe = await subscribeToThread(threadId, (event) => {
          send(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
        });
      } catch (e) {
        send(`event: error\ndata: ${JSON.stringify({ message: String(e) })}\n\n`);
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
        return;
      }

      send(`event: ready\ndata: {}\n\n`);
      keepAlive = setInterval(() => send(`: ping\n\n`), 25_000);
    },
    async cancel() {
      closed = true;
      if (keepAlive) clearInterval(keepAlive);
      if (unsubscribe) await unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
