import test from "node:test";
import assert from "node:assert/strict";

import {
  preflightIssueSchema,
  preflightResultSchema,
} from "../dist/index.js";

function makePreflightResult() {
  return {
    ok: false,
    generatedAt: "2026-03-22T00:00:00.000Z",
    target: {
      rulesVersion: "5e-2014",
      sourceProfile: "vault-v1",
      foundryVersion: "13.351",
      systemId: "dnd5e",
      systemVersion: "5.2.5",
      moduleVersion: "0.1.0",
    },
    issues: [
      {
        code: "UNRESOLVED_SPELL_ID",
        message: "Spell could not be resolved to a canonical id.",
        severity: "warning",
        scope: "foundry-export",
        path: "choices.normalized.spells[0]",
        source: "exporter",
        canonicalId: "shield",
        details: {
          label: "Shield",
        },
      },
      {
        code: "MISSING_CLASS",
        message: "Character build must include at least one class.",
        severity: "blocker",
        scope: "canonical-build",
        path: "classing.classes",
        source: "contracts",
      },
    ],
    summary: {
      blockers: 1,
      warnings: 1,
      info: 0,
      total: 2,
    },
  };
}

test("preflightResultSchema accepts a valid result payload", () => {
  const parsed = preflightResultSchema.parse(makePreflightResult());
  assert.equal(parsed.issues[0].severity, "warning");
  assert.equal(parsed.target.systemId, "dnd5e");
  assert.equal(parsed.summary.total, 2);
});

test("preflightIssueSchema defaults source to other", () => {
  const parsed = preflightIssueSchema.parse({
    code: "TEST_INFO",
    message: "Informational note.",
    severity: "info",
    scope: "compatibility",
  });

  assert.equal(parsed.source, "other");
});

test("preflightResultSchema rejects negative summary counts", () => {
  const result = makePreflightResult();
  result.summary.blockers = -1;

  assert.throws(() => preflightResultSchema.parse(result));
});
