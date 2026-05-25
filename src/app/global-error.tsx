"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary. Triggered only when the root layout itself
 * fails — at which point `<html>` and `<body>` haven't been rendered, so
 * this file owns the entire document.
 *
 * Kept i18n-agnostic on purpose: the dictionary loader probably failed
 * if we got here, so English plain-text is the safest bet.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          color: "#162456",
          fontFamily:
            'ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <main
          style={{
            maxWidth: 420,
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#94a3b8",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              margin: 0,
            }}
          >
            System error
          </p>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              margin: "12px 0 12px",
              letterSpacing: "-0.01em",
            }}
          >
            Something went wrong on our end.
          </h1>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "#475569",
              margin: "0 0 24px",
            }}
          >
            The page couldn&rsquo;t be rendered. Our team has been notified.
            You can retry, or come back in a few minutes.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: 10,
                color: "#94a3b8",
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                margin: "0 0 16px",
              }}
            >
              ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              backgroundColor: "#155dfc",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 600,
              padding: "10px 18px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </main>
      </body>
    </html>
  );
}
