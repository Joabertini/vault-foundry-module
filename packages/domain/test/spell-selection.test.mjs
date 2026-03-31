import test from "node:test";
import assert from "node:assert/strict";

import {
  formatSpellChoiceLabel,
  getCantripSelectionLimitForClassLevel,
  getAllowedSpellChoiceLabels,
  getMaxSpellLevelFromSlots,
  sanitizeSpellSelections,
  getSpellSelectionModeLabel,
  getSpellSelectionProfileForClassLevel,
  getSpellSelectionLimitForClassLevel,
  getSpellSelectionModeForClass,
} from "../dist/index.js";

test("shared cantrip limits cover major spellcasting models", () => {
  assert.equal(getCantripSelectionLimitForClassLevel("wizard", 1), 3);
  assert.equal(getCantripSelectionLimitForClassLevel("wizard", 10), 5);
  assert.equal(getCantripSelectionLimitForClassLevel("bard", 4), 3);
  assert.equal(getCantripSelectionLimitForClassLevel("sorcerer", 10), 6);
  assert.equal(getCantripSelectionLimitForClassLevel("warlock", 5), 3);
  assert.equal(getCantripSelectionLimitForClassLevel("artificer", 14), 4);
  assert.equal(getCantripSelectionLimitForClassLevel("ranger", 8), 0);
});

test("shared spell selection limits cover known casters", () => {
  assert.equal(getSpellSelectionLimitForClassLevel("bard", 1, 3), 4);
  assert.equal(getSpellSelectionLimitForClassLevel("sorcerer", 5, 4), 6);
  assert.equal(getSpellSelectionLimitForClassLevel("warlock", 7, 4), 8);
  assert.equal(getSpellSelectionLimitForClassLevel("ranger", 1, 2), 0);
  assert.equal(getSpellSelectionLimitForClassLevel("ranger", 5, 2), 4);
});

test("shared spell selection limits cover prepared casters", () => {
  assert.equal(getSpellSelectionLimitForClassLevel("cleric", 3, 3), 6);
  assert.equal(getSpellSelectionLimitForClassLevel("wizard", 5, 4), 14);
  assert.equal(getSpellSelectionLimitForClassLevel("paladin", 1, 3), 0);
  assert.equal(getSpellSelectionLimitForClassLevel("paladin", 6, 3), 6);
  assert.equal(getSpellSelectionLimitForClassLevel("artificer", 4, 4), 6);
});

test("shared spell selection mode reflects class model", () => {
  assert.equal(getSpellSelectionModeForClass("wizard"), "spellbook");
  assert.equal(getSpellSelectionModeForClass("cleric"), "prepared");
  assert.equal(getSpellSelectionModeForClass("warlock"), "known");
  assert.equal(getSpellSelectionModeForClass("fighter"), "none");
});

test("shared spell selection profile combines mode and limits", () => {
  assert.deepEqual(getSpellSelectionProfileForClassLevel("wizard", 5, 4), {
    mode: "spellbook",
    cantripLimit: 4,
    spellLimit: 14,
  });
  assert.deepEqual(getSpellSelectionProfileForClassLevel("paladin", 1, 3), {
    mode: "prepared",
    cantripLimit: 0,
    spellLimit: 0,
  });
  assert.deepEqual(getSpellSelectionProfileForClassLevel("warlock", 7, 4), {
    mode: "known",
    cantripLimit: 3,
    spellLimit: 8,
  });
});

test("shared spell selection helpers derive labels and max level", () => {
  assert.equal(getSpellSelectionModeLabel("prepared"), "preparados");
  assert.equal(getSpellSelectionModeLabel("spellbook"), "libro");
  assert.equal(getSpellSelectionModeLabel("known"), "conocidos");
  assert.equal(getSpellSelectionModeLabel("none"), "spells");
  assert.equal(formatSpellChoiceLabel({ level: 3, label: "Fireball" }), "Nv3: Fireball");

  assert.equal(getMaxSpellLevelFromSlots({ spell1: 4, spell2: 3, spell3: 0 }), 2);
  assert.equal(getMaxSpellLevelFromSlots({ spell1: 0, spell2: 0, spell3: 0 }), 0);
  assert.equal(getMaxSpellLevelFromSlots({ pact: 2, spell5: 2 }), 5);
});

test("shared spell selection helpers filter and trim choices", () => {
  const allowedLabels = getAllowedSpellChoiceLabels([
    { level: 1, label: "Magic Missile" },
    { level: 3, label: "Fireball" },
  ]);

  assert.ok(allowedLabels.has("Nv1: Magic Missile"));
  assert.ok(allowedLabels.has("Nv3: Fireball"));
  assert.equal(allowedLabels.has("Nv2: Invisibility"), false);

  assert.deepEqual(
    sanitizeSpellSelections({
      selectedCantrips: ["Mage Hand", "Fire Bolt", "Light"],
      selectedSpells: ["Nv1: Magic Missile", "Nv2: Invisibility", "Nv3: Fireball"],
      cantripLimit: 2,
      spellLimit: 1,
      allowedSpells: [
        { level: 1, label: "Magic Missile" },
        { level: 3, label: "Fireball" },
      ],
    }),
    {
      cantrips: ["Mage Hand", "Fire Bolt"],
      spells: ["Nv1: Magic Missile"],
    },
  );
});
