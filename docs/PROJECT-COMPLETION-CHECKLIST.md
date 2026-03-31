# Project Completion Checklist

## Purpose

This checklist turns the current planning and status docs into an execution-oriented path to finish the project to a credible beta and then a hardened release candidate.

It is based on the current repo state, especially:

- `docs/PROJECT-STATUS.md`
- `docs/THREE-STAGE-ROADMAP.md`
- `ARCHITECTURE-PLAN.md`
- `apps/web/README.md`

## Current Read

The project is not at zero. It is already in a late alpha or pre-beta state with:

- a working 9-step web builder;
- shared contracts, domain logic, and exporter packages;
- a local API with hybrid dataset support;
- a Foundry export path that already creates actors through the shared preview pipeline;
- beta preparation docs already written.

The remaining work is mostly concentrated in product completeness, operational validation, and hardening.

## Definition Of "Complete"

For this repository, "complete" should mean:

- the web builder works without depending directly on Foundry;
- the API serves stable builder datasets locally and in hybrid mode;
- the exporter creates reliable Foundry payloads for common 5e 2014 cases;
- manual Foundry validation has been executed and documented;
- the repository has enough setup and release documentation for another developer or tester to run it without guesswork.

## Priority 1: Close The Environment Gap

These items unblock contributors immediately:

1. Keep `docs/ENVIRONMENT-GUIDE.md` current as the source of truth.
2. Add `.env.example` files for `apps/api` and `apps/web`.
3. Add a root `dev` script to start both API and web in one command.
4. Add a root verification script for Node version, `corepack`, `pnpm`, and required ports.
5. Document the Foundry local validation setup in a reproducible way.

Current progress:

- `docs/ENVIRONMENT-GUIDE.md` exists;
- `.env.example` files now exist for `apps/api` and `apps/web`;
- root scripts now include `dev` and `verify:env`;
- the remaining environment gap is mainly Foundry validation setup and keeping the docs in sync.

## Priority 2: Complete The Spell/Data Layer

This is the biggest product-quality gap left in the active builder:

1. Expand the spell dataset substantially, especially for wizard breadth.
2. Keep class spell lists consistent between local fallback and API hybrid payloads.
3. Tighten spell selection rules for `known`, `prepared`, and `pact` models.
4. Reduce fragile hand-maintained spell mapping inside the frontend.
5. Add regression coverage for spell slots, spell lists, and export payload integrity.

## Priority 3: Remove Transitional Frontend Logic

The builder works, but part of its rules still live too close to the UI:

1. Move embedded class/race/background maps out of `apps/web/src/App.tsx`.
2. Shift race language, subrace, class skill, and equipment rules into shared packages.
3. Replace manual fallback slices with data-engine or API-fed normalized datasets.
4. Keep the React app focused on rendering and interaction, not rule ownership.

## Priority 4: Harden Foundry Export

This is the confidence-sensitive release path:

1. Run the manual validation flow in `docs/FOUNDRY-MANUAL-VALIDATION.md`.
2. Capture at least a small matrix of successful imports across common classes.
3. Add more regression tests around `canonicalFoundryPreview` and exporter output.
4. Verify warnings and blockers from preflight align with actual Foundry import outcomes.
5. Remove dead compatibility bridges once the shared-first runtime is fully trusted.

## Priority 5: Clean The Legacy Surface

The repo still carries prototype debt:

1. Reduce or remove leftover unreachable helpers in `scripts/character-builder.js`.
2. Eliminate temporary adapter code where shared packages already own the logic.
3. Normalize encoding issues and mojibake across docs and UI strings.
4. Keep the root Foundry module as an import target, not the main rules engine.

## Suggested Execution Order

Follow this order for the best payoff:

1. Environment/docs cleanup.
2. Spell dataset expansion.
3. Spell rule tightening.
4. Frontend rule extraction into shared packages.
5. Foundry manual validation pass.
6. Export regression coverage.
7. Legacy cleanup and encoding normalization.
8. Post-beta hardening from `docs/POST-BETA-HARDENING.md`.

## Concrete Exit Criteria

The project is ready for a stronger beta handoff when all of these are true:

- a new contributor can install and run web + API from docs alone;
- the web builder loads from local API without manual code edits;
- spell selection feels representative for main spellcasting classes;
- at least one documented Foundry validation pass has been completed recently;
- the exporter passes automated tests for common cases;
- the remaining legacy code is clearly marked as compatibility-only or removed.

## Suggested Immediate Next Sprint

If you want the shortest path to visible progress, the next sprint should do only this:

1. Add `.env.example` files and a root `dev` script.
2. Expand the spell dataset and class spell coverage.
3. Move one rule family out of `App.tsx`, starting with race languages or class skills.
4. Run one real Foundry validation pass and write down the results.
