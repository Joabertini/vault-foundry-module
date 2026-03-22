import test from "node:test";
import assert from "node:assert/strict";

import { buildFoundryActorPayload, buildFoundryExportResult } from "../dist/index.js";

function makeCharacterBuild() {
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
      biography: {
        trait: "Always writes everything down.",
        ideal: "Knowledge before fear.",
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
      feats: ["alert"],
      proficiencies: ["Arcana", "Investigation", "Language: Elvish", "Tool: Thieves' Tools"],
      spells: ["Nv0: Mage Hand", "Nv1: Shield"],
      equipment: ["quarterstaff", "mage-armor", "spellbook", "component-pouch"],
      features: ["Arcane Recovery"],
      normalized: {
        feats: ["alert"],
        proficiencies: [
          { kind: "skill", label: "Arcana" },
          { kind: "skill", label: "Investigation" },
          { kind: "language", label: "Elvish" },
          { kind: "tool", label: "Thieves' Tools" },
        ],
        spells: [
          { label: "Mage Hand", level: 0 },
          { label: "Shield", level: 1 },
        ],
        equipment: [
          { itemId: "quarterstaff", label: "Quarterstaff", quantity: 1, category: "weapon" },
          { itemId: "mage-armor", label: "Mage Armor", quantity: 1, category: "armor" },
          { label: "spellbook", quantity: 1, category: "gear" },
          { label: "component-pouch", quantity: 1, category: "gear" },
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
        slots: {
          spell1: 4,
          spell2: 2,
          spell3: 0,
          spell4: 0,
          spell5: 0,
          spell6: 0,
          spell7: 0,
          spell8: 0,
          spell9: 0,
        },
      },
    },
  };
}

test("buildFoundryActorPayload maps canonical build into a richer Foundry actor", () => {
  const payload = buildFoundryActorPayload(makeCharacterBuild());

  assert.equal(payload.name, "Seraphina Vale");
  assert.equal(payload.system.attributes.ac.flat, 15);
  assert.equal(payload.system.attributes.hp.value, 14);
  assert.equal(payload.system.traits.languages.value.includes("elvish"), true);
  assert.equal(payload.system.tools.thief.prof, 1);

  const itemTypes = payload.items.map((item) => item.type);
  assert.equal(itemTypes.includes("class"), true);
  assert.equal(itemTypes.includes("spell"), true);
  assert.equal(itemTypes.includes("weapon"), true);
  assert.equal(itemTypes.includes("loot"), true);
});

test("buildFoundryActorPayload prefers normalized choices when present", () => {
  const build = makeCharacterBuild();
  build.choices.proficiencies = ["Language: Draconic"];
  build.choices.spells = ["Nv9: Wrong Spell"];
  build.choices.equipment = ["wrong-item"];
  build.choices.features = ["Wrong Feature"];

  const payload = buildFoundryActorPayload(build);

  assert.equal(payload.system.traits.languages.value.includes("draconic"), false);
  assert.equal(payload.items.some((item) => item.name === "Shield" && item.type === "spell"), true);
  assert.equal(payload.items.some((item) => item.name === "Wrong Spell"), false);
  assert.equal(payload.items.some((item) => item.name === "Arcane Recovery" && item.type === "feat"), true);
  assert.equal(payload.items.some((item) => item.name === "wrong-item"), false);
});

test("buildFoundryExportResult returns preflight summary alongside payload", () => {
  const result = buildFoundryExportResult(makeCharacterBuild());

  assert.equal(result.preflight.ok, true);
  assert.equal(result.preflight.summary.blockers, 0);
  assert.equal(result.payload?.flags["bertinis-vault"].preflight.warnings, 0);
});

test("buildFoundryExportResult omits payload when preflight has blockers", () => {
  const build = makeCharacterBuild();
  build.classing.classes[0].classId = "unknown-class";

  const result = buildFoundryExportResult(build);

  assert.equal(result.preflight.ok, false);
  assert.equal(result.preflight.summary.blockers, 1);
  assert.equal(result.payload, undefined);
});
