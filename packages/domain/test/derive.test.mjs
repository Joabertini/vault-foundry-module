import test from "node:test";
import assert from "node:assert/strict";

import { deriveCharacterBuild } from "../dist/index.js";

function makeInput(overrides = {}) {
  return {
    meta: {
      rulesVersion: "5e-2014",
      sourceProfile: "vault-v1",
      createdAt: "2026-03-22T00:00:00.000Z",
      updatedAt: "2026-03-22T00:00:00.000Z",
    },
    identity: {
      characterName: "Seraphina Vale",
      alignment: "Neutral Good",
    },
    ancestry: {
      raceId: "human",
    },
    classing: {
      classes: [{ classId: "wizard", level: 3 }],
    },
    background: {
      backgroundId: "sage",
      grantedFeatIds: [],
    },
    abilities: {
      generationMethod: "manual",
      base: { str: 8, dex: 14, con: 13, int: 17, wis: 12, cha: 10 },
      final: { str: 8, dex: 14, con: 13, int: 17, wis: 12, cha: 10 },
    },
    choices: {
      feats: [],
      proficiencies: [],
      spells: ["Nv0: Mage Hand", "Nv1: Shield"],
      equipment: ["quarterstaff", "mage-armor", "shield"],
      features: [],
    },
    ...overrides,
  };
}

test("deriveCharacterBuild computes hp, ac, proficiency bonus and spellcasting", () => {
  const build = deriveCharacterBuild(makeInput());

  assert.equal(build.derived.proficiencyBonus, 2);
  assert.equal(build.derived.hp, 17);
  assert.equal(build.derived.ac, 17);
  assert.equal(build.derived.spellcasting?.ability, "int");
  assert.equal(build.derived.spellcasting?.attackBonus, 5);
  assert.equal(build.derived.spellcasting?.saveDC, 13);
  assert.equal(build.derived.spellcasting?.slots.spell1, 4);
  assert.equal(build.derived.spellcasting?.slots.spell2, 2);
});

test("deriveCharacterBuild omits spellcasting for non-casters", () => {
  const build = deriveCharacterBuild(
    makeInput({
      classing: {
        classes: [{ classId: "fighter", level: 3 }],
      },
      choices: {
        feats: [],
        proficiencies: [],
        spells: [],
        equipment: ["chain-mail", "shield"],
        features: [],
      },
    }),
  );

  assert.equal(build.derived.ac, 18);
  assert.equal(build.derived.spellcasting, undefined);
});
