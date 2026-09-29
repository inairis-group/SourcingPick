import { httpDuration, httpRequests, httpResponses, routeLabel } from "../../src/lib/metrics.server";

type Hit = { url?: URL; req?: { method?: string } };

export default async function observe(event: Hit, next: () => unknown | Promise<unknown>) {
  const started = performance.now();
  const route = routeLabel(event.url?.pathname || "/");
  const method = event.req?.method || "GET";
  let status = 500;
  try {
    const result = await next();
    status = result instanceof Response ? result.status : 200;
    return result;
  } catch (error) {
    status = 500;
    throw error;
  } finally {
    const label = String(status);
    httpRequests.inc({ method, route });
    httpResponses.inc({ method, route, status: label });
    httpDuration.observe({ method, route }, (performance.now() - started) / 1000);
  }
}
