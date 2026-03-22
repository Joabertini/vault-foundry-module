import test from "node:test";
import assert from "node:assert/strict";

import {
  getArmorCatalogEntry,
  getGearCatalogEntry,
  resolveClassId,
  resolveRaceId,
} from "../dist/index.js";

test("catalog lookups resolve canonical armor and gear ids from aliases", () => {
  assert.equal(getArmorCatalogEntry("Armadura de mago")?.id, "mage-armor");
  assert.equal(getGearCatalogEntry("grimorio")?.id, "spellbook");
});

test("label normalization resolves spanish aliases to canonical ids", () => {
  assert.equal(resolveClassId("Picaro"), "rogue");
  assert.equal(resolveRaceId("Semi-Elfo"), "half-elf");
});
