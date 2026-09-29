import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from "@prometheus-io/client";

type Bag = {
  register: Registry;
  serverUp: Gauge;
  databaseUp: Gauge;
  memoryMb: Gauge;
  loopLag: Gauge;
  httpRequests: Counter<string>;
  httpDuration: Histogram<string>;
};

const slot = globalThis as typeof globalThis & { __spMetrics?: Bag };

function bag(): Bag {
  if (slot.__spMetrics) return slot.__spMetrics;
  const register = new Registry();
  collectDefaultMetrics({ register });
  const created: Bag = {
    register,
    serverUp: new Gauge({ name: "sourcingpick_up", help: "1 quand le serveur est stable", registers: [register] }),
    databaseUp: new Gauge({ name: "sourcingpick_db_up", help: "1 quand la base répond", registers: [register] }),
    memoryMb: new Gauge({ name: "sourcingpick_memory_mb", help: "Mémoire du processus en mégaoctets", registers: [register] }),
    loopLag: new Gauge({ name: "sourcingpick_event_loop_lag_ms", help: "Délai de la boucle d’événements en millisecondes", registers: [register] }),
    httpRequests: new Counter({
      name: "sourcingpick_http_requests_total",
      help: "Nombre de requêtes HTTP",
      labelNames: ["method", "route"],
      registers: [register],
    }),
    httpDuration: new Histogram({
      name: "sourcingpick_http_duration_seconds",
      help: "Durée des requêtes HTTP",
      labelNames: ["method", "route"],
      buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
      registers: [register],
    }),
  };
  slot.__spMetrics = created;
  return created;
}

const metrics = bag();

export const register = metrics.register;
export const serverUp = metrics.serverUp;
export const databaseUp = metrics.databaseUp;
export const memoryMb = metrics.memoryMb;
export const loopLag = metrics.loopLag;
export const httpRequests = metrics.httpRequests;
export const httpDuration = metrics.httpDuration;

export function routeLabel(pathname: string) {
  if (pathname === "/sante" || pathname === "/metrics") return pathname;
  if (pathname.startsWith("/api/")) return "/api";
  if (pathname.startsWith("/imprimer")) return "/imprimer";
  if (pathname.startsWith("/assets") || pathname.startsWith("/illustrations")) return "/assets";
  return "page";
}
