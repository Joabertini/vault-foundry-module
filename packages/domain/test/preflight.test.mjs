import test from "node:test";
import assert from "node:assert/strict";

import { buildPreflightResult } from "../dist/index.js";

function makeInput(overrides = {}) {
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
      proficiencies: [],
      spells: ["Nv0: Mage Hand", "Nv1: Shield"],
      equipment: ["quarterstaff", "mage-armor", "shield"],
      features: [],
    },
    ...overrides,
  };
}

test("buildPreflightResult returns ok for a structurally valid canonical build", () => {
  const result = buildPreflightResult(makeInput(), {
    generatedAt: "2026-03-22T00:00:00.000Z",
    target: {
      rulesVersion: "5e-2014",
      sourceProfile: "vault-v1",
      foundryVersion: "13.351",
      systemId: "dnd5e",
      systemVersion: "5.2.5",
      moduleVersion: "0.1.0",
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.summary.blockers, 0);
  assert.equal(result.summary.warnings, 0);
});

test("buildPreflightResult returns blockers for structural contract failures", () => {
  const result = buildPreflightResult(makeInput({
    classing: {
      classes: [],
    },
  }), {
    generatedAt: "2026-03-22T00:00:00.000Z",
  });

  assert.equal(result.ok, false);
  assert.equal(result.summary.blockers, 1);
  assert.equal(result.issues[0].scope, "canonical-build");
  assert.equal(result.issues[0].path, "classing.classes");
});

test("buildPreflightResult returns warnings for unresolved normalized choices", () => {
  const result = buildPreflightResult(makeInput({
    choices: {
      feats: ["mystery-feat"],
      proficiencies: [],
      spells: [],
      equipment: [],
      features: [],
      normalized: {
        feats: ["mystery-feat"],
        proficiencies: [],
        spells: [{ label: "Unknown Spell", level: 4 }],
        equipment: [{ itemId: "mystery-item", label: "Mystery Item", category: "gear", quantity: 1 }],
        features: [],
      },
    },
  }), {
    generatedAt: "2026-03-22T00:00:00.000Z",
  });

  assert.equal(result.ok, true);
  assert.equal(result.summary.blockers, 0);
  assert.equal(result.summary.warnings, 3);
  assert.deepEqual(
    result.issues.map((issue) => issue.code),
    ["UNKNOWN_CHOSEN_FEAT_ID", "UNRESOLVED_SPELL", "UNRESOLVED_EQUIPMENT"],
  );
});
