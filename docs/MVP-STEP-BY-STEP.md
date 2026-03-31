# MVP Step By Step

## Goal

Reach a minimum valuable product that is small enough to finish, but real enough to demo, validate in Foundry, and hand to another developer or tester without live explanation.

For this repository, the MVP is not "all of D&D 5e".

The MVP is:

- a stable 2014 5e character builder in `apps/web`;
- a local API that serves builder datasets reliably;
- a canonical export path that produces Foundry-ready payloads;
- one documented Foundry validation workflow for common cases;
- enough setup documentation that another machine can run the project cleanly.

## Scope To Keep

Keep these inside the MVP:

1. Single-class characters first.
2. Core race, background, feat, equipment, and spell flows already supported by the repo.
3. Local draft usage, even if persistence is still basic.
4. Export to Foundry for common successful cases.
5. Shared-package ownership for rules and exporter logic.

Keep these outside the MVP for now:

1. Full 5e spell and item completeness.
2. Rare edge-case subclasses and exception-heavy rules.
3. Full persistence/accounts.
4. Advanced editing/import-back workflows.
5. 2024 rules support.

## Step By Step Path

### Step 1: Make The Repo Runnable Without Guesswork

Deliverables:

- environment guide;
- `.env.example` files;
- one-command local dev startup;
- one-command environment verification.

Why first:

- if setup is fragile, every later validation pass is slower and less trustworthy.

Status:

- baseline complete; keep the docs synced as reality changes.

### Step 2: Lock The MVP Runtime Surface

Target runtime surfaces:

- `apps/web` as the active builder UI;
- `apps/api` as the dataset/BFF layer;
- `packages/*` as the source of truth for contracts, derivations, datasets, and export;
- root Foundry runtime as the import target to validate against.

What to avoid:

- moving more rules back into legacy scripts;
- adding new free-text decision points in the UI.

### Step 3: Improve Data Breadth Where Users Feel It Most

Highest-value data work:

1. expand spell coverage;
2. keep class spell lists consistent across local and hybrid modes;
3. reduce frontend-maintained fallback mappings over time.

Success signal:

- spellcasting classes stop feeling artificially constrained during a normal build.

Current progress:

- started;
- shared spell class ownership now lives in `packages/data-engine/src/spells.ts`;
- the shared fallback catalog is broader than before;
- thin fallback lists for `ranger`, `paladin`, `artificer`, and `warlock` have been widened so normal builds feel less constrained;
- shared domain now owns cantrip limits, spell-selection modes, and spell-selection profiles by class and level;
- the web builder now applies a first shared spell-selection cap instead of allowing every valid leveled spell by default.

### Step 4: Move Rule Ownership Out Of The UI

Priority extraction areas:

1. race languages;
2. subrace handling;
3. class skill limits;
4. equipment availability;
5. spell choice rules.

Success signal:

- `apps/web/src/App.tsx` becomes thinner and more presentation-focused.

### Step 5: Harden Foundry Export

Deliverables:

- representative export tests;
- a short import validation matrix;
- clearer alignment between preflight warnings and actual Foundry outcomes.

Success signal:

- common builds import reliably and failures are understandable when they occur.

### Step 6: Run A Real Manual Validation Pass

Use:

- `docs/FOUNDRY-MANUAL-VALIDATION.md`

Validate at least:

1. one martial;
2. one prepared caster;
3. one spontaneous or pact caster;
4. one background-granted feat case;
5. one armor plus shield case.

Success signal:

- a recent written validation result exists in the repo.

### Step 7: Clean The Most Dangerous Legacy Debt

Focus on:

1. dead legacy helpers;
2. duplicate bridge behavior;
3. encoding issues that affect labels or docs.

Success signal:

- less silent divergence between shared packages and legacy runtime.

### Step 8: Freeze A Beta-Ready MVP

Before calling the MVP ready, confirm:

1. `corepack pnpm verify:env` passes;
2. web and API run locally together via `corepack pnpm dev`;
3. the builder reaches export without obvious blockers on common cases;
4. Foundry validation has been run recently;
5. the environment guide matches reality.

## Recommended Order Right Now

This is the exact working order I recommend for the next implementation slices:

1. Environment scaffolding.
2. Spell dataset expansion.
3. Spell rule tightening.
4. Rule extraction from `App.tsx`.
5. Foundry validation matrix.
6. Export regression hardening.
7. Legacy cleanup.

## First Active Priority

Continue with spell dataset expansion:

1. keep widening spell breadth in the shared catalog where common builds still feel thin;
2. keep API and web fallback spell ownership aligned through shared data;
3. move the web builder off local spell-cap logic and onto the shared selection profile helpers;
4. keep `README.md` and this document current so the next coder can resume without reverse engineering the state.

This is the active execution priority now.
