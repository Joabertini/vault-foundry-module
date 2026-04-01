import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const summaryPath = path.join(repoRoot, "docs", "foundry-validation-fixtures", "summary.json");

const cleanFixtures = [
  "martial-fighter-5",
  "prepared-cleric-5",
  "pact-warlock-5",
  "background-feat",
  "wizard-spellbook-5",
];

const expectedIssueCodesByFixture = new Map([
  [
    "warning-only",
    ["SPELL_ID_LABEL_MISMATCH", "SPELL_LEVEL_MISMATCH", "EQUIPMENT_CATEGORY_MISMATCH"],
  ],
  [
    "blocked-invalid-class",
    ["UNKNOWN_CLASS_ID", "UNEXPECTED_DERIVED_SPELLCASTING"],
  ],
]);

const summary = JSON.parse(await readFile(summaryPath, "utf8"));
const fixtureMap = new Map(summary.fixtures.map((fixture) => [fixture.id, fixture]));
const failures = [];

for (const fixtureId of cleanFixtures) {
  const fixture = fixtureMap.get(fixtureId);
  if (!fixture) {
    failures.push(`Missing clean fixture "${fixtureId}" in ${path.relative(repoRoot, summaryPath)}.`);
    continue;
  }

  if (!fixture.ok || fixture.blockers !== 0 || fixture.warnings !== 0 || fixture.issueCodes.length !== 0) {
    failures.push(
      `Clean fixture "${fixtureId}" drifted: ok=${fixture.ok}, blockers=${fixture.blockers}, warnings=${fixture.warnings}, issueCodes=${fixture.issueCodes.join(", ") || "none"}.`,
    );
  }
}

for (const [fixtureId, expectedIssueCodes] of expectedIssueCodesByFixture.entries()) {
  const fixture = fixtureMap.get(fixtureId);
  if (!fixture) {
    failures.push(`Missing expected warning fixture "${fixtureId}" in ${path.relative(repoRoot, summaryPath)}.`);
    continue;
  }

  const actualIssueCodes = [...fixture.issueCodes].sort();
  const expectedSorted = [...expectedIssueCodes].sort();
  if (JSON.stringify(actualIssueCodes) !== JSON.stringify(expectedSorted)) {
    failures.push(
      `Fixture "${fixtureId}" changed issue codes. Expected ${expectedSorted.join(", ")}, got ${actualIssueCodes.join(", ") || "none"}.`,
    );
  }
}

if (failures.length) {
  console.error("Foundry validation baseline drift detected:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Foundry validation baseline verified for ${summary.fixtures.length} fixtures.`);
