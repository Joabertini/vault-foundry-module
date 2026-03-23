# Foundry Manual Validation

## Goal

Run a final human validation pass inside live Foundry VTT before calling the project beta-ready.

## Setup

- open a clean world with the expected `dnd5e` system version;
- enable the Bertini's Vault module;
- confirm module settings for:
  - default folder
  - create folder if missing
  - show preflight warnings
  - open sheet on create

## Core Scenarios

### 1. Martial Build

- create a straightforward martial preset or manual build;
- confirm actor is created without blockers;
- verify:
  - class item exists
  - weapon and armor items exist
  - AC and HP are reasonable
  - flags contain canonical metadata

### 2. Caster Build

- create a caster preset or manual build;
- verify:
  - spell items are present
  - spellcasting ability is correct
  - spell slots look correct
  - preflight does not diverge from final actor data

### 3. Multiclass Build

- create a multiclass build;
- verify:
  - classes are represented correctly
  - preflight warnings are understandable if any appear
  - actor still creates when warnings exist but blockers do not

### 4. Warning-Only Build

- intentionally create a build that triggers warnings but not blockers;
- verify:
  - warning notification is visible
  - actor creation still succeeds
  - warning summary is understandable to the operator

### 5. Blocked Build

- intentionally create a build that should fail preflight;
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
