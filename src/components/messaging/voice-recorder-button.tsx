"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mic01Icon,
  StopCircleIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Voice-note recorder for the messaging composer. Press to start, press
 * again to stop and queue the recording into the pendingFiles state of
 * the parent thread component.
 *
 * Mime hand-off: the browser produces audio/webm (Chrome/Firefox) or
 * audio/mp4 (Safari) depending on what `MediaRecorder` negotiates. We
 * suffix the produced File's filename with `.webm-audio` so the server's
 * `classifyByExtension` treats it as AUDIO instead of VIDEO — see
 * src/lib/storage/attachments.ts for that contract.
 */
export function VoiceRecorderButton({
  onRecorded,
  disabled,
}: {
  onRecorded: (file: File) => void;
  disabled?: boolean;
}) {
  const dict = useDictionary();
  const t = dict.messaging.voice;
  const [recording, setRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const tickerRef = useRef<number | null>(null);
  const cancelOnStopRef = useRef(false);

  const stopTicker = () => {
    if (tickerRef.current !== null) {
      window.clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  };

  const teardown = () => {
    stopTicker();
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
    startedAtRef.current = null;
    setRecording(false);
    setElapsedMs(0);
  };

  useEffect(() => () => teardown(), []);

  const start = async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError(t.unsupported);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      cancelOnStopRef.current = false;
      rec.addEventListener("dataavailable", (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      });
      rec.addEventListener("stop", () => {
        const wasCancelled = cancelOnStopRef.current;
        const blob = new Blob(chunksRef.current, {
          type: rec.mimeType || "audio/webm",
        });
        teardown();
        if (wasCancelled || blob.size === 0) return;
        // Suffix `.webm-audio` so the server classifies as AUDIO. The
        // displayed name still ends with `.webm` for download UX.
        const baseName = `voice-${Date.now()}.webm`;
        const file = new File([blob], `${baseName}-audio`, {
          type: blob.type,
          lastModified: Date.now(),
        });
        onRecorded(file);
      });
      recorderRef.current = rec;
      rec.start();
      startedAtRef.current = Date.now();
      setRecording(true);
      tickerRef.current = window.setInterval(() => {
        if (startedAtRef.current) {
          setElapsedMs(Date.now() - startedAtRef.current);
        }
      }, 200);
    } catch {
      setError(t.permissionDenied);
      teardown();
    }
  };

  const stop = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      cancelOnStopRef.current = false;
      recorderRef.current.stop();
    }
  };

  const cancel = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      cancelOnStopRef.current = true;
      recorderRef.current.stop();
    } else {
      teardown();
    }
  };

  if (recording) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft/40 text-danger pl-2 pr-1 py-1">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full bg-danger animate-pulse"
        />
        <span className="text-[11px] font-mono tabular-nums" aria-live="polite">
          {formatElapsed(elapsedMs)}
        </span>
        <button
          type="button"
          onClick={stop}
          aria-label={t.stop}
          className="inline-flex items-center justify-center h-6 w-6 rounded-full text-danger hover:bg-danger/10 transition-colors duration-fast"
        >
          <HugeiconsIcon icon={StopCircleIcon} size={16} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={cancel}
          aria-label={t.cancel}
          className="inline-flex items-center justify-center h-6 w-6 rounded-full text-muted hover:bg-subtle transition-colors duration-fast"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.5} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={start}
        disabled={disabled}
        aria-label={t.start}
        className={cn(
          "inline-flex items-center justify-center h-7 w-7 rounded-full",
          "text-muted hover:text-fg hover:bg-subtle transition-colors duration-fast",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        <HugeiconsIcon icon={Mic01Icon} size={14} strokeWidth={1.5} />
      </button>
      {error && <span className="text-[10px] text-danger">{error}</span>}
    </div>
  );
}

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
