"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlayIcon,
  PauseIcon,
} from "@hugeicons/core-free-icons";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Voice-note player used in both the chat bubble and the recorder
 * preview. Behaviour:
 *   - Decodes the audio once (Web Audio API) to compute waveform peaks
 *     for a static bar chart. Falls back to a flat bar row if decoding
 *     fails (unsupported codec / very short clip).
 *   - Play/pause toggle.
 *   - Click on any bar to seek.
 *   - Speed pill cycles 1× → 1.25× → 1.5× → 2× → 1×.
 */

const SPEEDS = [1, 1.25, 1.5, 2] as const;
type Speed = (typeof SPEEDS)[number];

const BUCKETS = 48;

export type VoicePlayerVariant = "incoming" | "outgoing" | "preview";

export function VoicePlayer({
  src,
  variant = "incoming",
  initialPlaybackRate = 1,
  className,
}: {
  src: string;
  variant?: VoicePlayerVariant;
  initialPlaybackRate?: Speed;
  className?: string;
}) {
  const dict = useDictionary();
  const t = dict.messaging.voice;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [speed, setSpeed] = useState<Speed>(initialPlaybackRate);
  const [decodeFailed, setDecodeFailed] = useState(false);

  // Decode the audio to extract waveform peaks. Runs once per src — the
  // expensive `decodeAudioData` call shouldn't fire on every render.
  useEffect(() => {
    let cancelled = false;
    setPeaks(null);
    setDecodeFailed(false);

    (async () => {
      try {
        const AC =
          typeof window === "undefined"
            ? null
            : ((window.AudioContext ??
                (window as unknown as { webkitAudioContext?: typeof AudioContext })
                  .webkitAudioContext) || null);
        if (!AC) {
          setDecodeFailed(true);
          return;
        }
        const ctx = new AC();
        const res = await fetch(src);
        if (!res.ok) throw new Error("fetch failed");
        const buf = await res.arrayBuffer();
        // decodeAudioData mutates the buffer on some impls — copy first.
        const audioBuffer = await ctx.decodeAudioData(buf.slice(0));
        const channel = audioBuffer.getChannelData(0);
        const blockSize = Math.max(1, Math.floor(channel.length / BUCKETS));
        const out: number[] = [];
        for (let i = 0; i < BUCKETS; i++) {
          let sum = 0;
          let count = 0;
          const start = i * blockSize;
          for (let j = 0; j < blockSize; j++) {
            const v = channel[start + j];
            if (typeof v === "number") {
              sum += Math.abs(v);
              count++;
            }
          }
          out.push(count > 0 ? sum / count : 0);
        }
        const max = Math.max(...out);
        const normalised = max > 0 ? out.map((p) => p / max) : out;
        // Close the context — we don't need it for playback (the <audio>
        // tag does its own decoding via the media pipeline).
        ctx.close().catch(() => {});
        if (!cancelled) setPeaks(normalised);
      } catch {
        if (!cancelled) setDecodeFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src]);

  // Keep playbackRate on the <audio> in sync with the pill state.
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  // Stop playback when the source changes or we unmount.
  useEffect(() => {
    const el = audioRef.current;
    return () => {
      if (el) {
        el.pause();
      }
    };
  }, []);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.playbackRate = speed;
      void el.play();
    } else {
      el.pause();
    }
  }, [speed]);

  const cycleSpeed = () => {
    setSpeed((s) => {
      const idx = SPEEDS.indexOf(s);
      return SPEEDS[(idx + 1) % SPEEDS.length] ?? 1;
    });
  };

  const onSeek = (bucketIndex: number) => {
    const el = audioRef.current;
    if (!el || !duration || !Number.isFinite(duration)) return;
    const ratio = (bucketIndex + 0.5) / BUCKETS;
    el.currentTime = ratio * duration;
    setCurrentTime(el.currentTime);
  };

  const progressRatio =
    duration > 0 && Number.isFinite(duration)
      ? Math.min(1, Math.max(0, currentTime / duration))
      : 0;

  const palette = paletteFor(variant);

  // Use a flat row of equal-height bars while peaks are loading. Better
  // visual stability than rendering nothing and snapping in.
  const displayPeaks =
    peaks ?? (decodeFailed ? FLAT_FALLBACK : LOADING_FLAT);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-2 py-1.5 w-full",
        palette.shell,
        className,
      )}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? t.pause : t.play}
        className={cn(
          "inline-flex items-center justify-center h-8 w-8 shrink-0 rounded-full",
          palette.button,
          "transition-colors duration-fast",
        )}
      >
        <HugeiconsIcon
          icon={isPlaying ? PauseIcon : PlayIcon}
          size={14}
          strokeWidth={2}
        />
      </button>

      <div
        className="flex-1 min-w-0 flex items-center gap-px h-7 cursor-pointer"
        role="slider"
        aria-label={t.scrubLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progressRatio * 100)}
        tabIndex={0}
        onClick={(e) => {
          // Translate horizontal click position into a bucket index.
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, x / rect.width));
          onSeek(Math.floor(ratio * BUCKETS));
        }}
        onKeyDown={(e) => {
          const el = audioRef.current;
          if (!el || !duration) return;
          if (e.key === "ArrowRight") {
            e.preventDefault();
            el.currentTime = Math.min(duration, el.currentTime + 2);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            el.currentTime = Math.max(0, el.currentTime - 2);
          }
        }}
      >
        {displayPeaks.map((p, i) => {
          const played = i / BUCKETS < progressRatio;
          // Minimum bar height so silence still reads as bars, not gaps.
          const h = Math.max(0.12, p);
          return (
            <span
              key={i}
              className={cn(
                "block w-0.5 rounded-full",
                played ? palette.barOn : palette.barOff,
              )}
              style={{ height: `${Math.round(h * 100)}%` }}
            />
          );
        })}
      </div>

      <span
        className={cn(
          "text-[10px] font-mono tabular-nums shrink-0 min-w-[34px] text-end",
          palette.time,
        )}
        aria-label={t.elapsedLabel}
      >
        {formatTime(isPlaying || progressRatio > 0 ? currentTime : duration)}
      </span>

      <button
        type="button"
        onClick={cycleSpeed}
        aria-label={t.speedLabel}
        className={cn(
          "inline-flex items-center justify-center h-6 px-2 rounded-full text-[10px] font-semibold shrink-0",
          palette.speed,
          "transition-colors duration-fast",
        )}
      >
        {formatSpeed(speed)}
      </button>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onTimeUpdate={(e) =>
          setCurrentTime((e.target as HTMLAudioElement).currentTime)
        }
        onLoadedMetadata={(e) => {
          const d = (e.target as HTMLAudioElement).duration;
          setDuration(Number.isFinite(d) ? d : 0);
        }}
        onDurationChange={(e) => {
          const d = (e.target as HTMLAudioElement).duration;
          setDuration(Number.isFinite(d) ? d : 0);
        }}
        className="hidden"
      />
    </div>
  );
}

