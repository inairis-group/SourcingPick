/**
 * Sourcing Pick's WhatsApp line: the number the Entrepôt artboard gives as
 * WhatsApp ("+86 195 5817 9800 · WhatsApp"). One place, because the site's
 * floating button, the Entrepôt notice and the structured data all carry it.
 */
export const WHATSAPP_NUMBER = "+86 195 5817 9800";

/** wa.me wants the international number, digits only. */
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`;
