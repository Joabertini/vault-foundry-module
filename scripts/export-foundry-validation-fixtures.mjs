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

await writeFile(
  path.join(outputDir, "summary.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), fixtures: summary }, null, 2)}\n`,
  "utf8",
);

console.log(`Exported ${summary.length} Foundry validation fixtures to ${outputDir}`);
