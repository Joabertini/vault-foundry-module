# Project Status

## General State

Current assessment: the project is in a strong alpha transition, with `Stage A` effectively at about `90%` and `Stage B` underway.

The architecture is no longer just aspirational:

- shared contracts exist and are in active use;
- shared domain logic owns more real validation and derivation;
- the shared/export preview path is now part of the active Foundry runtime;
- legacy code still exists, but it is losing responsibility slice by slice.

## Progress Snapshot

- `Stage A - import/export stabilization`: `90%`
- `Stage B - migration away from legacy runtime ownership`: `50%`
- `Stage C - beta/demo/release hardening`: `18%`

## What Is Stable Right Now

- canonical character contracts;
- shared preflight with structural and operational warnings;
- exporter path that carries preflight summary into Foundry payload flags;
- web demo showing preflight blockers and warnings before export;
- Foundry runtime with progress feedback, settings, and preflight gating;
- active runtime now preferring `canonicalFoundryPreview` when creating actors.

## Main Risks Still Open

- the legacy module is still present in the critical path as fallback and compatibility layer;
- `scripts/character-builder.js` still contains redundant legacy logic and dead-weight helpers;
- some files still contain encoding/mojibake issues that make cleanup slower and more brittle;
- full manual validation inside a live Foundry VTT environment is still needed for the most confidence-sensitive flows.

## Recommended Next Steps

1. Continue Stage B by reducing `scripts/character-builder.js` into a thin compatibility wrapper.
2. Keep moving final actor assembly responsibility into the shared preview/export path.
3. Add more runtime-oriented validation and regression coverage for Foundry creation flows.
4. Once the legacy builder becomes lightweight enough, start removing redundant helpers and temporary bridges.
5. After that, shift attention toward beta hardening and presentation work in Stage C.

## Operational Rule

If the conversation stops unexpectedly, use this file together with:

- `docs/AI-HANDOFF.md`
- `docs/IMPLEMENTATION-LOG.md`
- `docs/THREE-STAGE-ROADMAP.md`

as the canonical handoff set for resuming work.
