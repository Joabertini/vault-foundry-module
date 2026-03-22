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
