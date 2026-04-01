import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildFoundryExportResult } from "../packages/foundry-exporter/dist/index.js";
import { manualValidationFixtures } from "../packages/foundry-exporter/test/fixtures.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "docs", "foundry-validation-fixtures");

await mkdir(outputDir, { recursive: true });

const summary = [];

for (const fixture of manualValidationFixtures) {
  const character = fixture.build();
  const result = buildFoundryExportResult(character);
  const outputPath = path.join(outputDir, `${fixture.id}.json`);

  await writeFile(
    outputPath,
    `${JSON.stringify(
      {
        fixtureId: fixture.id,
        label: fixture.label,
        preflight: result.preflight,
        payload: result.payload ?? null,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  summary.push({
    id: fixture.id,
    label: fixture.label,
    ok: result.preflight.ok,
    blockers: result.preflight.summary.blockers,
    warnings: result.preflight.summary.warnings,
    output: path.relative(repoRoot, outputPath).replace(/\\/g, "/"),
  });
}

const generatedAt = new Date().toISOString();

await writeFile(
  path.join(outputDir, "summary.json"),
  `${JSON.stringify({ generatedAt, fixtures: summary }, null, 2)}\n`,
  "utf8",
);

const packetLines = [
  "# Foundry Validation Packet",
  "",
  `Generated at: \`${generatedAt}\``,
  "",
  "## Fixture Summary",
  "",
  "| Fixture | Result | Blockers | Warnings | Output |",
  "| --- | --- | ---: | ---: | --- |",
  ...summary.map((fixture) =>
    `| \`${fixture.id}\` | ${fixture.ok ? "ok" : "blocked"} | ${fixture.blockers} | ${fixture.warnings} | \`${fixture.output}\` |`,
  ),
  "",
  "## Manual Validation Workflow",
  "",
  "1. Run `corepack pnpm foundry:fixtures` to refresh the packet.",
  "2. Open `docs/FOUNDRY-MANUAL-VALIDATION.md` for the live Foundry checklist.",
  "3. Record human results in `docs/FOUNDRY-MANUAL-VALIDATION-REPORT.md` or the generated working copy below.",
];

await writeFile(path.join(outputDir, "README.md"), `${packetLines.join("\n")}\n`, "utf8");

const reportLines = [
  "# Foundry Manual Validation Working Copy",
  "",
  `Generated at: \`${generatedAt}\``,
  "",
  "Start from `docs/FOUNDRY-MANUAL-VALIDATION-REPORT.md` for the canonical template.",
  "",
  "## Automatic Baseline",
  "",
  "| Fixture | Label | Preflight | Blockers | Warnings | Output |",
  "| --- | --- | --- | ---: | ---: | --- |",
  ...summary.map((fixture) =>
    `| \`${fixture.id}\` | ${fixture.label} | ${fixture.ok ? "ok" : "blocked"} | ${fixture.blockers} | ${fixture.warnings} | \`${fixture.output}\` |`,
  ),
  "",
  "## Manual Notes",
  "",
  ...summary.flatMap((fixture, index) => [
    `### ${index + 1}. ${fixture.label}`,
    "",
    `- Fixture: \`${fixture.id}\``,
    `- Automatic baseline: ${fixture.ok ? "ok" : "blocked"}; blockers=${fixture.blockers}; warnings=${fixture.warnings}`,
    "- Live Foundry result:",
    "- Notes:",
    "- Screenshot paths:",
    "",
  ]),
];

await writeFile(path.join(outputDir, "WORKING-REPORT.md"), `${reportLines.join("\n")}\n`, "utf8");

console.log(`Exported ${summary.length} Foundry validation fixtures to ${outputDir}`);
