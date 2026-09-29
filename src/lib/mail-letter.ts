export type MailDress = {
  badge?: string;
  title?: string;
  ctaLabel?: string;
  ctaHref?: string;
  note?: string;
  code?: string;
  amount?: string;
  amountLabel?: string;
};

const ORIGIN = "https://sourcingpick.com";

function asset(file: string, absolute: boolean) {
  return `${absolute ? ORIGIN : ""}/mail/${file}`;
}

function esc(value: string) {
  return value
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

export function guessBadge(subject: string) {
  const text = subject.toLowerCase();
  if (text.includes("essai")) return "ESSAI";
  if (text.includes("code")) return "CODE DE VÉRIFICATION";
  if (text.includes("mot de passe")) return "SÉCURITÉ";
  if (text.includes("bienvenue") || text.includes("confirmez")) return "BIENVENUE";
  if (text.includes("invitation") || text.includes("agent")) return "ÉQUIPE";
  if (text.includes("acompte")) return "ACOMPTE";
  if (text.includes("facture")) return "FACTURE";
  if (text.includes("dernier jour")) return "DERNIER JOUR";
  if (text.includes("relance") || text.includes("rappel") || text.includes("jour")) return "RAPPEL";
  if (text.includes("refus")) return "DEVIS REFUSÉ";
  if (text.includes("accept")) return "DEVIS ACCEPTÉ";
  if (text.includes("devis")) return "NOUVEAU DEVIS";
  if (text.includes("commande")) return "COMMANDE CONFIRMÉE";
  if (text.includes("demande")) return "NOUVELLE DEMANDE";
  if (text.includes("message")) return "MESSAGE";
  return "SOURCING PICK";
}

function allowTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+=("[^"]*"|'[^']*')/gi, "")
    .replace(/<a\b[^>]*href=("([^"]*)"|'([^']*)')[^>]*>/gi, (_match, _q, a, b) => {
      const href = String(a || b || "");
      const safe = /^https?:\/\//i.test(href) ? href : "https://sourcingpick.com";
      return `<a href="${esc(safe)}" style="color:#155DFC;font-weight:700;text-decoration:underline;">`;
    })
    .replace(/<(?!\/?(?:strong|em|b|i|u|mark|br|p|ul|ol|li|a)\b)[^>]*>/gi, "");
}

