import test from "node:test";
import assert from "node:assert/strict";

import {
  characterBuildInputSchema,
  characterBuildSchema,
} from "../dist/index.js";

function makeBuild() {
  return {
    meta: {
      rulesVersion: "5e-2014",
      sourceProfile: "vault-v1",
      createdAt: "2026-03-22T00:00:00.000Z",
      updatedAt: "2026-03-22T00:00:00.000Z",
    },
    identity: {
      characterName: "Seraphina Vale",
      playerName: "Martin",
      alignment: "Neutral Good",
      biography: {
        trait: "Always writes everything down.",
      },
    },
    ancestry: {
      raceId: "human",
    },
    classing: {
      classes: [{ classId: "wizard", level: 3 }],
    },
    background: {
      backgroundId: "sage",
      grantedFeatIds: ["magic-initiate"],
    },
    abilities: {
      generationMethod: "manual",
      base: { str: 8, dex: 14, con: 13, int: 17, wis: 12, cha: 10 },
      final: { str: 8, dex: 14, con: 13, int: 17, wis: 12, cha: 10 },
    },
    choices: {
      feats: ["magic-initiate"],
      proficiencies: ["Arcana", "Language: Elvish"],
      spells: ["Nv0: Mage Hand", "Nv1: Shield"],
      equipment: ["quarterstaff", "mage-armor"],
      features: ["Arcane Recovery"],
      normalized: {
        feats: ["magic-initiate"],
        proficiencies: [
          { kind: "skill", label: "Arcana" },
          { kind: "language", label: "Elvish" },
        ],
        spells: [
          { label: "Mage Hand", level: 0 },
          { label: "Shield", level: 1 },
        ],
        equipment: [
          { itemId: "quarterstaff", label: "quarterstaff", category: "weapon", quantity: 1 },
          { itemId: "mage-armor", label: "mage-armor", category: "armor", quantity: 1 },
        ],
        features: [{ label: "Arcane Recovery", source: "class" }],
      },
    },
    derived: {
      proficiencyBonus: 2,
      hp: 14,
      ac: 15,
      spellcasting: {
        ability: "int",
        attackBonus: 5,
        saveDC: 13,
        slots: { spell1: 4, spell2: 2 },
      },
    },
  };
}

test("characterBuildSchema accepts a valid canonical build", () => {
  const parsed = characterBuildSchema.parse(makeBuild());
  assert.equal(parsed.identity.characterName, "Seraphina Vale");
  assert.equal(parsed.classing.classes[0].classId, "wizard");
  assert.equal(parsed.derived.spellcasting?.ability, "int");
});

test("characterBuildSchema rejects missing class entries", () => {
  const build = makeBuild();
  build.classing.classes = [];

  assert.throws(() => characterBuildSchema.parse(build));
});

test("characterBuildInputSchema accepts a canonical build without derived block", () => {
  const build = makeBuild();
  delete build.derived;

  const parsed = characterBuildInputSchema.parse(build);
  assert.equal(parsed.choices.normalized.spells[0].level, 0);
  assert.equal(parsed.choices.normalized.features[0].source, "class");
});

test("characterBuildSchema rejects normalized spell entries outside 0-9", () => {
  const build = makeBuild();
  build.choices.normalized.spells = [{ label: "Impossible Spell", level: 10 }];

  assert.throws(() => characterBuildSchema.parse(build));
});
