import { existsSync, readFileSync } from "node:fs";
import net from "node:net";
import tls from "node:tls";

type Config = { host: string; port: number; user: string; pass: string; from: string };

function fileEnv() {
  const path = process.env.MAIL_ENV || "/var/www/sourcingpick-site/mail.env";
  if (!existsSync(path)) return {} as Record<string, string>;
  const values: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    values[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
  }
  return values;
}

function config(): Config {
  const file = fileEnv();
  const pick = (key: string) => process.env[key] || file[key] || "";
  return {
    host: pick("SMTP_HOST") || "smtp.hostinger.com",
    port: Number(pick("SMTP_PORT") || 465),
    user: pick("SMTP_USER"),
    pass: pick("SMTP_PASS"),
    from: pick("SMTP_FROM") || pick("SMTP_USER"),
  };
}

function encoded(value: string) {
  return /^[\x20-\x7E]*$/.test(value) ? value : `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

let lastError = "";

export function mailError() {
  return lastError;
}

export function mailStatus() {
  const smtp = config();
  return { ready: Boolean(smtp.user && smtp.pass && smtp.from), from: smtp.from || "" };
}

function mailPng(name: string) {
  const paths = [`/var/www/sourcingpick-site/public/mail/${name}`, `${process.cwd()}/public/mail/${name}`];
  const path = paths.find((item) => existsSync(item));
  return path ? readFileSync(path) : null;
}

function wrap76(value: string) {
  return value.replace(/.{1,76}/g, "$&\r\n").trim();
}

function withInlineImages(html: string) {
  const names = ["logo-white.png", "picky.png", "wave.png", "lockup.png", "mark.png", "grid.png"];
  const attached: { name: string; bytes: Buffer }[] = [];
  let next = String(html ?? "");
  for (const name of names) {
    const remote = `https://sourcingpick.com/mail/${name}`;
    if (!next.includes(remote) && !next.includes(`/mail/${name}`)) continue;
    const bytes = mailPng(name);
    if (!bytes) continue;
    next = next.split(remote).join(`cid:${name}`).split(`/mail/${name}`).join(`cid:${name}`);
    attached.push({ name, bytes });
  }
  return { html: next, attached };
}

export async function deliverMail(to: string, subject: string, text: string, dress?: import("@/lib/mail-letter").MailDress, cc = "") {
  const smtp = config();
  lastError = "";
  if (!smtp.user || !smtp.pass || !smtp.from) {
    lastError = "La boîte contact@sourcingpick.com n’est pas configurée sur le serveur.";
    return false;
  }
  if (!to.includes("@")) {
    lastError = "L’adresse du destinataire est invalide.";
    return false;
  }
  const { brandDocument } = await import("@/lib/mail-letter");
  const { acceptMail, openMail, trackHtml } = await import("@/lib/mail-track.server");
  const branded = text.includes('data-sp-mail="1"') ? text : brandDocument({ subject, text, dress });
  const { html, attached } = withInlineImages(branded);
  const mailId = crypto.randomUUID().replace(/-/g, "");
  let tracked = html;
  try {
    await openMail(mailId, to, subject);
    tracked = trackHtml(html, mailId);
  } catch (error) {
    console.error("mail-track", error);
  }
  const plain = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .trim();
  const alt = `sp_${Date.now().toString(36)}`;
  const rel = `sp_${Date.now().toString(36)}b`;
  const alternative = [
    `--${alt}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    plain.replace(/\r?\n/g, "\r\n").replace(/^\./gm, ".."),
    `--${alt}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    tracked.replace(/\r?\n/g, "\r\n").replace(/^\./gm, ".."),
    `--${alt}--`,
  ].join("\r\n");
  const images = attached
    .map((file) =>
      [
        `--${rel}`,
        "Content-Type: image/png",
        "Content-Transfer-Encoding: base64",
        `Content-ID: <${file.name}>`,
        `Content-Disposition: inline; filename="${file.name}"`,
        "",
        wrap76(file.bytes.toString("base64")),
      ].join("\r\n"),
    )
    .join("\r\n");
  const copy = cc.trim().toLowerCase();
  const copies = copy.includes("@") && copy !== to.trim().toLowerCase() ? [copy] : [];
  const message = [
    `From: SourcingPick <${smtp.from}>`,
    `To: ${to}`,
    ...(copies.length ? [`Cc: ${copies.join(", ")}`] : []),
    `Subject: ${encoded(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/related; boundary="${rel}"`,
    "",
    `--${rel}`,
    `Content-Type: multipart/alternative; boundary="${alt}"`,
    "",
    alternative,
    images,
    `--${rel}--`,
    "",
  ].join("\r\n");
  try {
    await send(smtp, to, message);
    void acceptMail(mailId, true);
  } catch (error) {
    void acceptMail(mailId, false);
    const detail = error instanceof Error ? error.message : "refus SMTP";
    lastError = detail.includes("535")
      ? "La boîte contact@sourcingpick.com a refusé la connexion. Réessayez dans une minute."
      : `L’envoi a été refusé : ${detail}`;
    console.error("smtp", detail);
    void import("@/lib/error-log.server").then(({ recordError }) => recordError("mail", lastError, detail));
    return false;
  }
  for (const copy of copies) {
    try {
      await send(smtp, copy, message);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "refus SMTP";
      console.error("smtp-cc", copy, detail);
      void import("@/lib/error-log.server").then(({ recordError }) => recordError("mail", `Copie non délivrée à ${copy}`, detail));
    }
  }
  return true;
}

