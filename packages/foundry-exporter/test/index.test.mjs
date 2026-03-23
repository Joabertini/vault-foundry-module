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

test("buildFoundryActorPayload preserves mixed equipment entries and quantities", () => {
  const build = makeCharacterBuild();
  build.choices.normalized.equipment = [
    { itemId: "quarterstaff", label: "Quarterstaff", quantity: 2, category: "weapon" },
    { itemId: "dagger", label: "Dagger", quantity: 1, category: "weapon" },
    { itemId: "mage-armor", label: "Mage Armor", quantity: 1, category: "armor" },
    { itemId: "shield", label: "Shield", quantity: 1, category: "shield" },
    { itemId: "chain-mail", label: "Chain Mail", quantity: 1, category: "armor" },
    { itemId: "rope-hempen", label: "Hempen Rope", quantity: 2, category: "gear" },
  ];

  const payload = buildFoundryActorPayload(build);
  const equipmentItems = payload.items.filter((item) =>
    ["weapon", "equipment", "loot"].includes(item.type),
  );
  const equippedItems = equipmentItems.filter((item) => item.system?.equipped === true);

  assert.equal(equipmentItems.filter((item) => item.type === "weapon").length, 2);
  assert.equal(equipmentItems.filter((item) => item.type === "equipment").length, 3);
  assert.equal(equipmentItems.filter((item) => item.type === "loot").length, 1);
  assert.equal(equipmentItems.find((item) => item.name === "quarterstaff")?.system?.quantity, 2);
  assert.equal(equipmentItems.find((item) => item.name === "Hempen Rope")?.system?.quantity, 2);
  assert.equal(equippedItems.filter((item) => item.name === "Mage Armor").length, 1);
  assert.equal(equippedItems.filter((item) => item.name === "Shield").length, 1);
  assert.equal(equippedItems.filter((item) => item.name === "Chain Mail").length, 0);
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

test("buildFoundryExportResult propagates richer warnings from preflight", () => {
  const build = makeCharacterBuild();
  build.choices.normalized.spells = [{ spellId: "fireball", label: "Shield", level: 1 }];
  build.choices.normalized.equipment = [
    { itemId: "shield", label: "Shield", quantity: 1, category: "armor" },
  ];

  const result = buildFoundryExportResult(build);

  assert.equal(result.preflight.ok, true);
  assert.equal(result.preflight.summary.warnings, 3);
  assert.deepEqual(
    result.preflight.issues.map((issue) => issue.code),
    ["SPELL_ID_LABEL_MISMATCH", "SPELL_LEVEL_MISMATCH", "EQUIPMENT_CATEGORY_MISMATCH"],
  );
});

test("buildFoundryExportResult propagates derived consistency warnings", () => {
  const build = makeCharacterBuild();
  build.classing.classes = [
    { classId: "wizard", level: 2 },
    { classId: "wizard", level: 1 },
  ];
  build.derived.proficiencyBonus = 3;
  build.derived.spellcasting = {
    ability: "wis",
    attackBonus: 7,
    saveDC: 13,
    slots: {
      spell1: 2,
      spell2: 0,
      spell3: 0,
      spell4: 0,
      spell5: 0,
      spell6: 0,
      spell7: 0,
      spell8: 0,
      spell9: 0,
    },
  };

  const result = buildFoundryExportResult(build);

  assert.equal(result.preflight.ok, true);
  assert.deepEqual(
    result.preflight.issues.map((issue) => issue.code),
    [
      "DUPLICATE_CLASS_ID",
      "DERIVED_PROFICIENCY_BONUS_MISMATCH",
      "DERIVED_SPELL_ABILITY_MISMATCH",
      "DERIVED_SPELL_ATTACK_BONUS_MISMATCH",
      "DERIVED_SPELL_SLOTS_MISMATCH",
    ],
  );
});

test("buildFoundryExportResult propagates proficiency warnings from preflight", () => {
  const build = makeCharacterBuild();
  build.choices.normalized.proficiencies = [
    { kind: "skill", label: "Arcana" },
    { kind: "skill", label: "Arcana" },
    { kind: "skill", label: "Language: Elvish" },
    { kind: "tool", label: "Unknown Kit" },
  ];

  const result = buildFoundryExportResult(build);

  assert.equal(result.preflight.ok, true);
  assert.deepEqual(
    result.preflight.issues.map((issue) => issue.code),
    [
      "DUPLICATE_PROFICIENCY_ENTRY",
      "PROFICIENCY_KIND_LABEL_MISMATCH",
      "UNRESOLVED_PROFICIENCY",
      "UNRESOLVED_PROFICIENCY",
    ],
  );
});

test("buildFoundryExportResult propagates duplicate warnings from preflight", () => {
  const build = makeCharacterBuild();
  build.background.grantedFeatIds = ["alert", "alert"];
  build.choices.feats = ["alert", "alert"];
  build.choices.normalized.spells = [
    { label: "Shield", level: 1 },
    { label: "Shield", level: 1 },
  ];
  build.choices.normalized.equipment = [
    { itemId: "shield", label: "Shield", quantity: 1, category: "shield" },
    { itemId: "shield", label: "Shield", quantity: 1, category: "shield" },
  ];

  const result = buildFoundryExportResult(build);

  assert.equal(result.preflight.ok, true);
  assert.deepEqual(
    result.preflight.issues.map((issue) => issue.code),
    [
      "DUPLICATE_GRANTED_FEAT_ID",
      "DUPLICATE_CHOSEN_FEAT_ID",
      "DUPLICATE_SPELL_ENTRY",
      "DUPLICATE_EQUIPMENT_ENTRY",
    ],
  );
  assert.equal(result.payload?.flags["bertinis-vault"].preflight.warnings, 4);
});
