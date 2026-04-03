# Foundry JSON Pipeline Analysis

## Scope

This document captures the exact JSON export pipeline and the structural comparison between:

- native Foundry export: `fvtt-Actor-alpaca-L8nBWSEkSrHKABu3.json`
- builder exports: `rambo.foundry-actor.json`, `rambo.foundry-actor2.json`, `rambo.foundry-actor 3.json`, `rambo.foundry-actor 4.json`

## Pipeline Architecture

1. Web state collection
- File: `apps/web/src/App.tsx`
- UI collects form data and stores it in `BuilderState`.

2. Canonical snapshot
- File: `apps/web/src/builder.ts`
- `buildCanonicalSnapshot(state)` derives normalized contract payload.

3. Exporter invocation
- File: `apps/web/src/App.tsx`
- `buildFoundryExportResult(canonicalSnapshot)` returns:
  - `preflight` diagnostics
  - `payload` (actor JSON) when not blocked.

4. Foundry payload construction
- File: `packages/foundry-exporter/src/index.ts`
- Main entry:
  - `buildFoundryExportResult`
  - `buildFoundryActorPayloadUnchecked`
- Internal builders:
  - `buildFoundryAbilities`
  - `buildFoundrySpellSlots`
  - `buildSkills`
  - `buildTools`
  - `buildTraitData`
  - `buildItems` and item factories (`buildClassItems`, `buildSpellItem`, `buildFeatItem`, `buildWeaponItem`, `buildArmorItem`, `buildGearItem`).

5. File download
- File: `apps/web/src/App.tsx`
- `downloadActorJson()` serializes `foundryPreview` and triggers client download.

## Structural Findings (Native vs Rambo Variants)

### rambo.foundry-actor.json (oldest)
- Hard mismatch in `system.spells`: numbers instead of `{ value }`.
- Incomplete actor shape (`ac`, `hp`, abilities roll blocks).
- Not import-safe for current dnd5e schema.

### rambo.foundry-actor2.json / rambo.foundry-actor 3.json
- Large improvements over v1.
- Remaining mismatches on AC strategy (`flat` number), movement/details consistency, and pact/extra fields.

### rambo.foundry-actor 4.json
- Closest version to native, but still had critical drifts:
  - non-native spell slot subshape (`override`, `level`, `max`) vs native `{ value }` and `pact: { value }`
  - non-native actor attributes (init bonus type, movement/senses units)
  - non-native spell item field (`sourceClass`)
  - download filename still non-native format

## Why Import Can Still Fail After "Mostly Correct" JSON

Foundry dnd5e validation can fail on nested documents (`items`) even when root actor shape looks correct.
The most sensitive area in this codebase was spell item shape and extra fields that do not appear in native exports.

## Naming Format Relevance

Question: Does filename format itself block import?

- Practical answer: normally no, because Foundry reads JSON content, not semantic filename.
- Operational answer: still worth matching native pattern to reduce operator confusion and avoid tool-specific assumptions in downstream workflows.

Native pattern observed:
- `fvtt-Actor-<slug>-<id>.json`

Builder now emits this pattern for downloads.

## Fixes Applied in This Slice

1. Exporter aligned back toward native actor shape:
- `system.attributes.ac` -> `{ calc: "default", flat: null }`
- `system.attributes.hp` -> `{ max: null, temp: null, tempmax: 0, value, bonuses }`
- `system.attributes.init.bonus` -> string
- `system.attributes.movement` -> minimal native-style object
- `system.attributes.senses.units` -> `null`
- `system.details` -> includes native flat text fields (`eyes`, `height`, `faith`, etc.)
- `system.spells` -> spell levels as `{ value }`, pact as `{ value }`

2. Spell item cleanup:
- removed non-native `sourceClass` field
- expanded target template/affects subshape to match native spell item style

3. Download filename normalization:
- web export now uses:
  - `fvtt-Actor-<slug>-<random16>.json`

## Verification

Executed successfully:

- `corepack pnpm --filter @bertinis-vault/foundry-exporter test`
- `corepack pnpm web:typecheck`
- `corepack pnpm --filter @bertinis-vault/contracts build`
- `corepack pnpm mvp:verify`

## Remaining Risk

The remaining unknown is runtime import acceptance inside Foundry UI with a freshly generated file after these shape changes.
If import still fails, next target is item-level parity for `equipment` and `weapon` nested subfields compared to native exports from caster actors.
