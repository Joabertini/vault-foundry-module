import { normalizeLabel } from "./normalize";

export type FeatCatalogEntry = {
  id: string;
  label: string;
  aliases: string[];
};

export const featCatalog: FeatCatalogEntry[] = [
  { id: "alert", label: "Alert", aliases: ["alert"] },
  { id: "magic-initiate", label: "Magic Initiate", aliases: ["magic initiate"] },
  { id: "resilient", label: "Resilient", aliases: ["resilient"] },
  { id: "telekinetic", label: "Telekinetic", aliases: ["telekinetic"] },
  { id: "war-caster", label: "War Caster", aliases: ["war caster"] },
  { id: "tough", label: "Tough", aliases: ["tough"] },
  { id: "tavern-brawler", label: "Tavern Brawler", aliases: ["tavern brawler"] },
];

const featAliasMap = new Map<string, string>();

for (const entry of featCatalog) {
  featAliasMap.set(normalizeLabel(entry.id), entry.id);
  featAliasMap.set(normalizeLabel(entry.label), entry.id);

  for (const alias of entry.aliases) {
    featAliasMap.set(normalizeLabel(alias), entry.id);
  }
}

export function resolveFeatId(value: string): string {
  return featAliasMap.get(normalizeLabel(value)) ?? normalizeLabel(value).replace(/\s+/g, "-");
}

export function getFeatCatalogEntry(value: string): FeatCatalogEntry | undefined {
  const resolvedId = resolveFeatId(value);
  return featCatalog.find((entry) => entry.id === resolvedId);
}
