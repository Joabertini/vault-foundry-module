export type RaceLanguageRule = {
  fixed: string[];
  choiceCount?: number;
  choiceOptions?: string[];
};

export type SubraceEntry = {
  id: string;
  label: string;
};

export const commonOptionalLanguages = [
  "Common",
  "Dwarvish",
  "Elvish",
  "Gnomish",
  "Halfling",
  "Orc",
  "Draconic",
  "Infernal",
  "Sylvan",
  "Primordial",
  "Celestial",
  "Giant",
];

export const raceLanguageRules: Record<string, RaceLanguageRule> = {
  aasimar: { fixed: ["Common", "Celestial"] },
  dragonborn: { fixed: ["Common", "Draconic"] },
  dwarf: { fixed: ["Common", "Dwarvish"] },
  elf: { fixed: ["Common", "Elvish"] },
  fairy: { fixed: ["Common", "Sylvan"] },
  firbolg: { fixed: ["Common", "Elvish", "Sylvan"] },
  genasi: { fixed: ["Common", "Primordial"] },
  githyanki: { fixed: ["Common", "Gith"] },
  githzerai: { fixed: ["Common", "Gith"] },
  gnome: { fixed: ["Common", "Gnomish"] },
  goliath: { fixed: ["Common", "Giant"] },
  "half-elf": { fixed: ["Common", "Elvish"], choiceCount: 1, choiceOptions: commonOptionalLanguages },
  "half-orc": { fixed: ["Common", "Orc"] },
  halfling: { fixed: ["Common", "Halfling"] },
  harengon: { fixed: ["Common"], choiceCount: 1, choiceOptions: commonOptionalLanguages },
  human: { fixed: ["Common"], choiceCount: 1, choiceOptions: commonOptionalLanguages },
  kenku: { fixed: ["Common", "Auran"] },
  leonin: { fixed: ["Common"] },
  owlfolk: { fixed: ["Common"] },
  rabbitfolk: { fixed: ["Common"] },
  satyr: { fixed: ["Common", "Sylvan"] },
  tabaxi: { fixed: ["Common"] },
  tiefling: { fixed: ["Common", "Infernal"] },
  tortle: { fixed: ["Common", "Aquan"] },
};

export const subracesByRaceId: Record<string, SubraceEntry[]> = {
  aasimar: [
    { id: "protector-aasimar", label: "Protector Aasimar" },
    { id: "scourge-aasimar", label: "Scourge Aasimar" },
    { id: "fallen-aasimar", label: "Fallen Aasimar" },
  ],
  dwarf: [
    { id: "hill-dwarf", label: "Hill Dwarf" },
    { id: "mountain-dwarf", label: "Mountain Dwarf" },
  ],
  elf: [
    { id: "high-elf", label: "High Elf" },
    { id: "wood-elf", label: "Wood Elf" },
    { id: "drow", label: "Drow" },
  ],
  genasi: [
    { id: "air-genasi", label: "Air Genasi" },
    { id: "earth-genasi", label: "Earth Genasi" },
    { id: "fire-genasi", label: "Fire Genasi" },
    { id: "water-genasi", label: "Water Genasi" },
  ],
  gnome: [
    { id: "forest-gnome", label: "Forest Gnome" },
    { id: "rock-gnome", label: "Rock Gnome" },
  ],
  halfling: [
    { id: "lightfoot-halfling", label: "Lightfoot Halfling" },
    { id: "stout-halfling", label: "Stout Halfling" },
  ],
  tiefling: [
    { id: "asmodeus-tiefling", label: "Asmodeus Tiefling" },
    { id: "mephistopheles-tiefling", label: "Mephistopheles Tiefling" },
    { id: "zariel-tiefling", label: "Zariel Tiefling" },
  ],
};

export function getRaceLanguageRule(raceId: string): RaceLanguageRule {
  return raceLanguageRules[raceId] ?? { fixed: ["Common"] };
}

export function getSubracesForRace(raceId: string): SubraceEntry[] {
  return subracesByRaceId[raceId] ?? [];
}
