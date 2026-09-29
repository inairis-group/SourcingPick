import { useState } from "react";

/** 12,50 and 12.50 both work. A trailing comma or dot stays while you type the cents. */
export function parseDecimal(raw: string): number | null {
  const trimmed = raw.trim().replace(/\s/g, "");
  if (!trimmed || /[.,]$/.test(trimmed)) return null;
  const lastComma = trimmed.lastIndexOf(",");
  const lastDot = trimmed.lastIndexOf(".");
  let normalized = trimmed;
  if (lastComma >= 0 && lastDot >= 0) {
    normalized = lastComma > lastDot ? trimmed.replace(/\./g, "").replace(",", ".") : trimmed.replace(/,/g, "");
  } else if (lastComma >= 0) {
    normalized = trimmed.replace(",", ".");
  }
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function tidy(raw: string) {
  return raw.replace(/[^\d.,\s]/g, "").slice(0, 18);
}

function format(value: number, fraction: number) {
  if (!Number.isFinite(value)) return "";
  if (fraction === 0) {
    return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
  }
  const [whole, dec] = value.toFixed(fraction).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped},${dec}`;
}

export function DecimalField({
  value,
  onChange,
  className = "field",
  fraction = 2,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  fraction?: number;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      className={className}
      inputMode="decimal"
      value={draft ?? format(value, fraction)}
      onFocus={(event) => {
        setDraft(format(value, fraction));
        requestAnimationFrame(() => event.currentTarget.select());
      }}
      onChange={(event) => {
        const next = tidy(event.target.value);
        setDraft(next);
        const parsed = parseDecimal(next);
        if (parsed != null) onChange(parsed);
      }}
      onBlur={() => setDraft(null)}
    />
  );
}

export function CentsField({
  cents,
  onChange,
  className = "field w-32",
}: {
  cents: number;
  onChange: (cents: number) => void;
  className?: string;
}) {
  return <DecimalField className={className} value={(cents || 0) / 100} onChange={(value) => onChange(Math.round(value * 100))} />;
}
