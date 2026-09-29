import { useEffect, useState } from "react";
import { fxRate } from "@/lib/fx.functions";
import { parseFxLabel, type FxQuote } from "@/lib/fx.shared";

export function useFxRate(fallbackLabel = "7,60") {
  const [rate, setRate] = useState<FxQuote>(() => ({
    cnyPerEur: parseFxLabel(fallbackLabel),
    asOf: "",
    source: "label",
    fetchedAt: 0,
  }));
  useEffect(() => {
    let live = true;
    fxRate()
      .then((value) => {
        if (live && value && value.cnyPerEur > 0) setRate(value);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  return rate;
}
