import { brandCard, type MailDress } from "@/lib/mail-letter";

export function MailFrame({ subject, text, dress }: { subject: string; text: string; dress?: MailDress }) {
  const html = brandCard({ subject, text: text || "Votre message apparaîtra ici.", dress, absolute: false });
  return <div className="overflow-hidden rounded-[20px] border border-[#DCE3F2]" dangerouslySetInnerHTML={{ __html: html }} />;
}
