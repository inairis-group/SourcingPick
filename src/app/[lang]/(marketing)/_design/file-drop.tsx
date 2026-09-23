"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  ACCEPT_ATTR,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  formatBytes,
  validateQuoteFiles,
  type FileRejection,
} from "@/lib/quotes/files";
import { FILE_ERRORS } from "@/lib/quotes/file-copy";
import type { Locale } from "@/lib/i18n/config";

/**
 * The drop zone on the quote form.
 *
 * The canvas draws a dashed box with an upload arrow and the line "PDF, JPG or
 * PNG". It cannot draw a file having been chosen, so everything below the box
 * — the thumbnails, the sizes, the remove buttons, the running total — is
 * added here. The box itself is the transcription, passed through as children
 * and left alone.
 *
 * A `<input type="file" multiple>` cannot be assigned to, so the selection is
 * kept in a DataTransfer and written back to the input. That is what makes
 * "remove this one" possible at all: without it the only way to drop a file
 * from the selection is to start the whole selection again.
 *
 * Both limits are checked here and again on the server. This check exists so
 * somebody dragging a 90 MB video is told immediately rather than after the
 * upload; `files.ts` is the one that decides.
 */

const COPY: Record<
  Locale,
  { add: string; remove: string; total: (used: string, cap: string) => string }
> = {
  fr: {
    add: "Choisir des fichiers",
    remove: "Retirer",
    total: (u, c) => `${u} sur ${c}`,
  },
  en: {
    add: "Choose files",
    remove: "Remove",
    total: (u, c) => `${u} of ${c}`,
  },
  zh: {
    add: "选择文件",
    remove: "移除",
    total: (u, c) => `${u} / ${c}`,
  },
  ar: {
    add: "اختر الملفات",
    remove: "إزالة",
    total: (u, c) => `${u} من ${c}`,
  },
  es: {
    add: "Elegir archivos",
    remove: "Quitar",
    total: (u, c) => `${u} de ${c}`,
  },
  de: {
    add: "Dateien auswählen",
    remove: "Entfernen",
    total: (u, c) => `${u} von ${c}`,
  },
  it: {
    add: "Scegli i file",
    remove: "Rimuovi",
    total: (u, c) => `${u} su ${c}`,
  },
  pt: {
    add: "Escolher ficheiros",
    remove: "Remover",
    total: (u, c) => `${u} de ${c}`,
  },
  nl: {
    add: "Bestanden kiezen",
    remove: "Verwijderen",
    total: (u, c) => `${u} van ${c}`,
  },
  ru: {
    add: "Выбрать файлы",
    remove: "Убрать",
    total: (u, c) => `${u} из ${c}`,
  },
  tr: {
    add: "Dosya seçin",
    remove: "Kaldır",
    total: (u, c) => `${u} / ${c}`,
  },
  pl: {
    add: "Wybierz pliki",
    remove: "Usuń",
    total: (u, c) => `${u} z ${c}`,
  },
};

export function FileDrop({
  lang,
  style,
  children,
  name = "q-files",
}: {
  lang: Locale;
  style?: CSSProperties;
  children: ReactNode;
  name?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<FileRejection | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const t = COPY[lang];

  // Object URLs are revoked when the selection changes, not on unmount alone:
  // a visitor who swaps eight photos would otherwise leak eight bitmaps.
  useEffect(() => {
    const urls: Record<string, string> = {};
    for (const f of files) {
      if (f.type.startsWith("image/")) urls[keyOf(f)] = URL.createObjectURL(f);
    }
    setPreviews(urls);
    return () => {
      for (const u of Object.values(urls)) URL.revokeObjectURL(u);
    };
  }, [files]);

  /** Write a selection back onto the input, which is otherwise read-only. */
  const commit = (next: File[]) => {
    const dt = new DataTransfer();
    for (const f of next) dt.items.add(f);
    if (input.current) input.current.files = dt.files;
    setFiles(next);
  };

  const merge = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const next = [...files];
    for (const f of Array.from(incoming)) {
      if (!next.some((e) => keyOf(e) === keyOf(f))) next.push(f);
    }
    const check = validateQuoteFiles(next);
    if (!check.ok) {
      setError(check.error);
      // Put the input back to the last accepted selection. Refusing a file in
      // the UI while leaving it on the input would show the visitor an error
      // and then upload the file anyway — the server would refuse it a second
      // time, having carried it across the wire for nothing.
      commit(files);
      return;
    }
    setError(null);
    commit(next);
  };

  const used = files.reduce((n, f) => n + f.size, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* The transcribed dashed box, made operable. A button rather than a
          label so the whole panel is one keyboard stop with a visible focus
          ring, which a bare label on a hidden input does not get. */}
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          merge(e.dataTransfer.files);
        }}
        style={{
          ...style,
          width: "100%",
          font: "inherit",
          textAlign: "start",
          cursor: "pointer",
        }}
      >
        {children}
      </button>

      <input
        ref={input}
        type="file"
        name={name}
        multiple
        accept={ACCEPT_ATTR}
        onChange={(e) => merge(e.target.files)}
        style={{ display: "none" }}
      />

      {error && (
        <p role="alert" style={{ margin: 0, fontSize: "13.5px", color: "#C8364F" }}>
          {FILE_ERRORS[lang][error]}
        </p>
      )}

      {files.length > 0 && (
        <>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: "10px",
            }}
          >
            {files.map((f) => (
              <li
                key={keyOf(f)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px",
                  borderRadius: "12px",
                  border: "1px solid #DCE3F2",
                  background: "#FFFFFF",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: "38px",
                    height: "38px",
                    borderRadius: "9px",
                    background: "#EEF3FF",
                    overflow: "hidden",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {previews[keyOf(f)] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previews[keyOf(f)]}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#155DFC"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
                      <path d="M14 3v5h5" />
                    </svg>
                  )}
                </span>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#0E1A3D",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={f.name}
                  >
                    {f.name}
                  </span>
                  <span style={{ fontSize: "12px", color: "#4A5578" }}>
                    {formatBytes(f.size, lang)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    commit(files.filter((x) => keyOf(x) !== keyOf(f)));
                  }}
                  aria-label={`${t.remove} — ${f.name}`}
                  style={{
                    flexShrink: 0,
                    display: "inline-flex",
                    width: "26px",
                    height: "26px",
                    alignItems: "center",
                    justifyContent: "center",
                    border: 0,
                    borderRadius: "8px",
                    background: "transparent",
                    color: "#4A5578",
                    cursor: "pointer",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
          <p
            style={{
              margin: 0,
              fontSize: "12.5px",
              color: used > MAX_TOTAL_BYTES * 0.9 ? "#D99A00" : "#4A5578",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            }}
          >
            {t.total(formatBytes(used, lang), formatBytes(MAX_TOTAL_BYTES, lang))}
            {" · "}
            {files.length}/{MAX_FILES}
          </p>
        </>
      )}
    </div>
  );
}

/** Enough to tell two picks apart without hashing the bytes. */
function keyOf(f: File): string {
  return `${f.name}:${f.size}:${f.lastModified}`;
}
