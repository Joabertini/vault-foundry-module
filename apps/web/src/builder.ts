import type { CharacterBuild } from "@bertinis-vault/contracts";
import { deriveCharacterBuild } from "@bertinis-vault/domain";

export type BuilderState = {
  createdAt: string;
  characterName: string;
  playerName: string;
  alignment: string;
  raceId: string;
  classId: string;
  backgroundId: string;
  featId: string;
  weaponId: string;
  armorId: string;
  cantripsText: string;
  spellsText: string;
  featuresText: string;
  level: number;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  trait: string;
  ideal: string;
  bond: string;
  flaw: string;
  notes: string;
};

export const builderDraftStorageKey = "bertinis-vault:web-builder:draft";

export const initialState: BuilderState = {
  createdAt: new Date().toISOString(),
  characterName: "Seraphina Vale",
  playerName: "Martin",
  alignment: "Neutral Bueno",
  raceId: "human",
  classId: "wizard",
  backgroundId: "sage",
  featId: "magic-initiate",
  weaponId: "quarterstaff",
  armorId: "mage-armor",
  cantripsText: "Mage Hand\nPrestidigitation",
  spellsText: "Nv1: Shield\nNv1: Magic Missile\nNv2: Misty Step",
  featuresText: "Arcane Recovery\nSculpt Spells",
  level: 3,
  str: 8,
  dex: 14,
  con: 13,
  int: 17,
  wis: 12,
  cha: 10,
  trait: "Siempre toma notas, incluso en medio del peligro.",
  ideal: "El conocimiento es la mejor defensa contra el caos.",
  bond: "Su mentor desaparecido dejo pistas sobre una biblioteca sellada.",
  flaw: "Le cuesta abandonar una pista, incluso cuando pone al grupo en riesgo.",
  notes: "Lleva un grimorio con observaciones sobre portales, constelaciones y runas rotas.",
};

export function coerceBuilderState(value: unknown): BuilderState {
  if (!value || typeof value !== "object") {
    return initialState;
  }

  const candidate = value as Partial<BuilderState>;

  return {
    createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : initialState.createdAt,
    characterName: typeof candidate.characterName === "string" ? candidate.characterName : initialState.characterName,
    playerName: typeof candidate.playerName === "string" ? candidate.playerName : initialState.playerName,
    alignment: typeof candidate.alignment === "string" ? candidate.alignment : initialState.alignment,
    raceId: typeof candidate.raceId === "string" ? candidate.raceId : initialState.raceId,
    classId: typeof candidate.classId === "string" ? candidate.classId : initialState.classId,
    backgroundId:
      typeof candidate.backgroundId === "string" ? candidate.backgroundId : initialState.backgroundId,
    featId: typeof candidate.featId === "string" ? candidate.featId : initialState.featId,
    weaponId: typeof candidate.weaponId === "string" ? candidate.weaponId : initialState.weaponId,
    armorId: typeof candidate.armorId === "string" ? candidate.armorId : initialState.armorId,
    cantripsText:
      typeof candidate.cantripsText === "string" ? candidate.cantripsText : initialState.cantripsText,
    spellsText: typeof candidate.spellsText === "string" ? candidate.spellsText : initialState.spellsText,
    featuresText:
      typeof candidate.featuresText === "string" ? candidate.featuresText : initialState.featuresText,
    level: typeof candidate.level === "number" ? candidate.level : initialState.level,
    str: typeof candidate.str === "number" ? candidate.str : initialState.str,
    dex: typeof candidate.dex === "number" ? candidate.dex : initialState.dex,
    con: typeof candidate.con === "number" ? candidate.con : initialState.con,
    int: typeof candidate.int === "number" ? candidate.int : initialState.int,
    wis: typeof candidate.wis === "number" ? candidate.wis : initialState.wis,
    cha: typeof candidate.cha === "number" ? candidate.cha : initialState.cha,
    trait: typeof candidate.trait === "string" ? candidate.trait : initialState.trait,
    ideal: typeof candidate.ideal === "string" ? candidate.ideal : initialState.ideal,
    bond: typeof candidate.bond === "string" ? candidate.bond : initialState.bond,
    flaw: typeof candidate.flaw === "string" ? candidate.flaw : initialState.flaw,
    notes: typeof candidate.notes === "string" ? candidate.notes : initialState.notes,
  };
}

export function abilityModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

export function proficiencyBonus(level: number) {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
}

export function buildCanonicalSnapshot(state: BuilderState): CharacterBuild {
  const cantrips = state.cantripsText
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => `Nv0: ${entry}`);
  const leveledSpells = state.spellsText
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const features = state.featuresText
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const buildInput: Omit<CharacterBuild, "derived"> = {
    meta: {
      rulesVersion: "5e-2014",
      sourceProfile: "vault-v1",
      createdAt: state.createdAt,
      updatedAt: new Date().toISOString(),
    },
    identity: {
      characterName: state.characterName,
      playerName: state.playerName,
      alignment: state.alignment,
      biography: {
        trait: state.trait,
        ideal: state.ideal,
        bond: state.bond,
        flaw: state.flaw,
        notes: state.notes,
      },
    },
    ancestry: {
      raceId: state.raceId,
    },
    classing: {
      classes: [
        {
          classId: state.classId,
          level: state.level,
        },
      ],
    },
    background: {
      backgroundId: state.backgroundId,
      grantedFeatIds: [state.featId],
    },
    abilities: {
      generationMethod: "manual",
      base: {
        str: state.str,
        dex: state.dex,
        con: state.con,
        int: state.int,
        wis: state.wis,
        cha: state.cha,
      },
      final: {
        str: state.str,
        dex: state.dex,
        con: state.con,
        int: state.int,
        wis: state.wis,
        cha: state.cha,
      },
    },
    choices: {
      feats: [state.featId],
      proficiencies: [],
      spells: [...cantrips, ...leveledSpells],
      equipment: [state.weaponId, state.armorId],
      features,
    },
  };

  return deriveCharacterBuild(buildInput);
}
