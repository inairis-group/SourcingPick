"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="fr">
      <body>
        <p>An unexpected error occurred.</p>
        <button type="button" onClick={reset}>Reload</button>
      </body>
    </html>
  );
}
