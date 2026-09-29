import { useEffect, useState } from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return "La page n’a pas pu s’afficher.";
}

export function AppErrorComponent({ error, reset }: ErrorComponentProps) {
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    const key = "sp-error-retry";
    if (sessionStorage.getItem(key) === "1") {
      setGaveUp(true);
      return;
    }
    sessionStorage.setItem(key, "1");
    const timer = window.setTimeout(() => reset(), 40);
    return () => window.clearTimeout(timer);
  }, [reset]);

  if (!gaveUp) {
    return (
      <div className="app-boot" aria-busy="true">
        <img src="/illustrations/mascotte-ronde.svg" alt="" />
        <p>Chargement…</p>
      </div>
    );
  }

  const message = errorMessage(error);
  const auth = /connexion|session|accès|autoris/i.test(message);

  return (
    <main className="app-boot">
      <img src="/illustrations/mascotte-ronde.svg" alt="" />
      <p>La page n’a pas pu s’afficher.</p>
      <p className="max-w-md text-center text-sm text-[#4A5578]">{message}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            sessionStorage.removeItem("sp-error-retry");
            reset();
          }}
        >
          Réessayer
        </button>
        <a className="btn btn-quiet" href={auth ? "/connexion" : "/"}>
          {auth ? "Se connecter" : "Retour à l’accueil"}
        </a>
      </div>
    </main>
  );
}
