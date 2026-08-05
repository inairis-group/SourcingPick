"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * The new-message sound.
 *
 * Synthesised with WebAudio rather than shipped as an mp3: it's two sine
 * tones, so a file would be 20 KB and one more request for something we can
 * describe in six lines. It also keeps the marketing pages free of an audio
 * asset that a strict CSP would have to allow.
 *
 * Two things browsers make us respect:
 *
 *  - An AudioContext created before any user gesture starts suspended. We
 *    create it lazily on the first chime attempt and try to resume; if the
 *    visitor hasn't interacted yet the sound is simply skipped rather than
 *    queued to fire later out of context.
 *  - Sound is intrusive. The preference is remembered per browser and
 *    defaults to on for a chat surface the user opened deliberately.
 */

const STORAGE_KEY = "sp_chime_muted";

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

const muteListeners = new Set<() => void>();

function subscribeToMute(onChange: () => void): () => void {
  muteListeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    muteListeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function readMute(): boolean {
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

/** Two short notes, second slightly higher — reads as "arrived", not "error". */
export function playChime(): void {
  const ac = audioContext();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  if (ac.state !== "running") return;

  const now = ac.currentTime;
  for (const [index, freq] of [660, 880].entries()) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;

    const start = now + index * 0.11;
    // Ramped rather than switched: an abrupt gain change clicks.
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.09, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);

    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + 0.15);
  }
}

/**
 * Chime for inbound messages, with a remembered mute.
 *
 * `notify(count)` is called with the current number of messages from the other
 * side. It rings when that number grows — never on first load, since every
 * message is "new" then and a page refresh would sound like a conversation.
 */
export function useMessageChime(initialInbound?: number): {
  muted: boolean;
  setMuted: (v: boolean) => void;
  notify: (inboundCount: number) => void;
} {
  /**
   * localStorage read through useSyncExternalStore rather than an effect that
   * calls setState: the server snapshot is a plain `false`, so there's no
   * hydration mismatch and no cascading render. It also means a mute toggled
   * in one tab lands in the others, since `storage` fires cross-tab.
   */
  const muted = useSyncExternalStore(subscribeToMute, readMute, () => false);
  /**
   * Pass `initialInbound` when the messages were server-rendered: the ref's
   * initial value is read once, so the baseline is set on the first render
   * rather than by an effect that could re-seed and ring twice.
   *
   * Leave it undefined when the list loads asynchronously — the first
   * `notify` then establishes the baseline silently.
   */
  const seen = useRef<number | null>(initialInbound ?? null);

  const setMuted = useCallback((v: boolean) => {
    window.localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    // `storage` doesn't fire in the tab that wrote it — tell our own
    // subscribers directly, or the button wouldn't update itself.
    muteListeners.forEach((fn) => fn());
  }, []);

  const notify = useCallback(
    (inboundCount: number) => {
      const previous = seen.current;
      seen.current = inboundCount;
      if (previous === null || inboundCount <= previous) return;
      if (!muted) playChime();
    },
    [muted],
  );

  return { muted, setMuted, notify };
}
