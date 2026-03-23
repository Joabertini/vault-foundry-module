# Project Status

## General State

Current assessment: the project is in a strong alpha transition, with `Stage A` effectively at about `90%` and `Stage B` now approaching completion from an architectural ownership standpoint.

The architecture is no longer just aspirational:

- shared contracts exist and are in active use;
- shared domain logic owns more real validation and derivation;
- the shared/export preview path is now part of the active Foundry runtime;
- legacy code still exists, but it is losing responsibility slice by slice.

## Progress Snapshot

- `Stage A - import/export stabilization`: `90%`
- `Stage B - migration away from legacy runtime ownership`: `90%`
- `Stage C - beta/demo/release hardening`: `90%`

## What Is Stable Right Now

- canonical character contracts;
- shared preflight with structural and operational warnings;
- exporter path that carries preflight summary into Foundry payload flags;
- web demo showing preflight blockers and warnings before export;
- beta-readiness section visible inside the web demo with stage percentages and release framing;
- beta scope, release notes, and checklist artifacts now exist for actual sharing and tester onboarding;
- manual Foundry validation guide and beta announcement template now exist for the final release pass;
- capture guide and tester feedback template now exist for the last mile of beta execution;
- beta signoff and post-beta hardening documents now exist to close this stage cleanly and move into the next one;
- Foundry runtime with progress feedback, settings, and preflight gating;
- active runtime now creating actors directly from `canonicalFoundryPreview`;
- `buildActor(...)` reduced to a compatibility wrapper around the canonical preview path.
- web demo now also exposes the beta package itself as part of the shareable product surface.

## Main Risks Still Open

- the legacy module still contains some cleanup debt and compatibility scaffolding, even though the active runtime is now shared-first;
- `scripts/character-builder.js` has been reduced heavily, but temporary bridges still deserve another cleanup pass;
- some files still contain encoding/mojibake issues that make cleanup slower and more brittle;
- full manual validation inside a live Foundry VTT environment is still needed for the most confidence-sensitive flows.
- Stage C is now at the point where the remaining work is operational execution rather than missing repo-side preparation.

## Recommended Next Steps

1. Remove dead legacy helpers and unreachable assembly code from `scripts/character-builder.js`.
2. Replace temporary JS bridges where possible with shared package usage or thinner adapters.
3. Add more runtime-oriented validation and regression coverage for Foundry creation flows.
4. Run deeper manual validation inside live Foundry VTT to confirm import behavior under real operator usage.
5. Move into post-beta hardening using `docs/POST-BETA-HARDENING.md` after running the final beta execution pass.

## Operational Rule

If the conversation stops unexpectedly, use this file together with:

- `docs/AI-HANDOFF.md`
- `docs/IMPLEMENTATION-LOG.md`
- `docs/THREE-STAGE-ROADMAP.md`

as the canonical handoff set for resuming work.
