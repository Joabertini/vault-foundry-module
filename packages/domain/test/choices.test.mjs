import test from "node:test";
import assert from "node:assert/strict";

import {
  getEquipmentEntries,
  getFeatureEntries,
  getProficiencyLabels,
  getSpellEntries,
} from "../dist/index.js";

function makeCharacter(overrides = {}) {
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
      proficiencies: ["Arcana", "Language: Elvish", "Tool: Herbalism Kit"],
      spells: ["Nv0: Mage Hand", "Shield"],
      equipment: ["quarterstaff", "shield"],
      features: ["Arcane Recovery"],
      normalized: {
        proficiencies: [
          { kind: "skill", label: "History" },
          { kind: "language", label: "Draconic" },
          { kind: "tool", label: "Navigator's Tools" },
        ],
        spells: [
          { label: "Magic Missile", level: 1 },
          { label: "Prestidigitation", level: 0 },
        ],
        equipment: [
          { label: "Quarterstaff", itemId: "quarterstaff", category: "weapon", quantity: 1 },
          { label: "Scholar's Pack", itemId: "scholars-pack", category: "gear", quantity: 1 },
        ],
        features: [{ label: "Spellcasting", source: "class" }],
      },
    },
    derived: {
      proficiencyBonus: 2,
      hp: 17,
      ac: 12,
    },
    ...overrides,
  };
}

test("choice helpers prefer normalized entries when present", () => {
  const character = makeCharacter();

  assert.deepEqual(getProficiencyLabels(character, "skill"), ["History"]);
  assert.deepEqual(getProficiencyLabels(character, "language"), ["Draconic"]);
  assert.deepEqual(getProficiencyLabels(character, "tool"), ["Navigator's Tools"]);
  assert.deepEqual(getSpellEntries(character), [
    { name: "Magic Missile", level: 1 },
    { name: "Prestidigitation", level: 0 },
  ]);
  assert.deepEqual(getFeatureEntries(character), [{ name: "Spellcasting", source: "class" }]);
  assert.deepEqual(getEquipmentEntries(character), [
    {
      lookupName: "quarterstaff",
      label: "Quarterstaff",
      category: "weapon",
      quantity: 1,
    },
    {
      lookupName: "scholars-pack",
      label: "Scholar's Pack",
      category: "gear",
      quantity: 1,
    },
  ]);
});

test("choice helpers fall back to legacy arrays when normalized entries are absent", () => {
  const character = makeCharacter({
    choices: {
      feats: [],
      proficiencies: ["Arcana", "Language: Elvish", "Tool: Herbalism Kit"],
      spells: ["Nv0: Mage Hand", "Shield"],
      equipment: ["quarterstaff", "shield"],
      features: ["Arcane Recovery"],
    },
  });

  assert.deepEqual(getProficiencyLabels(character, "skill"), ["Arcana"]);
  assert.deepEqual(getProficiencyLabels(character, "language"), ["Elvish"]);
  assert.deepEqual(getProficiencyLabels(character, "tool"), ["Herbalism Kit"]);
  assert.deepEqual(getSpellEntries(character), [
    { name: "Mage Hand", level: 0 },
    { name: "Shield", level: 1 },
  ]);
  assert.deepEqual(getFeatureEntries(character), [{ name: "Arcane Recovery", source: "class" }]);
  assert.deepEqual(getEquipmentEntries(character), [
    {
      lookupName: "quarterstaff",
      label: "quarterstaff",
      category: "other",
      quantity: 1,
    },
    {
      lookupName: "shield",
      label: "shield",
      category: "other",
      quantity: 1,
    },
  ]);
});