function send(smtp: Config, to: string | string[], message: string) {
  const recipients = (Array.isArray(to) ? to : [to]).filter((item) => item.includes("@"));
  return new Promise<void>((resolve, reject) => {
    const fail = (error: Error) => reject(error);
    let buffer = "";
    const lines: string[] = [];
    let pending: ((line: string) => void) | null = null;
    const push = (line: string) => {
      if (pending) {
        const resolveLine = pending;
        pending = null;
        resolveLine(line);
      } else lines.push(line);
    };
    const consume = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      let end = buffer.indexOf("\n");
      while (end >= 0) {
        const line = buffer.slice(0, end).replace(/\r$/, "");
        buffer = buffer.slice(end + 1);
        if (line.length < 4 || line[3] !== "-") push(line);
        end = buffer.indexOf("\n");
      }
    };
    const wait = () =>
      new Promise<string>((ok) => {
        const line = lines.shift();
        if (line !== undefined) ok(line);
        else pending = ok;
      });
    const expect = async (socket: net.Socket, code: number) => {
      const line = await wait();
      if (Number(line.slice(0, 3)) !== code) throw new Error(line || "Réponse SMTP vide");
      return line;
    };
    const command = async (socket: net.Socket, line: string, code: number) => {
      socket.write(`${line}\r\n`);
      return expect(socket, code);
    };
    const login = async (socket: net.Socket) => {
      await command(socket, "EHLO sourcingpick.com", 250);
      await command(socket, "AUTH LOGIN", 334);
      await command(socket, Buffer.from(smtp.user).toString("base64"), 334);
      await command(socket, Buffer.from(smtp.pass).toString("base64"), 235);
      await command(socket, `MAIL FROM:<${smtp.from}>`, 250);
      for (const recipient of recipients) {
        await command(socket, `RCPT TO:<${recipient}>`, 250);
      }
      await command(socket, "DATA", 354);
      socket.write(`${message}\r\n.\r\n`);
      await expect(socket, 250);
      socket.write("QUIT\r\n");
      resolve();
    };
    if (smtp.port === 465) {
      const socket = tls.connect({ host: smtp.host, port: smtp.port, servername: smtp.host });
      socket.on("data", consume);
      socket.on("error", fail);
      void expect(socket, 220).then(() => login(socket)).catch(fail);
      return;
    }
    const socket = net.connect(smtp.port, smtp.host);
    socket.on("data", consume);
    socket.on("error", fail);
    void (async () => {
      await expect(socket, 220);
      await command(socket, "EHLO sourcingpick.com", 250);
      await command(socket, "STARTTLS", 220);
      const secure = tls.connect({ socket, servername: smtp.host });
      buffer = "";
      socket.removeAllListeners("data");
      secure.on("data", consume);
      secure.on("error", fail);
      await login(secure);
    })().catch(fail);
  });
}
