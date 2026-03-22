import { normalizeLabel, slugifyId } from "./normalize.js";

export type BackgroundCatalogEntry = {
  id: string;
  label: string;
  source: string;
  grantedFeatIds: string[];
};

export const backgroundCatalog: BackgroundCatalogEntry[] = [
  { id: "acolyte", label: "Acolyte", source: "PHB", grantedFeatIds: [] },
  { id: "charlatan", label: "Charlatan", source: "PHB", grantedFeatIds: [] },
  { id: "criminal", label: "Criminal", source: "PHB", grantedFeatIds: [] },
  { id: "entertainer", label: "Entertainer", source: "PHB", grantedFeatIds: [] },
  { id: "folk-hero", label: "Folk Hero", source: "PHB", grantedFeatIds: [] },
  { id: "guild-artisan", label: "Guild Artisan", source: "PHB", grantedFeatIds: [] },
  { id: "hermit", label: "Hermit", source: "PHB", grantedFeatIds: [] },
  { id: "noble", label: "Noble", source: "PHB", grantedFeatIds: [] },
  { id: "outlander", label: "Outlander", source: "PHB", grantedFeatIds: [] },
  { id: "sage", label: "Sage", source: "PHB", grantedFeatIds: [] },
  { id: "sailor", label: "Sailor", source: "PHB", grantedFeatIds: [] },
  { id: "soldier", label: "Soldier", source: "PHB", grantedFeatIds: [] },
  { id: "urchin", label: "Urchin", source: "PHB", grantedFeatIds: [] },
  { id: "lorehold-student", label: "Lorehold Student", source: "SCC", grantedFeatIds: ["strixhaven-initiate-lorehold"] },
  { id: "prismari-student", label: "Prismari Student", source: "SCC", grantedFeatIds: ["strixhaven-initiate-prismari"] },
  { id: "quandrix-student", label: "Quandrix Student", source: "SCC", grantedFeatIds: ["strixhaven-initiate-quandrix"] },
  { id: "silverquill-student", label: "Silverquill Student", source: "SCC", grantedFeatIds: ["strixhaven-initiate-silverquill"] },
  { id: "witherbloom-student", label: "Witherbloom Student", source: "SCC", grantedFeatIds: ["strixhaven-initiate-witherbloom"] },
  { id: "knight-of-solamnia", label: "Knight of Solamnia", source: "DSotDQ", grantedFeatIds: ["squire-of-solamnia"] },
  { id: "mage-of-high-sorcery", label: "Mage of High Sorcery", source: "DSotDQ", grantedFeatIds: ["initiate-of-high-sorcery"] },
  { id: "wildspacer", label: "Wildspacer", source: "AAitSJ", grantedFeatIds: ["tough"] },
  { id: "gate-crasher", label: "Gate Crasher", source: "AAitSJ", grantedFeatIds: ["tavern-brawler"] },
  { id: "gate-warden", label: "Gate Warden", source: "PaBTQ", grantedFeatIds: ["scion-of-the-outer-planes"] },
  { id: "planar-philosopher", label: "Planar Philosopher", source: "PaBTQ", grantedFeatIds: ["scion-of-the-outer-planes"] },
  { id: "giant-foundling", label: "Giant Foundling", source: "BGotG", grantedFeatIds: ["strike-of-the-giants"] },
  { id: "runecrafter", label: "Runecrafter", source: "BGotG", grantedFeatIds: ["rune-shaper"] },
  { id: "custom", label: "Otro (personalizado)", source: "custom", grantedFeatIds: [] },
];

const backgroundAliasMap = new Map<string, string>();

const backgroundAliases: Record<string, string[]> = {
  acolyte: ["acolito", "acólito"],
  charlatan: ["charlatan", "charlatán"],
  entertainer: ["entretenido"],
  "folk-hero": ["heroe del pueblo", "héroe del pueblo"],
  "guild-artisan": ["artesano de gremio"],
  hermit: ["ermitano", "ermitaño"],
  outlander: ["forastero"],
  sage: ["erudito"],
  sailor: ["marinero"],
  soldier: ["soldado"],
  custom: ["otro (personalizado)", "otro personalizado"],
};

for (const entry of backgroundCatalog) {
  backgroundAliasMap.set(normalizeLabel(entry.id), entry.id);
  backgroundAliasMap.set(normalizeLabel(entry.label), entry.id);

  const aliases = backgroundAliases[entry.id] ?? [];
  for (const alias of aliases) {
    backgroundAliasMap.set(normalizeLabel(alias), entry.id);
  }
}

export function resolveBackgroundId(value: string): string {
  return backgroundAliasMap.get(normalizeLabel(value)) ?? slugifyId(value);
}

export function getBackgroundCatalogEntry(value: string): BackgroundCatalogEntry | undefined {
  const resolvedId = resolveBackgroundId(value);
  return backgroundCatalog.find((entry) => entry.id === resolvedId);
}
