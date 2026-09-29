import { useEffect, useState } from "react";
import { fxRate } from "@/lib/fx.functions";
import { parseFxLabel, type FxQuote } from "@/lib/fx.shared";

const EVERY_MS = 30_000;

export function useFxRate(fallbackLabel = "7,60") {
  const [rate, setRate] = useState<FxQuote>(() => ({
    cnyPerEur: parseFxLabel(fallbackLabel),
    asOf: "",
    source: "label",
    fetchedAt: 0,
  }));
  useEffect(() => {
    let live = true;
    const pull = () => {
      if (document.hidden) return;
      fxRate()
        .then((value) => {
          if (live && value && value.cnyPerEur > 0) setRate(value);
        })
        .catch(() => {});
    };
    pull();
    const timer = window.setInterval(pull, EVERY_MS);
    document.addEventListener("visibilitychange", pull);
    return () => {
      live = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", pull);
    };
  }, []);
  return rate;
}