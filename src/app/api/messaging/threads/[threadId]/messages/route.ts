import { NextResponse } from "next/server";
import { AttachmentContext } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

/**
 * Paginated message list. The thread component uses this for the initial
 * load and re-fetches on every NOTIFY (cheaper than streaming bodies through
 * SSE — payload + role context all live on the server).
 *
 * `?after=<iso>` returns messages strictly newer than the timestamp; used
 * for the incremental top-up after a notify. Each message comes with its
 * attachments inlined so the client can render images/videos/files
 * without a second round-trip per message.
 */
export async function GET(
  req: Request,
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

  const url = new URL(req.url);
  const after = url.searchParams.get("after");
  const afterDate = after ? new Date(after) : null;

  const messages = await prisma.message.findMany({
    where: {
      threadId,
      deletedAt: null,
      ...(afterDate && !Number.isNaN(afterDate.getTime())
        ? { createdAt: { gt: afterDate } }
        : {}),
    },
    orderBy: { createdAt: "asc" },
    take: afterDate ? 200 : PAGE_SIZE,
    select: {
      id: true,
      body: true,
      authorUserId: true,
      createdAt: true,
      author: {
        select: {
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  // Batch-fetch attachments for every message in the page so we don't
  // N+1 the DB. Bucket by contextId client-side.
  const attachments =
    messages.length === 0
      ? []
      : await prisma.attachment.findMany({
          where: {
            contextType: AttachmentContext.MESSAGE,
            contextId: { in: messages.map((m) => m.id) },
          },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            contextId: true,
            kind: true,
            mimeType: true,
            sizeBytes: true,
            originalName: true,
          },
        });
  const byMessage = new Map<string, typeof attachments>();
  for (const a of attachments) {
    const arr = byMessage.get(a.contextId) ?? [];
    arr.push(a);
    byMessage.set(a.contextId, arr);
  }

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      authorUserId: m.authorUserId,
      author: m.author
        ? {
            firstName: m.author.firstName,
            lastName: m.author.lastName,
            role: m.author.role,
          }
        : null,
      createdAt: m.createdAt.toISOString(),
      attachments: (byMessage.get(m.id) ?? []).map((a) => ({
        id: a.id,
        kind: a.kind,
        mimeType: a.mimeType,
        sizeBytes: a.sizeBytes,
        originalName: a.originalName,
      })),
    })),
    selfUserId: user.id,
  });
}
