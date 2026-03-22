import type { AbilityId } from "@bertinis-vault/contracts";

export type ToolProficiencyEntry = {
  id: string;
  ability: AbilityId;
  label: string;
};

const SKILL_ALIAS_TO_ID: Record<string, string> = {
  acrobatics: "acr",
  acrobacia: "acr",
  "animal handling": "ani",
  "manejo de animales": "ani",
  arcana: "arc",
  athletics: "ath",
  atletismo: "ath",
  deception: "dec",
  engaño: "dec",
  engano: "dec",
  history: "his",
  historia: "his",
  insight: "ins",
  intuicion: "ins",
  intuición: "ins",
  intimidation: "itm",
  intimidacion: "itm",
  intimidación: "itm",
  investigation: "inv",
  investigacion: "inv",
  investigación: "inv",
  medicine: "med",
  medicina: "med",
  nature: "nat",
  naturaleza: "nat",
  perception: "prc",
  percepcion: "prc",
  percepción: "prc",
  performance: "prf",
  interpretacion: "prf",
  interpretación: "prf",
  persuasion: "per",
  persuasione: "per",
  religion: "rel",
  religione: "rel",
  "sleight of hand": "slt",
  "juego de manos": "slt",
  stealth: "ste",
  sigilo: "ste",
  survival: "sur",
  supervivencia: "sur",
};

const LANGUAGE_ALIAS_TO_ID: Record<string, string> = {
  common: "common",
  comun: "common",
  dwarvish: "dwarvish",
  dwarf: "dwarvish",
  enano: "dwarvish",
  elvish: "elvish",
  elfico: "elvish",
  élfico: "elvish",
  gnomish: "gnomish",
  gnomo: "gnomish",
  halfling: "halfling",
  mediano: "halfling",
  giant: "giant",
  gigante: "giant",
  goblin: "goblin",
  draconic: "draconic",
  draconico: "draconic",
  dracónico: "draconic",
  infernal: "infernal",
  abyssal: "abyssal",
  celestial: "celestial",
  primordial: "primordial",
  sylvan: "sylvan",
  orc: "orc",
  orcish: "orc",
  undercommon: "undercommon",
  "deep speech": "deep",
};

const TOOL_ALIAS_TO_ID: Record<string, ToolProficiencyEntry> = {
  "thieves tools": { id: "thief", ability: "dex", label: "Thieves' Tools" },
  "herramientas de ladron": { id: "thief", ability: "dex", label: "Thieves' Tools" },
  "herbalism kit": { id: "herb", ability: "wis", label: "Herbalism Kit" },
  "kit de herboristeria": { id: "herb", ability: "wis", label: "Herbalism Kit" },
  "disguise kit": { id: "disg", ability: "cha", label: "Disguise Kit" },
  "kit de disfraz": { id: "disg", ability: "cha", label: "Disguise Kit" },
  "forgery kit": { id: "forg", ability: "dex", label: "Forgery Kit" },
  "kit de falsificacion": { id: "forg", ability: "dex", label: "Forgery Kit" },
  "navigator's tools": { id: "navg", ability: "wis", label: "Navigator's Tools" },
  "herramientas de navegacion": { id: "navg", ability: "wis", label: "Navigator's Tools" },
  "gaming set": { id: "game", ability: "int", label: "Gaming Set" },
  "vehicle land": { id: "land", ability: "dex", label: "Land Vehicles" },
  "vehiculos terrestres": { id: "land", ability: "dex", label: "Land Vehicles" },
  "vehicle water": { id: "water", ability: "dex", label: "Water Vehicles" },
  "vehiculos acuaticos": { id: "water", ability: "dex", label: "Water Vehicles" },
  "musical instrument": { id: "music", ability: "cha", label: "Musical Instrument" },
  "instrumento musical": { id: "music", ability: "cha", label: "Musical Instrument" },
  "artisan's tools": { id: "art", ability: "int", label: "Artisan's Tools" },
  "artisan tools": { id: "art", ability: "int", label: "Artisan's Tools" },
  "herramientas de artesano": { id: "art", ability: "int", label: "Artisan's Tools" },
};

export function normalizeSkillLabel(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeProficiencyLabel(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s:-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveSkillId(value: string) {
  return SKILL_ALIAS_TO_ID[normalizeSkillLabel(value)];
}

export function resolveLanguageId(value: string) {
  const normalized = normalizeProficiencyLabel(value).replace(/^language:\s*/, "");
  return LANGUAGE_ALIAS_TO_ID[normalized];
}

export function resolveToolEntry(value: string) {
  const normalized = normalizeProficiencyLabel(value).replace(/^tool:\s*/, "");
  return TOOL_ALIAS_TO_ID[normalized];
}
