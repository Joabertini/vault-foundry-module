import { normalizeLabel, slugifyId } from "./normalize.js";

export type RaceCatalogEntry = {
  id: string;
  label: string;
  aliases: string[];
};

export const raceCatalog: RaceCatalogEntry[] = [
  { id: "human", label: "Human", aliases: ["humano"] },
  { id: "elf", label: "Elf", aliases: ["elfo"] },
  { id: "half-elf", label: "Half-Elf", aliases: ["semi-elfo"] },
  { id: "dwarf", label: "Dwarf", aliases: ["enano"] },
  { id: "halfling", label: "Halfling", aliases: ["mediano"] },
  { id: "half-orc", label: "Half-Orc", aliases: ["semiorco"] },
  { id: "gnome", label: "Gnome", aliases: ["gnomo"] },
  { id: "tiefling", label: "Tiefling", aliases: ["tiefling"] },
  { id: "dragonborn", label: "Dragonborn", aliases: ["draconido", "dracónido"] },
  { id: "aasimar", label: "Aasimar", aliases: ["aasimar"] },
  { id: "tortle", label: "Tortle", aliases: ["tortle"] },
  { id: "firbolg", label: "Firbolg", aliases: ["firbolg"] },
  { id: "harengon", label: "Harengon", aliases: ["harengon"] },
  { id: "tabaxi", label: "Tabaxi", aliases: ["tabaxi"] },
  { id: "genasi", label: "Genasi", aliases: ["genasi"] },
  { id: "goliath", label: "Goliath", aliases: ["goliath"] },
  { id: "kenku", label: "Kenku", aliases: ["kenku"] },
  { id: "githyanki", label: "Githyanki", aliases: ["githyanki"] },
  { id: "githzerai", label: "Githzerai", aliases: ["githzerai"] },
  { id: "leonin", label: "Leonin", aliases: ["leonin"] },
  { id: "satyr", label: "Satyr", aliases: ["satyr"] },
  { id: "fairy", label: "Fairy", aliases: ["fairy"] },
  { id: "owlfolk", label: "Owlfolk", aliases: ["owlfolk"] },
  { id: "rabbitfolk", label: "Rabbitfolk", aliases: ["rabbitfolk"] },
];

const raceAliasMap = new Map<string, string>();

for (const entry of raceCatalog) {
  raceAliasMap.set(normalizeLabel(entry.id), entry.id);
  raceAliasMap.set(normalizeLabel(entry.label), entry.id);
  for (const alias of entry.aliases) {
    raceAliasMap.set(normalizeLabel(alias), entry.id);
  }
}

export function resolveRaceId(value: string): string {
  return raceAliasMap.get(normalizeLabel(value)) ?? slugifyId(value);
}

export function getRaceCatalogEntry(value: string): RaceCatalogEntry | undefined {
  const resolvedId = resolveRaceId(value);
  return raceCatalog.find((entry) => entry.id === resolvedId);
}
