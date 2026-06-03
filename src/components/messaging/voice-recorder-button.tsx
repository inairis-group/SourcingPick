"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mic01Icon,
  StopCircleIcon,
  Cancel01Icon,
  Sent02Icon,
} from "@hugeicons/core-free-icons";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";
import { VoicePlayer } from "./voice-player";

/**
 * Voice-note recorder for the messaging composer. Three states:
 *   - Idle:    a single mic button.
 *   - Recording: live timer with stop / cancel pill.
 *   - Preview:  the freshly recorded clip rendered through `VoicePlayer`
 *               with send + discard buttons. The user can play back the
 *               clip at any of the supported speeds before committing.
 *
 * Mime hand-off: the browser produces audio/webm (Chrome/Firefox) or
 * audio/mp4 (Safari) depending on what `MediaRecorder` negotiates. We
 * suffix the produced File's filename with `.webm-audio` so the server's
 * `classifyByExtension` treats it as AUDIO instead of VIDEO — see
 * src/lib/storage/attachments.ts for that contract.
 */
export function VoiceRecorderButton({
  onRecorded,
  onActiveChange,
  disabled,
}: {
  onRecorded: (file: File) => void;
  /**
   * Fires `true` whenever the recorder is in recording or preview state,
   * `false` once it returns to idle. The chat composer uses this to swap
   * the text input out for the recorder's full-width UI — partner
   * feedback: "make it feel like a chat".
   */
  onActiveChange?: (active: boolean) => void;
  disabled?: boolean;
}) {
  const dict = useDictionary();
  const t = dict.messaging.voice;
  const [recording, setRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Preview state: the recorded blob is held here as a temporary
  // object-URL until the user decides to send or discard.
  const [preview, setPreview] = useState<{
    file: File;
    url: string;
  } | null>(null);

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

  // Free the preview object-URL when it changes or the component unmounts.
  useEffect(() => {
    if (!preview) return;
    return () => {
      URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  useEffect(() => () => teardown(), []);

  // Surface the active state to the parent so it can collapse the rest
  // of the composer while a recording is in flight.
  useEffect(() => {
    onActiveChange?.(recording || preview !== null);
  }, [recording, preview, onActiveChange]);

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
        setPreview({ file, url: URL.createObjectURL(blob) });
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

  const discardPreview = () => {
    setPreview(null);
  };

  const sendPreview = () => {
    if (!preview) return;
    const file = preview.file;
    setPreview(null);
    onRecorded(file);
  };

  // ---- preview row — fills the composer when hosted in the chat input ----
  if (preview) {
    return (
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 min-w-0">
          <VoicePlayer src={preview.url} variant="preview" />
        </div>
        <button
          type="button"
          onClick={discardPreview}
          aria-label={t.discard}
          className={cn(
            "inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-full",
            "text-muted hover:text-danger hover:bg-danger-soft/50",
            "transition-colors duration-fast",
          )}
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={sendPreview}
          aria-label={t.sendPreview}
          className={cn(
            "inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-full",
            "bg-action text-on-action hover:bg-action/90 shadow-sm",
            "transition-colors duration-fast",
          )}
        >
          <HugeiconsIcon icon={Sent02Icon} size={16} strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  if (recording) {
    return (
      <div className="flex items-center gap-2 w-full">
        <div
          className={cn(
            "flex-1 min-w-0 flex items-center gap-2 h-9 px-3 rounded-full",
            "bg-danger-soft/40 text-danger",
          )}
        >
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full bg-danger animate-pulse shrink-0"
          />
          <span
            className="text-[11px] font-mono tabular-nums shrink-0"
            aria-live="polite"
          >
            {formatElapsed(elapsedMs)}
          </span>
          <span className="text-[11px] text-danger/80 truncate">
            {t.recordingHint}
          </span>
        </div>
        <button
          type="button"
          onClick={cancel}
          aria-label={t.cancel}
          className="inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-full text-muted hover:bg-subtle transition-colors duration-fast"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={stop}
          aria-label={t.stop}
          className={cn(
            "inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-full",
            "bg-danger text-white hover:bg-danger/90 shadow-sm",
            "transition-colors duration-fast",
          )}
        >
          <HugeiconsIcon icon={StopCircleIcon} size={18} strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      disabled={disabled}
      aria-label={t.start}
      className={cn(
        "inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-full",
        "text-muted hover:text-fg hover:bg-subtle transition-colors duration-fast",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        error && "text-danger",
      )}
      title={error ?? undefined}
    >
      <HugeiconsIcon icon={Mic01Icon} size={18} strokeWidth={1.5} />
    </button>
  );
}

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
