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

test("buildFoundryActorPayload enriches spell items with lookup metadata", () => {
  const payload = buildFoundryActorPayload(makeCharacterBuild());
  const shield = payload.items.find((item) => item.name === "Shield" && item.type === "spell");

  assert.equal(shield?.system?.identifier, "shield");
  assert.equal(shield?._stats?.compendiumSource, null);
  assert.equal(shield?.flags?.["bertinis-vault"]?.reference?.spellId, "shield");
  assert.equal(shield?.flags?.plutonium?.page, "spells.html");
  assert.equal(shield?.flags?.plutonium?.source, "PHB");
  assert.equal(shield?.flags?.plutonium?.hash, "shield_phb");
  assert.equal(shield?.flags?.plutonium?.propDroppable, "spell");
  assert.equal(shield?.system?.description?.value.includes("Compendium lookup"), true);
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

test("buildFoundryActorPayload keeps prepared caster exports coherent for clerics", () => {
  const build = makeCharacterBuild();
  build.identity.characterName = "Ilyra Dawn";
  build.ancestry.raceId = "aasimar";
  build.classing.classes = [{ classId: "cleric", level: 5 }];
  build.background.backgroundId = "acolyte";
  build.background.grantedFeatIds = [];
  build.abilities.base = { str: 10, dex: 12, con: 14, int: 8, wis: 17, cha: 13 };
  build.abilities.final = { str: 10, dex: 12, con: 14, int: 8, wis: 17, cha: 13 };
  build.choices.feats = [];
  build.choices.proficiencies = ["Insight", "Religion", "Language: Celestial"];
  build.choices.spells = ["Nv0: Sacred Flame", "Nv3: Spirit Guardians"];
  build.choices.equipment = ["mace", "shield", "chain-mail", "holy-symbol"];
  build.choices.features = ["Channel Divinity"];
  build.choices.normalized = {
    feats: [],
    proficiencies: [
      { kind: "skill", label: "Insight" },
      { kind: "skill", label: "Religion" },
      { kind: "language", label: "Celestial" },
    ],
    spells: [
      { label: "Sacred Flame", level: 0 },
      { label: "Spirit Guardians", level: 3 },
    ],
    equipment: [
      { itemId: "mace", label: "Mace", quantity: 1, category: "weapon" },
      { itemId: "shield", label: "Shield", quantity: 1, category: "shield" },
      { itemId: "chain-mail", label: "Chain Mail", quantity: 1, category: "armor" },
      { label: "holy-symbol", quantity: 1, category: "gear" },
    ],
    features: [{ label: "Channel Divinity", source: "class" }],
  };
  build.derived = {
    proficiencyBonus: 3,
    hp: 33,
    ac: 18,
    spellcasting: {
      ability: "wis",
      attackBonus: 6,
      saveDC: 14,
      slots: {
        spell1: 4,
        spell2: 3,
        spell3: 2,
        spell4: 0,
        spell5: 0,
        spell6: 0,
        spell7: 0,
        spell8: 0,
        spell9: 0,
      },
    },
  };

  const payload = buildFoundryActorPayload(build);

  assert.equal(payload.system.attributes.hp.value, 33);
  assert.equal(payload.system.attributes.ac.flat, 18);
  assert.equal(payload.system.attributes.spellcasting, "wis");
  assert.equal(payload.system.traits.languages.value.includes("celestial"), true);
  assert.equal(payload.items.some((item) => item.name === "Spirit Guardians" && item.type === "spell"), true);
  assert.equal(payload.items.some((item) => item.name === "Shield" && item.type === "equipment"), true);
});

test("buildFoundryActorPayload keeps pact caster exports coherent for warlocks", () => {
  const build = makeCharacterBuild();
  build.identity.characterName = "Nox Vey";
  build.classing.classes = [{ classId: "warlock", level: 5 }];
  build.background.backgroundId = "charlatan";
  build.background.grantedFeatIds = [];
  build.abilities.base = { str: 8, dex: 14, con: 14, int: 10, wis: 12, cha: 18 };
  build.abilities.final = { str: 8, dex: 14, con: 14, int: 10, wis: 12, cha: 18 };
  build.choices.feats = [];
  build.choices.proficiencies = ["Deception", "Arcana"];
  build.choices.spells = ["Nv0: Eldritch Blast", "Nv3: Hunger of Hadar"];
  build.choices.equipment = ["dagger", "leather", "arcane-focus"];
  build.choices.features = ["Pact Magic"];
  build.choices.normalized = {
    feats: [],
    proficiencies: [
      { kind: "skill", label: "Deception" },
      { kind: "skill", label: "Arcana" },
    ],
    spells: [
      { label: "Eldritch Blast", level: 0 },
      { label: "Hunger of Hadar", level: 3 },
    ],
    equipment: [
      { itemId: "dagger", label: "Dagger", quantity: 1, category: "weapon" },
      { itemId: "leather", label: "Leather Armor", quantity: 1, category: "armor" },
      { label: "arcane-focus", quantity: 1, category: "gear" },
    ],
    features: [{ label: "Pact Magic", source: "class" }],
  };
  build.derived = {
    proficiencyBonus: 3,
    hp: 38,
    ac: 14,
    spellcasting: {
      ability: "cha",
      attackBonus: 7,
      saveDC: 15,
      slots: {
        spell1: 0,
        spell2: 0,
        spell3: 2,
        spell4: 0,
        spell5: 0,
        spell6: 0,
        spell7: 0,
        spell8: 0,
        spell9: 0,
      },
    },
  };

  const payload = buildFoundryActorPayload(build);
  const hungerOfHadar = payload.items.find((item) => item.name === "Hunger of Hadar" && item.type === "spell");

  assert.equal(payload.system.attributes.spellcasting, "cha");
  assert.equal(payload.system.spells.spell3, 2);
  assert.equal(hungerOfHadar?.system?.level, 3);
  assert.equal(payload.items.some((item) => item.name === "Pact Magic" && item.type === "feat"), true);
});

test("buildFoundryActorPayload includes background-granted feats alongside chosen feats", () => {
  const build = makeCharacterBuild();
  build.background.backgroundId = "wildspacer";
  build.background.grantedFeatIds = ["tough"];
  build.choices.feats = ["alert"];
  build.choices.normalized.feats = ["alert"];

  const payload = buildFoundryActorPayload(build);
  const featNames = payload.items.filter((item) => item.type === "feat").map((item) => item.name);

  assert.equal(featNames.includes("Tough"), true);
  assert.equal(featNames.includes("Alert"), true);
});

test("buildFoundryActorPayload keeps wizard spellbook exports stable", () => {
  const build = makeCharacterBuild();
  build.identity.characterName = "Mira Quill";
  build.classing.classes = [{ classId: "wizard", level: 5 }];
  build.background.backgroundId = "sage";
  build.background.grantedFeatIds = ["magic-initiate"];
  build.abilities.base = { str: 8, dex: 14, con: 14, int: 18, wis: 12, cha: 10 };
  build.abilities.final = { str: 8, dex: 14, con: 14, int: 18, wis: 12, cha: 10 };
  build.choices.spells = ["Nv0: Mage Hand", "Nv1: Shield", "Nv3: Fireball"];
  build.choices.equipment = ["quarterstaff", "spellbook", "component-pouch"];
  build.choices.features = ["Arcane Recovery"];
  build.choices.normalized.spells = [
    { spellId: "mage-hand", label: "Mage Hand", level: 0 },
    { spellId: "shield", label: "Shield", level: 1 },
    { spellId: "fireball", label: "Fireball", level: 3 },
  ];
  build.choices.normalized.equipment = [
    { itemId: "quarterstaff", label: "Quarterstaff", quantity: 1, category: "weapon" },
    { label: "spellbook", quantity: 1, category: "gear" },
    { label: "component-pouch", quantity: 1, category: "gear" },
  ];
  build.derived = {
    proficiencyBonus: 3,
    hp: 32,
    ac: 14,
    spellcasting: {
      ability: "int",
      attackBonus: 7,
      saveDC: 15,
      slots: {
        spell1: 4,
        spell2: 3,
        spell3: 2,
        spell4: 0,
        spell5: 0,
        spell6: 0,
        spell7: 0,
        spell8: 0,
        spell9: 0,
      },
    },
  };

  const payload = buildFoundryActorPayload(build);
  const lootItems = payload.items.filter((item) => item.type === "loot");
  const spellNames = payload.items.filter((item) => item.type === "spell").map((item) => item.name);
  const fireball = payload.items.find((item) => item.name === "Fireball" && item.type === "spell");

  assert.equal(payload.system.attributes.spellcasting, "int");
  assert.equal(payload.system.spells.spell3, 2);
  assert.equal(lootItems.some((item) => item.name === "Spellbook"), true);
  assert.equal(lootItems.some((item) => item.name === "Component Pouch"), true);
  assert.equal(spellNames.includes("Mage Hand"), true);
  assert.equal(spellNames.includes("Shield"), true);
  assert.equal(spellNames.includes("Fireball"), true);
  assert.equal(fireball?.flags?.["bertinis-vault"]?.reference?.spellId, "fireball");
});

test("buildFoundryActorPayload defensively deduplicates duplicate spell items", () => {
  const build = makeCharacterBuild();
  build.choices.normalized.spells = [
    { spellId: "shield", label: "Shield", level: 1 },
    { spellId: "shield", label: "Shield", level: 1 },
    { label: "Mage Hand", level: 0 },
    { label: "Mage Hand", level: 0 },
  ];

  const payload = buildFoundryActorPayload(build);
  const spellItems = payload.items.filter((item) => item.type === "spell");

  assert.equal(spellItems.filter((item) => item.name === "Shield").length, 1);
  assert.equal(spellItems.filter((item) => item.name === "Mage Hand").length, 1);
});
