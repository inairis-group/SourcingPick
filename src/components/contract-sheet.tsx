import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

type Block = { kind: "h"; text: string } | { kind: "p"; text: string } | { kind: "ul"; items: string[] };

function parseContract(body: string) {
  const chunks = body.replace(/\r\n/g, "\n").trim().split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  let lead = "";
  const blocks: Block[] = [];
  chunks.forEach((chunk, index) => {
    const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return;
    if (lines.every((line) => /^[-•]\s+/.test(line))) {
      blocks.push({ kind: "ul", items: lines.map((line) => line.replace(/^[-•]\s+/, "")) });
      return;
    }
    const raw = lines[0].replace(/^#{1,3}\s+/, "");
    const numbered = /^\d+[.)]\s+\S/.test(raw);
    const short = raw.length <= 72 && !/[.!?…:]$/.test(raw);
    if (index === 0 && lines.length === 1 && (raw === raw.toUpperCase() || short)) {
      lead = raw;
      return;
    }
    if (numbered || lines[0].startsWith("#")) {
      blocks.push({ kind: "h", text: raw.replace(/^\d+[.)]\s+/, "") });
      if (lines.length > 1) blocks.push({ kind: "p", text: lines.slice(1).join(" ") });
      return;
    }
    if (lines.length === 1 && short) {
      blocks.push({ kind: "h", text: raw });
      return;
    }
    blocks.push({ kind: "p", text: lines.join(" ") });
  });
  return { lead, blocks };
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  const nodes: ReactNode[] = parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={index}>{part.slice(1, -1)}</em>;
    return <span key={index}>{part}</span>;
  });
  return <>{nodes}</>;
}

function Wave({ flip }: { flip?: boolean }) {
  return (
    <svg className={flip ? "ct-wave ct-wave-bot" : "ct-wave"} viewBox="0 0 794 150" preserveAspectRatio="none" aria-hidden="true">
      <path fill="#EEF3FF" d={flip ? "M0 150H794V62C640 12 500 118 360 92 230 68 130 28 0 58Z" : "M0 0H794V82C640 138 520 22 392 54 250 90 140 136 0 96Z"} />
      <path fill="#DCE7FF" d={flip ? "M0 150H794V104C630 72 500 132 350 114 220 98 120 80 0 100Z" : "M0 0H794V42C620 88 500 6 360 32 230 56 130 90 0 56Z"} />
    </svg>
  );
}

export function ContractSheet({ title, client, body }: { title: string; client: string; body: string }) {
  const parsed = parseContract(body);
  const headline = parsed.lead || title || "Contrat";
  return (
    <article className="ct-paper">
      <Wave />
      <header className="ct-head">
        <img src="/illustrations/logo.svg" alt="SourcingPick" />
        <div>
          <p>Contrat</p>
          <h1>{headline}</h1>
          <span>{client || "Client"}</span>
        </div>
      </header>
      <div className="ct-body">
        {parsed.blocks.map((block, index) => {
          if (block.kind === "h") return <h2 key={index}><Inline text={block.text} /></h2>;
          if (block.kind === "ul") {
            return (
              <ul key={index}>
                {block.items.map((item) => <li key={item}><Inline text={item} /></li>)}
              </ul>
            );
          }
          return <p key={index}><Inline text={block.text} /></p>;
        })}
      </div>
      <footer className="ct-foot">
        <div>
          <strong>SourcingPick</strong>
          <span>Hangzhou Qiyuan Ying Technology Information Co., Ltd.</span>
          <span>sourcingpick.com</span>
        </div>
        <div className="ct-stamp" aria-hidden="true">
          <b>SP</b>
          <span>Contrat</span>
        </div>
      </footer>
      <Wave flip />
    </article>
  );
}

export function ContractView({ title, client, body }: { title: string; client: string; body: string }) {
  const host = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ scale: 1, height: 900 });

  useLayoutEffect(() => {
    const hostEl = host.current;
    const sheetEl = sheet.current;
    if (!hostEl || !sheetEl) return;
    const measure = () => {
      const scale = Math.min(1, hostEl.clientWidth / 794);
      setBox({ scale: scale || 1, height: Math.ceil(sheetEl.offsetHeight * (scale || 1)) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(hostEl);
    observer.observe(sheetEl);
    return () => observer.disconnect();
  }, [title, client, body]);

  return (
    <div ref={host} className="ct-view">
      <div className="ct-scale" style={{ height: box.height }}>
        <div ref={sheet} className="ct-fit" style={{ transform: `scale(${box.scale})` }}>
          <ContractSheet title={title} client={client} body={body} />
        </div>
      </div>
    </div>
  );
}
