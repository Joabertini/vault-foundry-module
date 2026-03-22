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

test("buildPreflightResult blocks builds whose total class levels exceed 20", () => {
  const result = buildPreflightResult(makeInput({
    classing: {
      classes: [
        { classId: "wizard", level: 12 },
        { classId: "fighter", level: 9 },
      ],
    },
  }), {
    generatedAt: "2026-03-22T00:00:00.000Z",
  });

  assert.equal(result.ok, false);
  assert.equal(result.summary.blockers, 1);
  assert.equal(result.issues[0].code, "TOTAL_LEVEL_EXCEEDS_20");
});

test("buildPreflightResult warns on spell id mismatches and equipment category mismatches", () => {
  const result = buildPreflightResult(makeInput({
    choices: {
      feats: [],
      proficiencies: [],
      spells: [],
      equipment: [],
      features: [],
      normalized: {
        feats: [],
        proficiencies: [],
        spells: [{ spellId: "fireball", label: "Shield", level: 1 }],
        equipment: [{ itemId: "shield", label: "Shield", category: "armor", quantity: 1 }],
        features: [],
      },
    },
  }), {
    generatedAt: "2026-03-22T00:00:00.000Z",
  });

  assert.equal(result.ok, true);
  assert.equal(result.summary.warnings, 3);
  assert.deepEqual(
    result.issues.map((issue) => issue.code),
    ["SPELL_ID_LABEL_MISMATCH", "SPELL_LEVEL_MISMATCH", "EQUIPMENT_CATEGORY_MISMATCH"],
  );
});

test("buildPreflightResult warns on duplicate multiclass entries and stale derived spellcasting", () => {
  const result = buildPreflightResult({
    ...makeInput({
      classing: {
        classes: [
          { classId: "wizard", level: 2 },
          { classId: "wizard", level: 1 },
        ],
      },
    }),
    derived: {
      proficiencyBonus: 3,
      hp: 14,
      ac: 15,
      spellcasting: {
        ability: "wis",
        attackBonus: 7,
        saveDC: 15,
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
      },
    },
  }, {
    generatedAt: "2026-03-22T00:00:00.000Z",
  });

  assert.equal(result.ok, true);
  assert.equal(result.summary.warnings, 6);
  assert.deepEqual(
    result.issues.map((issue) => issue.code),
    [
      "DUPLICATE_CLASS_ID",
      "DERIVED_PROFICIENCY_BONUS_MISMATCH",
      "DERIVED_SPELL_ABILITY_MISMATCH",
      "DERIVED_SPELL_ATTACK_BONUS_MISMATCH",
      "DERIVED_SPELL_SAVE_DC_MISMATCH",
      "DERIVED_SPELL_SLOTS_MISMATCH",
    ],
  );
});

test("buildPreflightResult warns when non-caster builds carry derived spellcasting", () => {
  const result = buildPreflightResult({
    ...makeInput({
      classing: {
        classes: [{ classId: "fighter", level: 3 }],
      },
    }),
    derived: {
      proficiencyBonus: 2,
      hp: 22,
      ac: 16,
      spellcasting: {
        ability: "int",
        attackBonus: 4,
        saveDC: 12,
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
      },
    },
  }, {
    generatedAt: "2026-03-22T00:00:00.000Z",
  });

  assert.equal(result.ok, true);
  assert.equal(result.summary.warnings, 1);
  assert.equal(result.issues[0].code, "UNEXPECTED_DERIVED_SPELLCASTING");
});

test("buildPreflightResult warns on unresolved, duplicate, and mismatched proficiencies", () => {
  const result = buildPreflightResult(makeInput({
    choices: {
      feats: [],
      proficiencies: [],
      spells: [],
      equipment: [],
      features: [],
      normalized: {
        feats: [],
        proficiencies: [
          { kind: "skill", label: "Arcana" },
          { kind: "skill", label: "Arcana" },
          { kind: "skill", label: "Language: Elvish" },
          { kind: "tool", label: "Unknown Kit" },
        ],
        spells: [],
        equipment: [],
        features: [],
      },
    },
  }), {
    generatedAt: "2026-03-22T00:00:00.000Z",
  });

  assert.equal(result.ok, true);
  assert.equal(result.summary.warnings, 4);
  assert.deepEqual(
    result.issues.map((issue) => issue.code),
    [
      "DUPLICATE_PROFICIENCY_ENTRY",
      "PROFICIENCY_KIND_LABEL_MISMATCH",
      "UNRESOLVED_PROFICIENCY",
      "UNRESOLVED_PROFICIENCY",
    ],
  );
});

test("buildPreflightResult warns on unresolved and duplicate legacy proficiencies", () => {
  const result = buildPreflightResult(makeInput({
    choices: {
      feats: [],
      proficiencies: ["Arcana", "Arcana", "Language: ???"],
      spells: [],
      equipment: [],
      features: [],
    },
  }), {
    generatedAt: "2026-03-22T00:00:00.000Z",
  });

  assert.equal(result.ok, true);
  assert.equal(result.summary.warnings, 2);
  assert.deepEqual(
    result.issues.map((issue) => issue.code),
    ["DUPLICATE_PROFICIENCY_ENTRY", "UNRESOLVED_PROFICIENCY"],
  );
});
