import { useEffect, useState } from "react";
import { loadSession, peekSession, type Account } from "@/lib/session";

export function useAccount() {
  const [account, setAccount] = useState<Account | null>(peekSession()?.user ?? null);
  useEffect(() => {
    let live = true;
    loadSession()
      .then((session) => {
        if (live) setAccount(session.user);
      })
      .catch(() => {
        if (live) setAccount(null);
      });
    return () => {
      live = false;
    };
  }, []);
  return account;
}
