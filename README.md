# Bertini's Vault — Character Importer for Foundry VTT

A D&D 5e 2014 character creation module that builds fully populated actors directly inside Foundry VTT.

## Current Direction

This repository now also contains the first shared foundation for the broader Bertini's Vault product:

- [ARCHITECTURE-PLAN.md](./ARCHITECTURE-PLAN.md)
- [docs/IMPLEMENTATION-LOG.md](./docs/IMPLEMENTATION-LOG.md)
- [docs/MIGRATION-MATRIX.md](./docs/MIGRATION-MATRIX.md)
- [docs/AI-HANDOFF.md](./docs/AI-HANDOFF.md)
- [docs/THREE-STAGE-ROADMAP.md](./docs/THREE-STAGE-ROADMAP.md)
- `apps/` for future product surfaces
- `packages/contracts` for shared schemas
- `packages/domain` for reusable rules and derivations

The Foundry module at the repository root remains the active prototype while the shared product architecture is built around it.

Operational docs for the current repo:

- [docs/ENVIRONMENT-GUIDE.md](./docs/ENVIRONMENT-GUIDE.md)
- [docs/FOUNDRY-MANUAL-VALIDATION.md](./docs/FOUNDRY-MANUAL-VALIDATION.md)
- [docs/FOUNDRY-MANUAL-VALIDATION-REPORT.md](./docs/FOUNDRY-MANUAL-VALIDATION-REPORT.md)
- [docs/FOUNDRY-VALIDATION-BASELINE.md](./docs/FOUNDRY-VALIDATION-BASELINE.md)
- [docs/FOUNDRY-VALIDATION-MATRIX.md](./docs/FOUNDRY-VALIDATION-MATRIX.md)
- [docs/PROJECT-COMPLETION-CHECKLIST.md](./docs/PROJECT-COMPLETION-CHECKLIST.md)
- [docs/MVP-STEP-BY-STEP.md](./docs/MVP-STEP-BY-STEP.md)
- [docs/MVP-RELEASE-STATUS.md](./docs/MVP-RELEASE-STATUS.md)

Verification entrypoints:

- `corepack pnpm verify:env`
- `corepack pnpm --filter @bertinis-vault/domain test`
- `corepack pnpm web:typecheck`
- `corepack pnpm web:build`
- `corepack pnpm --filter @bertinis-vault/api build`
- `corepack pnpm foundry:verify`
- `corepack pnpm mvp:verify`
- `corepack pnpm release:ready`
- `.github/workflows/verify.yml` mirrors those checks on `pull_request` and `push` to `main`

## MVP Product Focus

The MVP is no longer blocked by missing architecture.
It is now blocked by confidence and operational proof.

The product should now be treated as:

- `apps/web` is the active builder surface;
- `apps/api` is the local dataset/BFF support layer;
- `packages/*` are the source of truth for contracts, rules, normalized data, and export;
- the root Foundry module is the import target to validate against, not the long-term place to re-centralize rules.

What currently defines MVP:

1. a user can complete a normal 2014 5e build in the web app;
2. the build exports through the shared pipeline without silent drift;
3. the payload imports into Foundry for common cases;
4. blockers and warnings are visible before import;
5. another developer can run and verify the repo without oral handholding.

What is explicitly outside MVP for now:

- exhaustive 5e data completeness;
- advanced persistence/accounts;
- edit-existing-actor workflows;
- premium polish passes beyond what is needed to demo and validate;
- 2024 rules support.

## Start Here If You Are Coding Next

Run these commands from the repository root:

```bash
corepack pnpm install
corepack pnpm verify:env
corepack pnpm dev
```

Then run the current MVP safety checks:

```bash
corepack pnpm mvp:verify
```

## Next DEV Handoff

This section is intentionally direct.
If you are continuing this repo, do these things in this order.

1. Do not redesign the product surface again before validating it in real Foundry.
2. Run the live pass in [docs/FOUNDRY-MANUAL-VALIDATION.md](./docs/FOUNDRY-MANUAL-VALIDATION.md).
3. Record results in [docs/FOUNDRY-MANUAL-VALIDATION-REPORT.md](./docs/FOUNDRY-MANUAL-VALIDATION-REPORT.md).
4. Convert every real Foundry failure into fixture coverage or regression tests.
5. Only after that, continue shrinking legacy bridges and increasing spell/data breadth.

What was already verified in this repo state:

- `corepack pnpm verify:env`
- `corepack pnpm web:typecheck`
- `corepack pnpm web:build`
- `corepack pnpm --filter @bertinis-vault/api build`
- `corepack pnpm foundry:verify`

What changed materially before this handoff:

