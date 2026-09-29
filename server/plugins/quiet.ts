type Loud = { message?: string; code?: string; cause?: unknown };

function noisy(value: unknown): boolean {
  if (typeof value === "string") return /aborted|ECONNRESET|EPIPE|socket hang up/i.test(value);
  if (!value || typeof value !== "object") return false;
  const error = value as Loud;
  const code = error.code || "";
  if (code === "ECONNRESET" || code === "EPIPE" || code === "ECONNABORTED") return true;
  const message = error.message || "";
  if (/^(aborted|the operation was aborted|socket hang up)$/i.test(message)) return true;
  return noisy(error.cause);
}

export default function quiet() {
  const slot = globalThis as typeof globalThis & { __spQuiet?: boolean };
  if (slot.__spQuiet) return;
  slot.__spQuiet = true;
  const original = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    if (args.length > 0 && args.every((item) => item == null || noisy(item))) return;
    original(...args);
  };
}
