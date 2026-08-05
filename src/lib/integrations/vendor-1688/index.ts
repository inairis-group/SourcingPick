import "server-only";
import { fixtureProvider } from "./fixture-provider";
import type { Vendor1688Provider } from "./provider";

/**
 * Single entry point for the integration.
 *
 * `isVendor1688Enabled()` is the kill switch: every surface checks it, so the
 * feature can be turned off in production without a deploy, and removing it
 * later means deleting this directory and the flag.
 */

export function isVendor1688Enabled(): boolean {
  return process.env.VENDOR_1688_ENABLED === "true";
}

/**
 * Which provider is live.
 *
 * Only the fixture exists today. A real reseller client is added here as a
 * second branch keyed off its API key — no caller changes.
 */
export function getVendor1688Provider(): Vendor1688Provider {
  return fixtureProvider;
}

export * from "./provider";
export * from "./url";
export * from "./pricing";
