import "server-only";

/**
 * PingPong configuration.
 *
 * Deliberately a separate module from the client so `isConfigured()` stays a
 * pure env check with no network and no import cycle — the admin payments
 * dashboard calls it on every render.
 */

export const PINGPONG_ENV_VARS = [
  "PINGPONG_API_BASE",
  "PINGPONG_CLIENT_ID",
  "PINGPONG_CLIENT_SECRET",
  "PINGPONG_WEBHOOK_SECRET",
] as const;

export type PingPongConfig = {
  apiBase: string;
  clientId: string;
  clientSecret: string;
  webhookSecret: string;
};

/**
 * Returns null when anything is missing. Callers then refuse the operation
 * rather than half-attempting it — a payout rail that silently no-ops is worse
 * than one that plainly says it isn't set up.
 */
export function pingpongConfig(): PingPongConfig | null {
  const apiBase = process.env.PINGPONG_API_BASE;
  const clientId = process.env.PINGPONG_CLIENT_ID;
  const clientSecret = process.env.PINGPONG_CLIENT_SECRET;
  const webhookSecret = process.env.PINGPONG_WEBHOOK_SECRET;
  if (!apiBase || !clientId || !clientSecret || !webhookSecret) return null;
  return {
    apiBase: apiBase.replace(/\/+$/, ""),
    clientId,
    clientSecret,
    webhookSecret,
  };
}

export function pingpongIsConfigured(): boolean {
  return pingpongConfig() !== null;
}

export function missingPingPongEnvVars(): string[] {
  return PINGPONG_ENV_VARS.filter((v) => !process.env[v]);
}
