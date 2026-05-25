import { NextResponse } from "next/server";
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
 * for the incremental top-up after a notify.
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
    })),
    selfUserId: user.id,
  });
}
