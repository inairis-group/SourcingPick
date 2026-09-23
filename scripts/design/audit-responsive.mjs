#!/usr/bin/env node
/**
 * Measure the marketing site for horizontal overflow in a real engine.
 *
 * For every route × viewport width it loads the page over CDP and reports
 *   - document.scrollWidth − clientWidth (any positive number is a failure:
 *     the page pans sideways on a phone);
 *   - every *outermost* element whose bounding box leaves the viewport on
 *     either side (RTL pages bleed to the left), including boxes an
 *     `overflow:hidden` ancestor clips — a sliced-off headline is still a bug
 *     even when it does not move the scrollbar.
 *
 * The verify script proves the words are right; this one proves they fit.
 *
 * Usage:
 *   node --experimental-websocket scripts/design/audit-responsive.mjs \
 *     http://localhost:3311 [--locales en,ar] [--widths 320,390,...] \
 *     [--paths /,/services] [--json out.json] [--shots] [--cdp 127.0.0.1:9222]
 *
 * Needs a headless Chromium with remote debugging on --cdp (default :9222).
 * Screenshots go under $HOME/sp-shots/audit/ — the snap-confined browser
 * cannot write anywhere else.
 */

const argv = process.argv.slice(2);
const base = argv.find((a) => a.startsWith("http")) ?? "http://localhost:3311";
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const flag = (name) => argv.includes(`--${name}`);

const LOCALES = opt("locales", "en").split(",");
const WIDTHS = opt("widths", "320,390,430,768,1024,1280,1440,1920").split(",").map(Number);
const PATHS = opt(
  "paths",
  "/,/services,/comment-ca-marche,/entrepot,/pricing,/faq,/devis,/contact,/about,/application,/legal/mentions-legales,/legal/privacy,/this-page-does-not-exist",
).split(",");
const JSON_OUT = opt("json", null);
const SHOTS = flag("shots");
const CDP = opt("cdp", "127.0.0.1:9222");

const fs = await import("node:fs/promises");
const path = await import("node:path");

const targets = await (await fetch(`http://${CDP}/json/list`)).json();
const page = targets.find((t) => t.type === "page");
if (!page) throw new Error(`no page target on ${CDP}`);
const ws = new WebSocket(page.webSocketDebuggerUrl);
let seq = 0;
const pending = new Map();
const listeners = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  } else if (m.method && listeners.has(m.method)) {
    for (const fn of listeners.get(m.method)) fn(m.params);
  }
});
await new Promise((r) => ws.addEventListener("open", r));
const send = (method, params = {}) =>
  new Promise((res) => {
    const n = ++seq;
    pending.set(n, res);
    ws.send(JSON.stringify({ id: n, method, params }));
  });
const once = (method) =>
  new Promise((res) => {
    const fn = (p) => {
      listeners.get(method).delete(fn);
      res(p);
    };
    if (!listeners.has(method)) listeners.set(method, new Set());
    listeners.get(method).add(fn);
  });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const evaluate = async (expression) => {
  const { result } = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails)
    throw new Error(JSON.stringify(result.exceptionDetails).slice(0, 500));
  return result.result?.value;
};
await send("Page.enable");

// Runs in the page. Outermost offenders only: a paragraph that overflows
// because its section does is the section's fault, and listing every
// descendant would bury the cause.
const PROBE = `(() => {
  const d = document.documentElement;
  const W = d.clientWidth;
  const bad = [];
  const isBad = (el) => {
    if (el.closest('[data-audit-ignore]')) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (cs.position === 'fixed') return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    const out = r.right > W + 1 || r.left < -1;
    if (!out) return false;
    // A picture cropped by its own frame is a crop, not a layout failure —
    // the phone artboard draws the hero illustration wider than its strip.
    // Same for a decorative box (pointer-events: none) leaning out of a
    // band. Text clipped by a frame is still reported.
    if (el.tagName === 'IMG' || cs.pointerEvents === 'none') {
      let p = el.parentElement;
      while (p && p !== document.body) {
        const pc = getComputedStyle(p);
        if (pc.overflow === 'hidden' || pc.overflowX === 'hidden' || pc.overflowX === 'clip') {
          const pr = p.getBoundingClientRect();
          return pr.right > W + 1 || pr.left < -1;
        }
        p = p.parentElement;
      }
    }
    return true;
  };
  const walk = (el) => {
    // A fixed box (progress bar, contact dock) and everything in it sits
    // outside the page's flow and cannot move the scrollbar.
    if (getComputedStyle(el).position === 'fixed') return;
    if (isBad(el)) {
      const r = el.getBoundingClientRect();
      const text = (el.innerText || el.getAttribute('alt') || '').replace(/\\s+/g, ' ').trim().slice(0, 40);
      const style = el.getAttribute('style') || '';
      const m = style.match(/(?:^|;)(width|grid-template-columns|position|left|right|min-width)[^;]*/g);
      bad.push({
        tag: el.tagName.toLowerCase(),
        cls: el.className && typeof el.className === 'string' ? el.className.split(' ').filter(Boolean).slice(0, 2).join('.') : '',
        left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
        hint: m ? m.map((s) => s.replace(/^;/, '')).join('; ').slice(0, 80) : '',
        text,
      });
      return; // do not descend: children overflow because this one does
    }
    for (const c of el.children) walk(c);
  };
  walk(document.body);
  return { scrollW: d.scrollWidth, clientW: W, bad };
})()`;

