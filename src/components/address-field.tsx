import { useEffect, useState } from "react";

export function AddressField({
  value,
  onChange,
  className = "field mt-1 font-normal",
  placeholder = "Numéro, rue, code postal, ville",
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  return <PlaceField value={value} onChange={onChange} mode="address" className={className} placeholder={placeholder} />;
}

const PORTS = [
  "Le Havre, France",
  "Marseille-Fos, France",
  "Dunkerque, France",
  "Nantes – Saint-Nazaire, France",
  "Bordeaux, France",
  "La Rochelle, France",
  "Sète, France",
  "Rouen, France",
  "Anvers, Belgique",
  "Rotterdam, Pays-Bas",
  "Hambourg, Allemagne",
  "Barcelone, Espagne",
  "Gênes, Italie",
  "Shanghai, Chine",
  "Ningbo, Chine",
  "Yantian, Chine",
  "Nansha, Chine",
  "Qingdao, Chine",
  "Xiamen, Chine",
];

export function PlaceField({
  value,
  onChange,
  mode,
  className = "control mt-2",
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  mode: "address" | "port";
  className?: string;
  placeholder?: string;
}) {
  const [hits, setHits] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const query = String(value ?? "").trim();
    if (!open || query.length < 2) {
      setHits([]);
      return;
    }
    const local = mode === "port" ? PORTS.filter((port) => port.toLowerCase().includes(query.toLowerCase())).slice(0, 5) : [];
    if (query.length < 3) {
      setHits(local);
      return;
    }
    const handle = window.setTimeout(() => {
      const type = mode === "port" ? "&type=municipality" : "";
      void fetch(`https://api-adresse.data.gouv.fr/search/?limit=5${type}&q=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((data: { features?: Array<{ properties?: { label?: string } }> }) => {
          const remote = (data.features ?? []).map((item) => item.properties?.label || "").filter(Boolean);
          setHits([...local, ...remote.filter((item) => !local.includes(item))].slice(0, 7));
        })
        .catch(() => setHits(local));
    }, 240);
    return () => window.clearTimeout(handle);
  }, [value, open, mode]);

  return (
    <div className="relative">
      <input
        className={className}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 160)}
        onChange={(event) => {
          setOpen(true);
          onChange(event.target.value);
        }}
      />
      {open && hits.length ? (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-line bg-white shadow-lg">
          {hits.map((hit) => (
            <li key={hit}>
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-canvas"
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(hit);
                  setHits([]);
                  setOpen(false);
                }}
              >
                {hit}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
