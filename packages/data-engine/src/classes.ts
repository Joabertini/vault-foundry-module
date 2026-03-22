import { normalizeLabel } from "./normalize.js";

export type ClassCatalogEntry = {
  id: string;
  label: string;
  aliases: string[];
};

export const classCatalog: ClassCatalogEntry[] = [
  { id: "barbarian", label: "Barbarian", aliases: ["barbaro", "bárbaro"] },
  { id: "bard", label: "Bard", aliases: ["bardo"] },
  { id: "cleric", label: "Cleric", aliases: ["clerigo", "clérigo"] },
  { id: "druid", label: "Druid", aliases: ["druida"] },
  { id: "fighter", label: "Fighter", aliases: ["guerrero"] },
  { id: "monk", label: "Monk", aliases: ["monje"] },
  { id: "paladin", label: "Paladin", aliases: ["paladin", "paladín"] },
  { id: "ranger", label: "Ranger", aliases: ["explorador"] },
  { id: "rogue", label: "Rogue", aliases: ["picaro", "pícaro"] },
  { id: "sorcerer", label: "Sorcerer", aliases: ["hechicero"] },
  { id: "warlock", label: "Warlock", aliases: ["brujo"] },
  { id: "wizard", label: "Wizard", aliases: ["mago"] },
  { id: "artificer", label: "Artificer", aliases: ["artifice", "artificer", "artífice"] },
];

const classAliasMap = new Map<string, string>();

for (const entry of classCatalog) {
  classAliasMap.set(normalizeLabel(entry.id), entry.id);
  classAliasMap.set(normalizeLabel(entry.label), entry.id);

  for (const alias of entry.aliases) {
    classAliasMap.set(normalizeLabel(alias), entry.id);
  }
}

export function resolveClassId(value: string): string {
  return classAliasMap.get(normalizeLabel(value)) ?? normalizeLabel(value).replace(/\s+/g, "-");
}

export function getClassCatalogEntry(value: string): ClassCatalogEntry | undefined {
  const resolvedId = resolveClassId(value);
  return classCatalog.find((entry) => entry.id === resolvedId);
}