type Palette = {
  shell: string;
  button: string;
  barOn: string;
  barOff: string;
  time: string;
  speed: string;
};

function paletteFor(variant: VoicePlayerVariant): Palette {
  switch (variant) {
    case "outgoing":
      return {
        shell: "bg-on-action/10",
        button: "bg-on-action/25 text-on-action hover:bg-on-action/35",
        barOn: "bg-on-action",
        barOff: "bg-on-action/35",
        time: "text-on-action/85",
        speed: "bg-on-action/20 text-on-action hover:bg-on-action/30",
      };
    case "preview":
      return {
        shell: "bg-subtle border border-line",
        button: "bg-action text-on-action hover:bg-action/90",
        barOn: "bg-action",
        barOff: "bg-line",
        time: "text-muted",
        speed: "bg-surface border border-line text-fg hover:bg-subtle",
      };
    case "incoming":
    default:
      return {
        shell: "bg-surface",
        button: "bg-action text-on-action hover:bg-action/90",
        barOn: "bg-action",
        barOff: "bg-line-strong/60",
        time: "text-muted",
        speed: "bg-subtle text-fg hover:bg-line",
      };
  }
}

const LOADING_FLAT = Array.from({ length: BUCKETS }, () => 0.12);
const FLAT_FALLBACK = Array.from({ length: BUCKETS }, (_, i) =>
  // A subtle sine so a failed-decode bubble still looks like a wave.
  0.25 + Math.abs(Math.sin((i / BUCKETS) * Math.PI * 2)) * 0.45,
);

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatSpeed(speed: Speed): string {
  // 1× / 1.25× / 1.5× / 2× — drop trailing zeros for the clean ones.
  if (speed === 1) return "1×";
  if (speed === 2) return "2×";
  return `${speed}×`;
}