const slug = (p) => (p === "/" ? "home" : p.replace(/^\//, "").replace(/\//g, "-"));
const results = [];

for (const loc of LOCALES) {
  for (const p of PATHS) {
    const route = `/${loc}${p === "/" ? "" : p}`;
    const rows = [];
    for (const w of WIDTHS) {
      await send("Emulation.setDeviceMetricsOverride", {
        width: w,
        height: 900,
        deviceScaleFactor: 1,
        mobile: w < 800,
      });
      const loaded = once("Page.loadEventFired");
      await send("Page.navigate", { url: `${base}${route}` });
      await Promise.race([loaded, wait(15000)]);
      // Fonts and the intro animation settle after load; measure after both.
      await evaluate("document.fonts ? document.fonts.ready.then(() => true) : true");
      await wait(400);
      const v = await evaluate(PROBE);
      const bleed = v.scrollW - v.clientW;
      rows.push({ width: w, bleed, offenders: v.bad });
      if (SHOTS) {
        const dir = path.join(process.env.HOME, "sp-shots", "audit");
        await fs.mkdir(dir, { recursive: true });
        const total = await evaluate("document.documentElement.scrollHeight");
        // Entrances driven by view() timelines and IntersectionObserver
        // only play for boxes that reach the viewport; a capture of the
        // whole page from a 900px window would show them at opacity 0.
        // The window is grown to the page for the shots, then restored.
        await send("Emulation.setDeviceMetricsOverride", {
          width: w,
          height: Math.min(total, 16000),
          deviceScaleFactor: 1,
          mobile: w < 800,
        });
        await wait(700);
        const SLICE = 1600;
        for (let y = 0, i = 0; y < total && i < 8; y += SLICE, i++) {
          const shot = await send("Page.captureScreenshot", {
            format: "png",
            captureBeyondViewport: true,
            clip: { x: 0, y, width: w, height: Math.min(SLICE, total - y), scale: 1 },
          });
          await fs.writeFile(
            path.join(dir, `${loc}-${slug(p)}-${w}-${i}.png`),
            Buffer.from(shot.result.data, "base64"),
          );
        }
      }
    }
    results.push({ locale: loc, path: p, rows });

    console.log(`\n${route}`);
    for (const r of rows) {
      const state =
        r.bleed > 0 ? `BLEED +${r.bleed}` : r.offenders.length ? "clipped " : "ok      ";
      console.log(`  ${String(r.width).padStart(4)}  ${state}  ${r.offenders.length} outside`);
      for (const o of r.offenders.slice(0, 5)) {
        const box = `[${o.left}..${o.right}] w${o.width}`;
        console.log(
          `          ${o.tag}${o.cls ? "." + o.cls : ""} ${box}  ${o.hint}  ${o.text ? JSON.stringify(o.text) : ""}`,
        );
      }
    }
  }
}

// Summary matrix: one line per route, one cell per width.
console.log("\nSUMMARY  (bleed px / boxes outside viewport)");
console.log("route".padEnd(34) + WIDTHS.map((w) => String(w).padStart(9)).join(""));
let failures = 0;
for (const r of results) {
  const cells = r.rows.map((row) => {
    if (row.bleed > 0 || row.offenders.length) failures++;
    const cell = `${row.bleed > 0 ? "+" + row.bleed : "0"}/${row.offenders.length}`;
    return cell.padStart(9);
  });
  console.log(`${r.locale}${r.path}`.padEnd(34) + cells.join(""));
}
console.log(`\n${failures} route×width cells with overflow or clipped boxes`);

if (JSON_OUT) await fs.writeFile(JSON_OUT, JSON.stringify(results, null, 1));
ws.close();
process.exit(failures ? 1 : 0);
