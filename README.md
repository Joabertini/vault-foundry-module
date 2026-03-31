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
- [docs/PROJECT-COMPLETION-CHECKLIST.md](./docs/PROJECT-COMPLETION-CHECKLIST.md)
- [docs/MVP-STEP-BY-STEP.md](./docs/MVP-STEP-BY-STEP.md)

## Priority Order Of Execution

If you are the next person coding in this repo, follow this order:

1. Environment scaffolding.
2. Spell dataset expansion.
3. Spell rule tightening.
4. Rule extraction out of `apps/web/src/App.tsx`.
5. Foundry validation matrix.
6. Export regression hardening.
7. Legacy cleanup and encoding normalization.

This order is the shortest path to a real MVP because it starts by making the repo runnable and testable, then improves the data/rules users feel most, and only after that spends time on deeper cleanup.

## Current Active Priority

The current active priority is now **Spell dataset expansion**.

The environment scaffolding slice is already in place:

- `apps/api/.env.example`
- `apps/web/.env.example`
- root `dev` script
- root `verify:env` script
- [docs/ENVIRONMENT-GUIDE.md](./docs/ENVIRONMENT-GUIDE.md)
- [docs/MVP-STEP-BY-STEP.md](./docs/MVP-STEP-BY-STEP.md)

What is already done inside the current spell slice:

1. shared spell class ownership now lives in `packages/data-engine/src/spells.ts`;
2. API and web fallback paths now read shared spell metadata instead of separate hardcoded class maps;
3. shared domain now owns cantrip limits plus leveled spell-selection caps by class and level;
4. wizard now uses a spellbook-style selection model in shared domain logic;
5. ranger, paladin, artificer, and warlock fallback coverage has been widened to make normal MVP builds feel less empty.

What remains inside this priority:

1. keep expanding breadth for core level bands where normal builds still feel thin;
2. wire the web builder fully onto the new shared spell-selection profile helpers, labels, and max-level helpers;
3. tighten prepared vs known vs spellbook behavior for edge cases and higher-level flows once the UI reads the shared model end to end.

## Start Here If You Are Coding Next

Run these commands from the repository root:

```bash
corepack pnpm install
corepack pnpm verify:env
corepack pnpm dev
```

After that, the active implementation priority is:

1. expand the spell dataset;
2. keep local and hybrid spell lists aligned;
3. tighten spell-selection rules before doing broader UI cleanup.

Current status of that priority:

- shared spell class ownership now lives in `packages/data-engine/src/spells.ts`;
- the fallback spell catalog is materially larger than before;
- the weakest fallback lists now have better MVP coverage, especially `ranger`, `paladin`, `artificer`, and `warlock`;
- shared domain now exposes cantrip limits, spell-selection modes, labels, section titles, max-level derivation, selection sanitizing, picker-state assembly, and spell-selection profiles for class and level;
- API and web fallback paths now read shared spell class metadata instead of separate hardcoded maps;
- the web builder now applies a first shared spell-selection cap by class and level instead of allowing every valid leveled spell by default.

Next follow-up inside the same priority:

1. keep expanding spell breadth, especially wizard, cleric, and druid coverage;
2. move `apps/web/src/App.tsx` from its local spell labels, section title, max-level derivation, filtered options, selection filtering, picker counts, and spell-cap rules onto the shared domain helper outputs;
3. refine prepared vs known behavior further for edge cases and higher-level flows.

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
