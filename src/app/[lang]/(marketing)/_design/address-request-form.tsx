"use client";

import { useActionState, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { requestWarehouseAddress, type AddressRequestState } from "@/lib/site/address-request";
import type { AddressGateCopy } from "@/content/site/address-gate";
import { BODY } from "./locale-type";
import { TEXT_INPUT } from "./freight-shipment";

type FormCopy = Pick<
  AddressGateCopy,
  "open" | "name" | "email" | "phone" | "submit" | "sending" | "sent" | "errors"
>;

/**
 * "Recevoir l'adresse par e-mail" under the line that replaced the warehouse
 * address (address-gate.tsx): closed to one button so the card keeps its
 * drawn size, opened to three fields. The address goes out by e-mail
 * (requestWarehouseAddress); nothing of it reaches the page.
 */
export function AddressRequestForm({ lang, copy: c }: { lang: Locale; copy: FormCopy }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<AddressRequestState | null, FormData>(
    requestWarehouseAddress,
    null,
  );
  const button = {
    alignSelf: "flex-start",
    minHeight: "44px",
    padding: "0 18px",
    borderRadius: "12px",
    border: "none",
    background: "#155DFC",
    color: "#FFFFFF",
    fontFamily: BODY,
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  } as const;

  if (state?.ok) {
    return (
      <p
        role="status"
        style={{
          margin: 0,
          fontSize: "14.5px",
          lineHeight: 1.5,
          color: "#0E7A3D",
          fontWeight: 600,
        }}
      >
        {c.sent.replace("{email}", state.email)}
      </p>
    );
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={button}>
        {c.open}
      </button>
    );
  }
  const input = { ...TEXT_INPUT, minHeight: "44px", width: "100%" };
  const label = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "13.5px",
    fontWeight: 600,
    color: "#0E1A3D",
  } as const;
  return (
    <form
      action={formAction}
      style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "420px" }}
    >
      <input type="hidden" name="lang" value={lang} />
      {/* People never see this one: anything in it was typed by a robot. */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          clipPath: "inset(50%)",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      <label style={label}>
        {c.name}
        <input name="name" autoComplete="name" maxLength={120} style={input} />
      </label>
      <label style={label}>
        {c.email}
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={200}
          style={input}
        />
      </label>
      <label style={label}>
        {c.phone}
        <input name="phone" type="tel" autoComplete="tel" maxLength={40} style={input} dir="ltr" />
      </label>
      {state && !state.ok && (
        <p role="alert" style={{ margin: 0, fontSize: "13.5px", color: "#B42318" }}>
          {c.errors[state.error]}
        </p>
      )}
      <button type="submit" disabled={pending} style={{ ...button, opacity: pending ? 0.7 : 1 }}>
        {pending ? c.sending : c.submit}
      </button>
    </form>
  );
}
