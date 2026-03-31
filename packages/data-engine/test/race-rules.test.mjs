import test from "node:test";
import assert from "node:assert/strict";

import {
  commonOptionalLanguages,
  getRaceLanguageRule,
  getSubracesForRace,
} from "../dist/index.js";

test("race language rules expose fixed and optional language choices", () => {
  assert.deepEqual(getRaceLanguageRule("dragonborn"), {
    fixed: ["Common", "Draconic"],
  });
  assert.deepEqual(getRaceLanguageRule("half-elf"), {
    fixed: ["Common", "Elvish"],
    choiceCount: 1,
    choiceOptions: commonOptionalLanguages,
  });
  assert.deepEqual(getRaceLanguageRule("unknown-race"), {
    fixed: ["Common"],
  });
});

test("subrace rules expose known subrace options", () => {
  assert.deepEqual(getSubracesForRace("elf").map((entry) => entry.id), [
    "high-elf",
    "wood-elf",
    "drow",
  ]);
  assert.deepEqual(getSubracesForRace("tiefling").map((entry) => entry.label), [
    "Asmodeus Tiefling",
    "Mephistopheles Tiefling",
    "Zariel Tiefling",
  ]);
  assert.deepEqual(getSubracesForRace("human"), []);
});
