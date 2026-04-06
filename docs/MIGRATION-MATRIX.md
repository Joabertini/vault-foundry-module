# Bertini's Vault - Migration Matrix

This document tracks how the legacy Foundry module is being replaced by the shared monorepo layers.

## Purpose

- show which parts of actor creation still live in legacy JS;
- show which parts already come from the canonical model and shared exporter;
- make it easy for a future AI or human contributor to continue the migration without re-auditing everything.

## Current Flow

1. The active Foundry workflow still starts in the legacy root module.
2. The legacy form is transformed into a canonical `CharacterBuild` through [`scripts/model-bridge.js`](../scripts/model-bridge.js).
3. The legacy runtime now centralizes derived values, canonical build creation, preflight, and actor payload assembly through [`scripts/foundry-pipeline.js`](../scripts/foundry-pipeline.js).
4. A Foundry-like preview is still derived through [`scripts/foundry-export-bridge.js`](../scripts/foundry-export-bridge.js), but both active entrypoints now consume the same transitional pipeline.
5. Final actor creation still happens inside the root Foundry module runtime, but the canonical export flow is no longer duplicated across multiple entrypoints.

## State by Area

| Area | Current source of truth | Status | Notes |
| --- | --- | --- | --- |
| Canonical character contract | `packages/contracts` | Shared | [`packages/contracts/src/character-build.ts`](../packages/contracts/src/character-build.ts) is the canonical schema. |
| Core derivations | `packages/domain` | Shared | HP, AC, proficiency bonus and spellcasting are derived in shared code. |
| Curated datasets | `packages/data-engine` | Shared | Classes, races, backgrounds, feats, spells, weapons, armor and gear now live outside the legacy module. |
| BFF datasets | `apps/api` | Shared | Web already consumes semantic dataset endpoints with local/upstream/hybrid modes. |
| Web builder snapshot | `apps/web` -> `CharacterBuild` | Shared | Web builder already produces canonical snapshots and Foundry previews. |
| Legacy form -> canonical build | `scripts/model-bridge.js` | Transitional | Temporary bridge until Foundry module consumes shared contracts directly. |
| Legacy form -> canonical export pipeline | `scripts/foundry-pipeline.js` | Transitional | Single transitional path for derived stats, canonical build, preflight and actor create data inside the Foundry runtime. |
| Canonical build -> Foundry preview in legacy module | `scripts/foundry-export-bridge.js` | Transitional | Temporary JS mirror of the shared exporter logic. |
| Final actor assembly inside Foundry | `scripts/vault-app.js` + `scripts/character-builder.js` | Transitional | Both entrypoints now reuse the same canonical export pipeline, but the runtime still lives in the legacy root module. |

## Fields Already Reused from Canonical Preview

The legacy builder already reuses canonical preview data for these sections:

- `system.abilities`
- `system.spells`
- `system.attributes.ac`
- `system.attributes.hp`
- `system.attributes.spellcasting`
- `system.details.alignment`
- `system.details.biography`
- `system.details.race`
- `system.details.background`
- `system.details.originalClass`
- `system.details.trait`
- `system.details.ideal`
- `system.details.bond`
- `system.details.flaw`
- `system.traits.weaponProf`
- `system.traits.armorProf`
- `items` of type `class`
- `items` of type `feat`
- `items` of type `spell`
- main weapon item when it can be resolved from preview

These integrations are visible in [`scripts/character-builder.js`](../scripts/character-builder.js).

## Still Legacy-Driven

The following areas still need deliberate migration work:

- remaining detailed `system` sections that are still assembled only in legacy JS;
- token handling still finalized by legacy builder;
- form normalization rules duplicated in bridges and in the shared packages;
- runtime Foundry module still lives at repo root instead of `apps/foundry-module`.

## Main Duplication Hotspots

These files should be treated as temporary mirrors that must converge over time:

- [`scripts/model-bridge.js`](../scripts/model-bridge.js)
- [`scripts/foundry-pipeline.js`](../scripts/foundry-pipeline.js)
- [`scripts/foundry-export-bridge.js`](../scripts/foundry-export-bridge.js)
- [`packages/foundry-exporter/src/index.ts`](../packages/foundry-exporter/src/index.ts)

Whenever a Foundry-facing rule changes, compare all three before assuming the migration is complete.

## Recommended Next Migration Moves

1. Reduce duplication between `scripts/foundry-export-bridge.js` and `packages/foundry-exporter/src/index.ts`.
2. Keep replacing bridge internals with the shared exporter package until `scripts/foundry-pipeline.js` becomes a thin import adapter.
3. Replace label-based free text in the bridges with canonical ids wherever possible.
4. Move the active Foundry module runtime into `apps/foundry-module` only after the shared exporter is trusted by tests.

## Procedural Gap Compared With `ddimport.js`

[`docs/DDIMPORT-COMPARISON.md`](./DDIMPORT-COMPARISON.md) should now be treated as the operational benchmark for future import/export work.

The main migration gap is no longer only "which file owns which actor field".

We also need to formalize these stages across web, exporter and Foundry module:

- preflight validation before final export/import;
- resolved export package as explicit intermediate aggregate;
- persisted import/export settings;
- status reporting for validation, export and Foundry-side import;
- final Foundry sync as a first-class workflow phase.

## Exit Criteria for This Migration

The legacy transition is effectively finished when:

- the Foundry module consumes shared contracts and exporter logic directly;
- `scripts/foundry-export-bridge.js` is no longer needed;
- `scripts/model-bridge.js` is either tiny or replaced by typed shared logic;
- the final actor no longer depends on legacy-only assembly paths.
