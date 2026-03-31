import test from "node:test";
import assert from "node:assert/strict";

import {
  getSpellCatalogEntry,
  getSpellClasses,
  getSpellsForClass,
  resolveSpellId,
} from "../dist/index.js";

test("spell catalog resolves aliases and ids", () => {
  assert.equal(resolveSpellId("bola de fuego"), "fireball");
  assert.equal(resolveSpellId("Mage Hand"), "mage-hand");
});

test("spell catalog exposes shared class ownership", () => {
  assert.deepEqual(getSpellClasses("fireball"), ["sorcerer", "wizard"]);
  assert.ok(getSpellsForClass("wizard").some((entry) => entry.id === "counterspell"));
  assert.equal(getSpellCatalogEntry("revivificar")?.id, "revivify");
  assert.ok(getSpellsForClass("ranger").some((entry) => entry.id === "hunters-mark"));
  assert.deepEqual(getSpellClasses("find-steed"), ["paladin"]);
});

test("spell catalog keeps minimum breadth for thin casting classes", () => {
  const rangerSpells = getSpellsForClass("ranger");
  const paladinSpells = getSpellsForClass("paladin");
  const artificerSpells = getSpellsForClass("artificer");
  const warlockSpells = getSpellsForClass("warlock");

  assert.ok(rangerSpells.length >= 16);
  assert.ok(paladinSpells.length >= 18);
  assert.ok(artificerSpells.length >= 24);
  assert.ok(warlockSpells.length >= 28);

  assert.ok(rangerSpells.some((entry) => entry.level === 4));
  assert.ok(paladinSpells.some((entry) => entry.level === 3));
  assert.ok(artificerSpells.some((entry) => entry.level === 2));
  assert.ok(warlockSpells.some((entry) => entry.level === 3));
});
