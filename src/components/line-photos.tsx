import { useState } from "react";

const MAX = 8;

export function linePhotoList(line: { image?: string; images?: string[] }) {
  const list = (line.images ?? []).filter((item) => item.startsWith("data:image/"));
  if (list.length) return list.slice(0, MAX);
  return line.image?.startsWith("data:image/") ? [line.image] : [];
}

export function LinePhotos({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const [over, setOver] = useState(false);

  function take(list: File[]) {
    const files = list.filter((file) => file.type.startsWith("image/")).slice(0, MAX - images.length);
    if (!files.length) return;
    void Promise.all(files.map(shrinkImage)).then((next) => {
      onChange([...images, ...next.filter(Boolean)].slice(0, MAX));
    });
  }

  return (
    <div
      onDragOver={(event) => {
        if (images.length >= MAX) return;
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        take([...(event.dataTransfer.files ?? [])]);
      }}
    >
      <div className={`flex min-h-16 flex-wrap gap-2 rounded-xl ${over ? "bg-[#eaf1ff] ring-2 ring-[#155dfc]" : ""}`}>
        {images.length === 0 ? (
          <div className={`flex h-16 w-16 items-center justify-center rounded-xl border border-dashed text-center text-[11px] ${over ? "border-[#155dfc] text-[#155dfc]" : "border-line text-muted"}`}>
            {over ? "Déposer" : "Photos"}
          </div>
        ) : null}
        {images.map((src, index) => (
          <div key={`${index}-${src.slice(-12)}`} className="relative">
            <img src={src} alt="" className="h-16 w-16 rounded-xl object-cover" />
            <button
              className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-semibold text-[#8a1c1c] shadow"
              type="button"
              aria-label="Retirer la photo"
              onClick={() => onChange(images.filter((_, item) => item !== index))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {images.length < MAX ? (
        <label className="mt-2 block cursor-pointer text-xs font-semibold text-brand">
          {over ? "Relâchez pour ajouter" : "Ajouter des photos, ou glissez-les ici"}
          <input
            className="hidden"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              take([...(event.target.files ?? [])]);
              event.target.value = "";
            }}
          />
        </label>
      ) : (
        <p className="mt-2 text-xs text-muted">8 photos maximum sur cette ligne.</p>
      )}
      {images.length ? (
        <ol className="mt-2 grid gap-1">
          {images.map((src, index) => (
            <li key={`name-${index}-${src.slice(-8)}`} className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate">Image {index + 1}</span>
              <button className="font-semibold text-[#8a1c1c]" type="button" onClick={() => onChange(images.filter((_, item) => item !== index))}>Retirer</button>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

export function PieceIndex({
  lines,
  onRemove,
}: {
  lines: Array<{ id: string; title?: string; image?: string; images?: string[] }>;
  onRemove: (lineId: string, index: number) => void;
}) {
  const rows = lines.flatMap((line) =>
    linePhotoList(line).map((src, index) => ({
      id: line.id,
      title: (line.title || "").trim() || "Ligne sans intitulé",
      src,
      index,
    })),
  );
  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <h3 className="font-semibold">Pièces jointes</h3>
      <p className="mt-1 text-sm text-muted">{rows.length ? `${rows.length} image${rows.length > 1 ? "s" : ""} sur ce document.` : "Aucune image. Ajoutez-en sur une ligne, elles apparaissent ici et sur le document."}</p>
      {rows.length ? (
        <ul className="mt-3 grid gap-2">
          {rows.map((row) => (
            <li key={`${row.id}-${row.index}`} className="flex items-center gap-3 rounded-xl border border-line px-2 py-2">
              <img src={row.src} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{row.title}</span>
                <span className="text-xs text-muted">Image {row.index + 1}</span>
              </span>
              <button className="text-sm font-semibold text-[#8a1c1c]" type="button" onClick={() => onRemove(row.id, row.index)}>Retirer</button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function shrinkImage(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 640 / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = () => resolve("");
      img.src = String(reader.result || "");
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}