import { httpDuration, httpRequests, routeLabel } from "../../src/lib/metrics.server";

type Hit = { url?: URL; req?: { method?: string } };

export default async function observe(event: Hit, next: () => unknown | Promise<unknown>) {
  const started = performance.now();
  try {
    return await next();
  } finally {
    const route = routeLabel(event.url?.pathname || "/");
    const method = event.req?.method || "GET";
    httpRequests.inc({ method, route });
    httpDuration.observe({ method, route }, (performance.now() - started) / 1000);
  }
}
