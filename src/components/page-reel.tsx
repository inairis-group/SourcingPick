import { useEffect, useRef, useState, type ReactNode } from "react";

const DWELL = 4500;

export function PageReel({ children, onDone, running = true }: { children: ReactNode; onDone: () => void; running?: boolean }) {
  const scroller = useRef<HTMLDivElement>(null);
  const stops = useRef<number[]>([0]);
  const index = useRef(0);
  const done = useRef(onDone);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [play, setPlay] = useState(false);
  done.current = onDone;

  function place(node: HTMLElement, el: HTMLElement) {
    return Math.max(0, Math.round(node.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop));
  }

  function collect() {
    const el = scroller.current;
    if (!el) return;
    const next: number[] = [];
    const view = Math.max(1, el.clientHeight);
    const paper = el.querySelector<HTMLElement>(".paper-view");
    if (paper) {
      const top = place(paper, el);
      const bottom = top + paper.offsetHeight;
      for (let y = top; y < bottom - 24; y += view) next.push(y);
    }
    el.querySelectorAll<HTMLElement>(".contract-sheet").forEach((node) => next.push(place(node, el)));
    const unique = [...new Set(next.length ? next : [0])];
    stops.current = unique;
    setPages(unique.length);
    if (index.current > unique.length - 1) {
      index.current = unique.length - 1;
      setPage(index.current);
    }
    if (unique.length <= 1) done.current();
  }

  function go(next: number) {
    const el = scroller.current;
    if (!el) return;
    const max = stops.current.length - 1;
    const target = Math.max(0, Math.min(max, next));
    index.current = target;
    setPage(target);
    el.scrollTo({ top: stops.current[target] ?? 0, behavior: "smooth" });
    if (target >= max) done.current();
  }

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    collect();
    const ro = new ResizeObserver(() => collect());
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    const pause = () => {
      setPlay(false);
      const host = scroller.current;
      if (!host) return;
      const y = host.scrollTop + 8;
      let current = 0;
      stops.current.forEach((stop, n) => {
        if (stop <= y) current = n;
      });
      index.current = current;
      setPage(current);
      if (current >= stops.current.length - 1) done.current();
    };
    el.addEventListener("wheel", pause, { passive: true });
    el.addEventListener("touchstart", pause, { passive: true });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (running && !reduced) setPlay(true);
    else done.current();
    return () => {
      ro.disconnect();
      el.removeEventListener("wheel", pause);
      el.removeEventListener("touchstart", pause);
    };
  }, [running]);

  useEffect(() => {
    if (!play) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const max = stops.current.length - 1;
      if (index.current >= max) {
        setPlay(false);
        done.current();
        return;
      }
      go(index.current + 1);
    }, DWELL);
    return () => window.clearInterval(id);
  }, [play]);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="font-semibold">Document · page {page + 1} / {pages}</p>
        <div className="flex gap-2">
          <button className="btn btn-quiet h-9 min-h-9 px-3" type="button" onClick={() => go(index.current - 1)} disabled={page === 0}>Précédente</button>
          <button className="btn btn-quiet h-9 min-h-9 px-3" type="button" onClick={() => setPlay((value) => !value)}>
            {play ? "Pause" : "Défilement"}
          </button>
          <button className="btn btn-quiet h-9 min-h-9 px-3" type="button" onClick={() => go(index.current + 1)} disabled={page + 1 >= pages}>Suivante</button>
        </div>
      </div>
      <div className="mb-2 h-1 overflow-hidden rounded-full bg-[#dce3f2]">
        <div className="h-full bg-[#155dfc] transition-[width] duration-500" style={{ width: `${(pages ? (page + 1) / pages : 1) * 100}%` }} />
      </div>
      <div ref={scroller} className="page-reel overflow-y-auto scroll-smooth rounded-[18px]">
        <div className="grid justify-items-center">{children}</div>
      </div>
    </div>
  );
}
