import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics, register as globalRegister } from "@prometheus-io/client";

type Bag = {
  register: Registry;
  serverUp: Gauge;
  databaseUp: Gauge;
  memoryMb: Gauge;
  loopLag: Gauge;
  httpRequests: Counter<string>;
  httpResponses: Counter<string>;
  httpDuration: Histogram<string>;
  appErrors: Counter<string>;
  sqlDuration: Histogram<string>;
  sqlSlow: Counter<string>;
  cacheEvents: Counter<string>;
  redisPing: Gauge;
  netRtt: Gauge;
  siteRtt: Gauge;
};

const slot = globalThis as typeof globalThis & { __spMetrics?: Bag; __spRegistry?: Registry };

function take<T>(register: Registry, name: string, create: () => T): T {
  const found = (register.getSingleMetric(name) || globalRegister.getSingleMetric(name)) as T | undefined;
  if (found) return found;
  try {
    return create();
  } catch {
    const again = (register.getSingleMetric(name) || globalRegister.getSingleMetric(name)) as T | undefined;
    if (again) return again;
    try {
      globalRegister.removeSingleMetric(name);
    } catch {
      /* déjà absent */
    }
    try {
      register.removeSingleMetric(name);
    } catch {
      /* déjà absent */
    }
    return create();
  }
}

function bag(): Bag {
  if (slot.__spMetrics) return slot.__spMetrics;
  const register = slot.__spRegistry ?? new Registry();
  slot.__spRegistry = register;
  try {
    collectDefaultMetrics({ register });
  } catch {
    /* un second chargement SSR a déjà posé les métriques de process */
  }
  const created: Bag = {
    register,
    serverUp: take(register, "sourcingpick_up", () => new Gauge({ name: "sourcingpick_up", help: "1 quand le serveur est stable", registers: [register] })),
    databaseUp: take(register, "sourcingpick_db_up", () => new Gauge({ name: "sourcingpick_db_up", help: "1 quand la base répond", registers: [register] })),
    memoryMb: take(register, "sourcingpick_memory_mb", () => new Gauge({ name: "sourcingpick_memory_mb", help: "Mémoire du processus en mégaoctets", registers: [register] })),
    loopLag: take(register, "sourcingpick_event_loop_lag_ms", () => new Gauge({ name: "sourcingpick_event_loop_lag_ms", help: "Délai de la boucle d’événements en millisecondes", registers: [register] })),
    httpRequests: take(
      register,
      "sourcingpick_http_requests_total",
      () =>
        new Counter({
          name: "sourcingpick_http_requests_total",
          help: "Nombre de requêtes HTTP",
          labelNames: ["method", "route"],
          registers: [register],
        }),
    ),
    httpResponses: take(
      register,
      "sourcingpick_http_responses_total",
      () =>
        new Counter({
          name: "sourcingpick_http_responses_total",
          help: "Réponses HTTP par statut",
          labelNames: ["method", "route", "status"],
          registers: [register],
        }),
    ),
    httpDuration: take(
      register,
      "sourcingpick_http_duration_seconds",
      () =>
        new Histogram({
          name: "sourcingpick_http_duration_seconds",
          help: "Durée des requêtes HTTP",
          labelNames: ["method", "route"],
          buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
          registers: [register],
        }),
    ),
    appErrors: take(
      register,
      "sourcingpick_app_errors_total",
      () =>
        new Counter({
          name: "sourcingpick_app_errors_total",
          help: "Erreurs applicatives enregistrées",
          labelNames: ["source"],
          registers: [register],
        }),
    ),
    sqlDuration: take(
      register,
      "sourcingpick_sql_duration_seconds",
      () =>
        new Histogram({
          name: "sourcingpick_sql_duration_seconds",
          help: "Durée des requêtes SQL",
          labelNames: ["op"],
          buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2],
          registers: [register],
        }),
    ),
    sqlSlow: take(
      register,
      "sourcingpick_sql_slow_total",
      () =>
        new Counter({
          name: "sourcingpick_sql_slow_total",
          help: "Requêtes SQL plus lentes que 50 ms",
          labelNames: ["op"],
          registers: [register],
        }),
    ),
    cacheEvents: take(
      register,
      "sourcingpick_cache_events_total",
      () =>
        new Counter({
          name: "sourcingpick_cache_events_total",
          help: "Lectures de cache",
          labelNames: ["result"],
          registers: [register],
        }),
    ),
    redisPing: take(register, "sourcingpick_redis_ping_ms", () => new Gauge({ name: "sourcingpick_redis_ping_ms", help: "Aller-retour vers Redis en millisecondes", registers: [register] })),
    netRtt: take(register, "sourcingpick_net_rtt_ms", () => new Gauge({ name: "sourcingpick_net_rtt_ms", help: "Latence réseau vers l’extérieur en millisecondes", registers: [register] })),
    siteRtt: take(register, "sourcingpick_site_rtt_ms", () => new Gauge({ name: "sourcingpick_site_rtt_ms", help: "Temps de réponse public du site en millisecondes", registers: [register] })),
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
export const httpResponses = metrics.httpResponses;
export const httpDuration = metrics.httpDuration;
export const appErrors = metrics.appErrors;
export const sqlDuration = metrics.sqlDuration;
export const sqlSlow = metrics.sqlSlow;
export const cacheEvents = metrics.cacheEvents;
export const redisPing = metrics.redisPing;
export const netRtt = metrics.netRtt;
export const siteRtt = metrics.siteRtt;

export function routeLabel(pathname: string) {
  if (pathname === "/sante" || pathname === "/metrics") return pathname;
  if (pathname.startsWith("/api/")) return "/api";
  if (pathname.startsWith("/imprimer")) return "/imprimer";
  if (pathname.startsWith("/assets") || pathname.startsWith("/illustrations")) return "/assets";
  return "page";
}