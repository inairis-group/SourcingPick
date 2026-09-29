import { createServerFn } from "@tanstack/react-start";
import { requireUser } from "@/lib/admin-auth.server";
import { clientAddress, rateLimit } from "@/lib/guard.server";
import { addFollow, listBids, listEvents, listItems, placeBid, readPrefs, readStats, recordEvent, recordHit, removeItem, saveItem, savePrefs, shipItem } from "@/lib/commerce.server";

async function admin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Réservé à l’administration.");
  return user;
}

export const trackVisit = createServerFn({ method: "POST" })
  .inputValidator((input: { path: string; referrer: string; source: string; medium: string; campaign: string; device: string; visitor: string }) => input)
  .handler(async ({ data }) => {
    rateLimit(`hit:${clientAddress()}`, 90, 60_000);
    return recordHit(data);
  });

export const trackEvent = createServerFn({ method: "POST" })
  .inputValidator((input: { path: string; visitor: string; kind: string; depth: number; section: string; seconds: number }) => input)
  .handler(async ({ data }) => {
    rateLimit(`evt:${clientAddress()}`, 120, 60_000);
    return recordEvent(data);
  });

export const publicSales = createServerFn({ method: "GET" }).handler(async () => listItems("sale", true));

export const publicAuctions = createServerFn({ method: "GET" }).handler(async () => listItems("auction", true));

export const publicBid = createServerFn({ method: "POST" })
  .inputValidator((input: { itemId: string; name: string; email: string; amountCents: number }) => input)
  .handler(async ({ data }) => {
    rateLimit(`bid:${clientAddress()}`, 12, 60_000);
    return placeBid(data);
  });

export const opsMailLog = createServerFn({ method: "GET" }).handler(async () => {
  await admin();
  const { listMailMessages } = await import("@/lib/mail-track.server");
  return listMailMessages();
});

export const opsStats = createServerFn({ method: "GET" }).handler(async () => {
  await admin();
  return readStats();
});

export const opsMarket = createServerFn({ method: "GET" })
  .inputValidator((kind: "sale" | "auction") => kind)
  .handler(async ({ data }) => {
    await admin();
    return listItems(data, false);
  });

export const opsSaveMarket = createServerFn({ method: "POST" })
  .inputValidator((input: { id?: string; title: string; summary: string; priceCents: number; status: string; kind: "sale" | "auction"; endsAt?: string; sku?: string; qty?: number; location?: string; clientName?: string; clientEmail?: string; stage?: string; minQty?: number }) => input)
  .handler(async ({ data }) => {
    const user = await admin();
    return saveItem({ ...data, author: user.name });
  });

export const opsDeleteMarket = createServerFn({ method: "POST" })
  .inputValidator((id: string) => id)
  .handler(async ({ data }) => {
    await admin();
    return removeItem(data);
  });

export const opsBids = createServerFn({ method: "GET" })
  .inputValidator((id: string) => id)
  .handler(async ({ data }) => {
    await admin();
    return listBids(data);
  });

export const opsFollow = createServerFn({ method: "GET" })
  .inputValidator((id: string) => id)
  .handler(async ({ data }) => {
    await admin();
    return listEvents(data);
  });

export const opsAddFollow = createServerFn({ method: "POST" })
  .inputValidator((input: { itemId: string; note: string; stage?: string }) => input)
  .handler(async ({ data }) => {
    const user = await admin();
    return addFollow({ ...data, author: user.name });
  });

export const opsPrefs = createServerFn({ method: "GET" }).handler(async () => {
  await admin();
  return readPrefs();
});

export const opsSavePrefs = createServerFn({ method: "POST" })
  .inputValidator((input: { minQty: number; autoShip: boolean }) => input)
  .handler(async ({ data }) => {
    await admin();
    return savePrefs(data);
  });

export const opsShip = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; carrier: string; tracking: string }) => input)
  .handler(async ({ data }) => {
    const user = await admin();
    return shipItem({ ...data, author: user.name });
  });
