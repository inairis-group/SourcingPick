export const HOME_SITE = "GARS";

export const LOT_CATEGORIES = [
  { letter: "A", name: "Téléphone" },
  { letter: "B", name: "Tablette" },
  { letter: "C", name: "Ordinateur" },
  { letter: "D", name: "Montre" },
  { letter: "E", name: "Audio" },
  { letter: "F", name: "Accessoire" },
  { letter: "G", name: "Console" },
  { letter: "H", name: "Écran" },
  { letter: "I", name: "Photo" },
  { letter: "J", name: "Autre" },
] as const;

export function formatCategory(letter: string, name: string) {
  return `${letter} · ${name}`;
}

export function letterFromCategory(category: string) {
  const hit = category.trim().match(/^([A-Ja-j])/);
  return hit ? hit[1]!.toUpperCase() : "A";
}

export function nextRef(category: string, refs: string[]) {
  const letter = letterFromCategory(category);
  const used = new Set<number>();
  const re = new RegExp(`^${letter}(\\d{1,5})$`, "i");
  for (const ref of refs) {
    const m = ref.trim().match(re);
    if (m) used.add(Number(m[1]));
  }
  let n = 1;
  while (used.has(n)) n += 1;
  return `${letter}${String(n).padStart(3, "0")}`;
}