- the web app was restructured into a more shareable product surface instead of a single oversized file;
- the active builder remains the dark 9-step wizard baseline;
- the Foundry pipeline was unified so the runtime and compatibility wrapper drift less;
- shared export fixtures and baseline verification are in place;
- API regression coverage now includes cache behavior, hybrid fallback, and upstream failure responses;
- the API now explicitly allows its legacy default upstream dataset paths, so `source=hybrid` and `source=upstream` do not fail by default just because of path filtering;
- CI verification now also runs the web verification gate and API tests instead of relying only on manual local checks;
- the repo now exposes `corepack pnpm mvp:verify` as the one-command safety gate for the last 3-day MVP push;
- `corepack pnpm mvp:verify` now also regenerates `docs/MVP-RELEASE-STATUS.md` as the single automated readiness snapshot;
- the GitHub release workflow now installs dependencies, runs `corepack pnpm mvp:verify`, updates release manifests, and attaches the ZIP from the correct path before publishing;
- the GitHub release workflow now also runs `corepack pnpm release:ready`, so a tag cannot publish while manual validation/signoff docs are still pending;
- the exporter now emits a more Foundry-13-friendly actor shape for `abilities`, `ac`, `hp`, and `spells`, which directly targets the JSON import failure reported against builder-generated actors;
- the spell data path now preserves richer upstream metadata and the local spell catalog includes more concrete MVP spell details, so common spells no longer collapse to `Sin dato` as often in the web builder;
- the generated Foundry validation packet now includes expected live outcomes per fixture so the operator can validate faster in Foundry;
- web and API builds are passing in the current state.

What not to do next:

1. do not move business rules back into root `scripts/` unless Foundry-local behavior truly requires it;
2. do not reopen broad visual redesign work before the manual Foundry pass is complete;
3. do not treat spell-catalog expansion as a substitute for real import validation;
4. do not tag a release until manual validation and the report are updated.

## Current Builder Baseline

The active builder baseline is now the dark **9-step wizard** in `apps/web`, aligned to the older `vault-character-form-v2.html` direction instead of the previous demo-style surface.

Most recent functional fixes:

- subraces added to web builder state and canonical snapshot;
- race languages are now governed by race rules instead of free text;
- background-granted feats apply automatically;
- duplicated feat export between background and choices was removed;
- class skills now enforce selection caps;
- class equipment is filtered instead of showing everything;
- `4d6 x6` is now single-use per draft;
- exporter deduplicates feat items defensively;
- spellcasting UI now reads canonical derived spellcasting;
- spell details now attempt to show school, casting time, range, duration, components, and summary;
- the spell picker no longer hard-caps visible spells below the filtered dataset.

Implementation handoff for this round:

- [apps/web/README.md](./apps/web/README.md)
- [docs/PROJECT-STATUS.md](./docs/PROJECT-STATUS.md)

## Features

- Step-by-step character creation wizard (9 steps)
- All 13 classes + subclasses from PHB, XGE, TCE, and supplements
- All races + subraces
- Backgrounds from PHB, SCAG, Strixhaven, Dragonlance, Spelljammer, Planescape, and more
- 3-set dice roller (roll once, choose one set — no rerolls)
- Standard Array, Point Buy, and Manual entry
- Proficiency-filtered equipment (only shows armor/weapons the class can use)
- ASI/Feat tracking per level
- Spell slot calculation by class and level
- Creates a complete dnd5e 5.x actor with: abilities, skills, HP, AC, spells, items, class, features

## Installation

### Manual (development)
1. Clone or download this repository
2. Copy the `bertinis-vault` folder to `{FoundryData}/Data/modules/`
3. Restart Foundry VTT
4. Enable the module in Game Settings → Manage Modules

### Via Manifest URL
In Foundry Setup → Install Module, paste:
```
https://raw.githubusercontent.com/Joabertini/vault-foundry-module/main/module.json
```

## Usage

1. Open the **Actors** directory in Foundry
2. Click the **✦ Vault: Crear Personaje** button
3. Complete the 9-step form
4. Click **✦ CREAR EN FOUNDRY**
5. The actor appears in your directory — click "Open Sheet" to view it

## Compatibility

- Foundry VTT: 12+, verified on 13
- System: dnd5e 5.x
- D&D rules: 2014 (PHB, XGE, TCE, SCAG, and various supplements)

## Roadmap

- [ ] v0.2: Proficiency skill selection per class
- [ ] v0.3: Race ability score bonuses applied automatically
- [ ] v0.4: Export to JSON (for sharing between worlds)
- [ ] v0.5: Import from existing actor (edit mode)
- [ ] v1.0: Full compendium lookup for spells and items

## License

MIT — see LICENSE file
