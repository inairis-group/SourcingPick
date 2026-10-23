"use client";

import { useEffect } from "react";
import { fitFrame } from "./frame-fit";

/** The effect half of frame-fit.ts: covers a visit that starts outside this layout. */
export function FrameFitEffect() {
  useEffect(fitFrame, []);
  return null;
}
