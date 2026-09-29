import { useLayoutEffect, type ReactNode } from "react";
import { PaperView } from "@/components/paper";
import { printNamed, stageClient } from "@/lib/ops-paper";
import type { Document } from "@/lib/docs";

export function PieceView({
  doc,
  fileName,
  clientName,
  site,
  onPdf,
  children,
}: {
  doc: Document;
  fileName: string;
  clientName: string;
  site: string;
  onPdf: () => void;
  children: ReactNode;
}) {
  useLayoutEffect(() => {
    stageClient(doc.clientId, clientName, site);
  }, [doc.clientId, clientName, site]);

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section>
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">{fileName}</span>
          <span className="text-muted">Page 1 sur 2</span>
          <span className="ms-auto flex flex-wrap gap-2">
            <button className="btn btn-quiet" type="button" onClick={onPdf}>Télécharger le PDF</button>
            <button className="btn btn-quiet" type="button" onClick={() => printNamed(fileName)}>Imprimer</button>
          </span>
        </div>
        <div className="overflow-hidden rounded-[22px] border border-line bg-[#eef2f8] p-3">
          <PaperView doc={doc} />
        </div>
        <p className="mt-3 text-xs text-muted">Document régénéré à chaque consultation, jamais archivé en PDF.</p>
      </section>
      <aside className="card text-sm">
        <h2 className="display mb-3 text-lg">Le document</h2>
        {children}
      </aside>
    </div>
  );
}

export function VoiceNote({ body }: { body: string }) {
  const text = body.replace(/^Transcription\s*·\s*/, "");
  return (
    <div className="mt-2">
      <div className="flex items-center gap-3 rounded-full bg-white px-3 py-2">
        <span className="grid size-8 place-items-center rounded-full bg-navy text-xs text-white">▶</span>
        <span className="h-1 flex-1 rounded-full bg-[#dce3f2]" />
        <span className="mono text-xs">0:24</span>
        <span className="text-xs text-muted">1×</span>
      </div>
      <p className="mt-2 text-xs font-semibold tracking-wide text-muted uppercase">Transcription</p>
      <p className="mt-1">{text}</p>
    </div>
  );
}
