# Foundry Manual Validation

## Goal

Run a final human validation pass inside live Foundry VTT before calling the project beta-ready.

## Setup

- open a clean world with the expected `dnd5e` system version;
- enable the Bertini's Vault module;
- generate the current validation fixtures with `corepack pnpm foundry:fixtures`;
- confirm module settings for:
  - default folder
  - create folder if missing
  - show preflight warnings
  - open sheet on create

Use these repo artifacts during the pass:

- `docs/foundry-validation-fixtures/summary.json`
- `docs/foundry-validation-fixtures/README.md`
- `docs/foundry-validation-fixtures/WORKING-REPORT.md`
- `docs/foundry-validation-fixtures/*.json`
- `docs/FOUNDRY-VALIDATION-BASELINE.md`
- `docs/FOUNDRY-MANUAL-VALIDATION-REPORT.md`

## Core Scenarios

### 1. Martial Build

- use fixture `martial-fighter-5`;
- confirm actor is created without blockers;
- verify:
  - class item exists
  - weapon and armor items exist
  - AC and HP are reasonable
  - flags contain canonical metadata

### 2. Caster Build

- use fixture `prepared-cleric-5`;
- verify:
  - spell items are present
  - spellcasting ability is correct
  - spell slots look correct
  - preflight does not diverge from final actor data

### 3. Pact Caster Build

- use fixture `pact-warlock-5`;
- verify:
  - pact slot count is preserved
  - CHA remains the spellcasting ability
  - warlock spell items carry metadata

### 4. Background Feat Build

- use fixture `background-feat`;
- verify:
  - background feat appears
  - chosen feat appears
  - no duplicate feat item leaks into the actor

### 5. Wizard Spellbook Build

- use fixture `wizard-spellbook-5`;
- verify:
  - spellbook-style wizard export remains stable
  - `Spellbook` and `Component Pouch` gear survive import
  - leveled spell metadata survives import

### 6. Warning-Only Build

- use fixture `warning-only`;
- verify:
  - warning notification is visible
  - actor creation still succeeds
  - warning summary is understandable to the operator

### 7. Blocked Build

- use fixture `blocked-invalid-class`;
- verify:
  - actor is not created
  - blocker message is visible
  - UI remains recoverable for the operator

## What To Capture

- screenshots of:
  - preflight warning state
  - success state after actor creation
  - final actor sheet
- short notes for:
  - mismatches between preflight and actor result
  - missing items or wrong quantities
  - confusing operator messaging

## Exit Condition

The pass is acceptable when:

- no blockers appear for valid builds;
- blocked builds stop cleanly;
- warning-only builds remain understandable and usable;
- created actors match the canonical preview closely enough to support beta sharing.
