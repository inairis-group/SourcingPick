import { createServerFn } from "@tanstack/react-start";

export const fxRate = createServerFn({ method: "GET" }).handler(async () => {
  const { eurCny } = await import("@/lib/fx.server");
  return eurCny();
});
