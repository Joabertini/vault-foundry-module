export type BuilderState = {
  characterName: string;
  playerName: string;
  alignment: string;
  raceId: string;
  classId: string;
  backgroundId: string;
  featId: string;
  weaponId: string;
  armorId: string;
  level: number;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  trait: string;
  ideal: string;
};

export const initialState: BuilderState = {
  characterName: "Seraphina Vale",
  playerName: "Martin",
  alignment: "Neutral Bueno",
  raceId: "human",
  classId: "wizard",
  backgroundId: "sage",
  featId: "magic-initiate",
  weaponId: "quarterstaff",
  armorId: "mage-armor",
  level: 3,
  str: 8,
  dex: 14,
  con: 13,
  int: 17,
  wis: 12,
  cha: 10,
  trait: "Siempre toma notas, incluso en medio del peligro.",
  ideal: "El conocimiento es la mejor defensa contra el caos.",
};

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

export function buildCanonicalSnapshot(state: BuilderState) {
  const pb = proficiencyBonus(state.level);
  const dexMod = abilityModifier(state.dex);
  const conMod = abilityModifier(state.con);
  const intMod = abilityModifier(state.int);

  return {
    meta: {
      rulesVersion: "5e-2014",
      sourceProfile: "vault-v1",
    },
    identity: {
      characterName: state.characterName,
      playerName: state.playerName,
      alignment: state.alignment,
      biography: {
        trait: state.trait,
        ideal: state.ideal,
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
    derived: {
      proficiencyBonus: pb,
      ac: 10 + dexMod,
      hp: 6 + conMod + Math.max(state.level - 1, 0) * (4 + conMod),
      spellcasting: {
        ability: "int",
        attackBonus: pb + intMod,
        saveDC: 8 + pb + intMod,
      },
    },
    choices: {
      feats: [state.featId],
      proficiencies: [],
      spells: ["Nv0: Mage Hand", "Nv1: Shield"],
      equipment: [state.weaponId, state.armorId],
      features: [],
    },
  };
}
