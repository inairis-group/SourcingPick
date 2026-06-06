import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

/**
 * Health-check endpoint for load balancers, uptime monitors, and CI
 * smoke tests. Reports:
 *   - `db.ok`           — Postgres reachable (cheap SELECT 1 round-trip).
 *   - `db.latencyMs`    — how long that round-trip took, for trend graphs.
 *   - `version.sha`     — git SHA at build time (set via VERCEL_GIT_COMMIT_SHA
 *                         or our own BUILD_SHA env var); null in local dev.
 *   - `uptime.s`        — seconds since this server process started, so
 *                         operators can see when a restart happened.
 *
 * No auth — designed for public probe endpoints. Returns 200 when
 * healthy, 503 when the DB ping fails so a load balancer can drop the
 * instance out of rotation. Keep the work this does cheap; the
 * latencyMs measurement assumes a single SELECT.
 *
 * Probe at `/api/healthz` from upstream tools (Vercel, ALB, Render,
 * UptimeRobot, etc.).
 */

export const dynamic = "force-dynamic";

const STARTED_AT = Date.now();

function buildSha(): string | null {
  return (
    process.env.BUILD_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.RENDER_GIT_COMMIT ??
    null
  );
}

export async function GET() {
  const before = performance.now();
  let dbOk = false;
  let dbError: string | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (e) {
    dbError = e instanceof Error ? e.message.slice(0, 200) : "unknown";
  }
  const latencyMs = Math.round(performance.now() - before);

  const body = {
    ok: dbOk,
    timestamp: new Date().toISOString(),
    db: {
      ok: dbOk,
      latencyMs,
      ...(dbError ? { error: dbError } : {}),
    },
    version: {
      sha: buildSha(),
    },
    uptime: {
      s: Math.floor((Date.now() - STARTED_AT) / 1000),
    },
  };

  return NextResponse.json(body, { status: dbOk ? 200 : 503 });
}
