import test from "node:test";
import assert from "node:assert/strict";

import {
  getBackgroundGrantedProficiencies,
  getClassSkillOptions,
  getClassSkillPickCount,
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
