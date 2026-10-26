import type { FreightSimulatorCopy } from "@/content/freight/simulator";
import type { ContainerType, Formula, Line, Mode } from "@/lib/freight/modes";

/**
 * How a freight quote's transport reads, in the reader's language, from the
 * simulator's own words: "Bateau · Bateau, ligne colis (UPS ou DPD)",
 * "Conteneur complet · 2 × 40 pieds (environ 58 m³)". Shared by the admin's
 * list, the client's page and the e-mail.
 */
export function describeTransport(
  c: Pick<FreightSimulatorCopy, "mode" | "lines" | "container">,
  q: { mode: string; line: string | null; container?: { type: ContainerType; count: number } | null },
): string {
  const mode = c.mode.names[q.mode as Mode] ?? q.mode;
  if (q.container) return `${mode} · ${q.container.count} × ${c.container.types[q.container.type] ?? q.container.type}`;
  const line = q.line ? c.lines.names[q.line as Line] : null;
  return line ? `${mode} · ${line}` : mode;
}

export function formulaName(c: Pick<FreightSimulatorCopy, "formula">, formula: string): string {
  return c.formula.names[formula as Formula] ?? formula.toUpperCase();
}

/** The delay of the line, or of the mode when it has no line. */
export function transportDelay(c: Pick<FreightSimulatorCopy, "estimate">, q: { mode: string; line: string | null }): string {
  return c.estimate.delays[(q.line ?? q.mode) as Line | Mode] ?? "";
}

/** Where a quote stands for whoever reads it: an open quote past its date has expired. */
export function quoteStanding(status: string, validUntil: Date): "SENT" | "ACCEPTED" | "DECLINED" | "CANCELLED" | "EXPIRED" {
  if (status === "SENT" && validUntil.getTime() < Date.now()) return "EXPIRED";
  return status as "SENT" | "ACCEPTED" | "DECLINED" | "CANCELLED";
}
