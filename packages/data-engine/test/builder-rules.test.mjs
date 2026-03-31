import test from "node:test";
import assert from "node:assert/strict";

import {
  getClassFallbackMeta,
  getClassArmorOptionIds,
  getBackgroundGrantedProficiencies,
  getClassSkillOptions,
  getClassSkillPickCount,
  getClassWeaponOptionIds,
} from "../dist/index.js";

test("builder rules expose class skill options and pick counts", () => {
  assert.deepEqual(getClassSkillOptions("wizard"), [
    "Arcana",
    "History",
    "Insight",
    "Investigation",
    "Medicine",
    "Religion",
  ]);
  assert.equal(getClassSkillPickCount("wizard"), 2);
  assert.equal(getClassSkillPickCount("rogue"), 4);
  assert.equal(getClassSkillPickCount("unknown-class"), 0);
});

test("builder rules expose background granted proficiencies", () => {
  assert.deepEqual(getBackgroundGrantedProficiencies("criminal"), [
    "Deception",
    "Stealth",
    "Thieves' Tools",
  ]);
  assert.deepEqual(getBackgroundGrantedProficiencies("sage"), [
    "Arcana",
    "History",
  ]);
  assert.deepEqual(getBackgroundGrantedProficiencies("custom"), []);
});

test("builder rules expose equipment availability by class", () => {
  assert.deepEqual(getClassWeaponOptionIds("paladin"), [
    "longsword",
    "warhammer",
    "javelin",
    "light-crossbow",
  ]);
  assert.deepEqual(getClassArmorOptionIds("wizard"), [
    "mage-armor",
    "unarmored",
  ]);
  assert.deepEqual(getClassWeaponOptionIds("unknown-class"), []);
  assert.deepEqual(getClassArmorOptionIds("unknown-class"), []);
});

test("builder rules expose fallback class metadata", () => {
  assert.deepEqual(getClassFallbackMeta("wizard"), {
    hitDie: 6,
    spellcastingAbility: "int",
    casterProgression: "full",
    startingEquipment: ["quarterstaff", "spellbook", "component-pouch", "scholars-pack"],
    primaryAbilities: ["int", "con"],
  });
  assert.equal(getClassFallbackMeta("fighter")?.spellcastingAbility, null);
  assert.equal(getClassFallbackMeta("unknown-class"), undefined);
});