export function mailBody(input: string) {
  const raw = String(input ?? "")
    .replace(/&(lt|LT);br\s*\/?&(gt|GT);/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div)>/gi, "\n")
    .replace(/<(p|div)[^>]*>/gi, "")
    .trim();
  if (!raw) return "";
  if (/<(p|ul|ol|div|table)\b/i.test(raw)) return allowTags(raw);
  if (/<(strong|em|b|i|u|mark|br)\b/i.test(raw)) {
    return `<p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#33406A;">${allowTags(raw).replace(/\n/g, "<br>")}</p>`;
  }
  const marked = esc(raw)
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
  return marked
    .split(/\n{2,}/)
    .map(
      (part) =>
        `<p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#33406A;">${part.replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}

export function brandCard(input: { subject: string; text: string; dress?: MailDress; absolute?: boolean }) {
  const dress = input.dress ?? {};
  const absolute = input.absolute !== false;
  const badge = esc(dress.badge || guessBadge(input.subject));
  const title = esc(dress.title || input.subject || "Sourcing Pick");
  const body = mailBody(input.text);
  const logo = asset("logo-white.png", absolute);
  const picky = asset("picky.png", absolute);
  const wave = asset("wave.png", absolute);
  const grid = asset("grid.png", absolute);
  const lockup = asset("lockup.png", absolute);
  const amount = dress.amount
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;"><tr><td align="center" style="background:#E3F6EC;border:1px solid #B6E5C8;border-radius:14px;padding:18px 12px;">
        <div style="font-family:ui-monospace,monospace;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#1F8F55;">${esc(dress.amountLabel || "Montant")}</div>
        <div style="font-size:32px;line-height:1.2;font-weight:700;color:#145C38;margin-top:4px;">${esc(dress.amount)}</div>
      </td></tr></table>`
    : "";
  const code = dress.code
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;"><tr><td align="center" style="background:#F5F7FC;border:1px solid #DCE3F2;border-radius:14px;padding:16px;">
        <div style="font-family:ui-monospace,monospace;font-size:11px;font-weight:700;letter-spacing:.12em;color:#4A5578;">CODE</div>
        <div style="font-family:ui-monospace,monospace;font-size:34px;font-weight:700;letter-spacing:.18em;color:#0E1A3D;margin-top:4px;">${esc(dress.code)}</div>
      </td></tr></table>`
    : "";
  const cta =
    dress.ctaLabel && dress.ctaHref
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;"><tr><td bgcolor="#155DFC" style="border-radius:12px;">
          <a href="${esc(dress.ctaHref)}" style="display:inline-block;padding:14px 26px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;">${esc(dress.ctaLabel)}</a>
        </td></tr></table>
        <p style="margin:0 0 12px;font-size:12px;line-height:1.5;color:#6a7896;">Si le bouton ne s’ouvre pas : <a href="${esc(dress.ctaHref)}" style="color:#155DFC;">${esc(dress.ctaHref)}</a></p>`
      : "";
  const note = dress.note
    ? `<p style="margin:4px 0 0;font-size:13.5px;line-height:1.6;color:#4A5578;">${esc(dress.note)}</p>`
    : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" data-sp-mail="1" style="background:#E9EEF8;margin:0;padding:0;">
  <tr><td align="center" style="padding:28px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #DCE3F2;border-radius:20px;overflow:hidden;">
      <tr><td bgcolor="#162456" style="background-color:#162456;background-image:url('${grid}');padding:26px 28px 6px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td valign="middle" style="padding:0 8px 8px 4px;">
            <img src="${logo}" alt="Sourcing Pick" width="148" height="39" style="display:block;height:39px;width:148px;border:0;">
            <div style="height:16px;line-height:16px;font-size:16px;">&nbsp;</div>
            <span style="display:inline-block;background:#FFC247;color:#0E1A3D;font-family:ui-monospace,SFMono-Regular,monospace;font-size:12px;font-weight:700;letter-spacing:.04em;padding:6px 12px;border-radius:999px;">${badge}</span>
          </td>
          <td width="168" valign="bottom" align="right">
            <img src="${picky}" alt="" width="160" height="160" style="display:block;width:160px;height:auto;border:0;">
          </td>
        </tr></table>
      </td></tr>
      <tr><td bgcolor="#162456" style="background-color:#162456;line-height:0;font-size:0;">
        <img src="${wave}" alt="" width="600" style="display:block;width:100%;height:auto;border:0;">
      </td></tr>
      <tr><td style="padding:8px 36px 28px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#0E1A3D;">
        <h1 style="margin:0 0 16px;font-family:'Trebuchet MS','Segoe UI',sans-serif;font-size:26px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;color:#0E1A3D;">${title}</h1>
        ${body}
        ${amount}
        ${code}
        ${cta}
        ${note}
      </td></tr>
      <tr><td style="background:#F5F7FC;border-top:1px solid #DCE3F2;padding:22px 36px 26px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
        <img src="${lockup}" alt="Sourcing Pick" height="42" style="display:block;height:42px;width:auto;border:0;">
        <p style="margin:14px 0 0;font-size:12.5px;line-height:1.6;color:#4A5578;">Une question ? Répondez à cet email ou écrivez à <a href="mailto:contact@sourcingpick.com" style="color:#155DFC;font-weight:700;text-decoration:none;">contact@sourcingpick.com</a>.<br>© 2026 Sourcing Pick · Guangzhou</p>
      </td></tr>
    </table>
  </td></tr>
</table>`;
}

export function brandDocument(input: { subject: string; text: string; dress?: MailDress }) {
  const card = brandCard({ ...input, absolute: true });
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(input.subject)}</title></head><body style="margin:0;padding:0;background:#E9EEF8;">${card}</body></html>`;
}

export function sampleTestMail(sender = "l’administration") {
  return brandDocument({
    subject: "Votre devis est prêt",
    text: `Bonjour,\n\nCeci est l’essai décoré envoyé par ${sender}. Le vrai devis, la facture et les relances partent dans ce même habillage : en-tête marine, mascotte, vagues, montant et bouton.\n\nOuvrez-le pour voir le détail, puis signez-le dans votre espace.`,
    dress: {
      badge: "NOUVEAU DEVIS",
      title: "Votre devis est prêt !",
      amountLabel: "Prix proposé",
      amount: "10,00 €",
      ctaLabel: "Voir le devis",
      ctaHref: "https://sourcingpick.com/espace",
      code: "482913",
      note: "Le code d’essai n’ouvre rien. Sur un vrai devis, il sert à signer.",
    },
  });
}
