import "server-only";
import { render } from "react-email";
import type { ReactElement } from "react";
import { getTransport } from "./transport";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  /** Pre-rendered React Email template element. Use the renderToHtml exported by each template. */
  react: ReactElement;
  /** Optional plain-text fallback. If omitted, generated from the React tree. */
  text?: string;
  /** Optional override of EMAIL_FROM. */
  from?: string;
};

/**
 * Typed wrapper around Nodemailer that renders a React Email template and
 * sends it. All transactional emails should go through this function so we
 * have one place to wire logging, retries, and audit later.
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const html = await render(input.react);
  const text = input.text ?? (await render(input.react, { plainText: true }));

  const transport = getTransport();
  await transport.sendMail({
    from: input.from ?? process.env.EMAIL_FROM ?? "no-reply@sourcingpick.local",
    to: input.to,
    subject: input.subject,
    html,
    text,
  });
}
