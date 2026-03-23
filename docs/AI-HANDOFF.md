# Bertini's Vault - AI Handoff

This document is the fast-start guide for the next AI working on the repo.

## Project Shape

- Active Git branch: usually `main` unless a feature branch is created for a focused task.
- Active production-like Foundry prototype: repo root.
- New target architecture: `apps/` plus `packages/`.
- Canonical character model: [`packages/contracts/src/character-build.ts`](../packages/contracts/src/character-build.ts).
- Shared derivations: [`packages/domain/src/derive.ts`](../packages/domain/src/derive.ts).
- Shared Foundry exporter: [`packages/foundry-exporter/src/index.ts`](../packages/foundry-exporter/src/index.ts).
- Legacy-to-canonical bridges: [`scripts/model-bridge.js`](../scripts/model-bridge.js) and [`scripts/foundry-export-bridge.js`](../scripts/foundry-export-bridge.js).

## Read These First

1. [`ARCHITECTURE-PLAN.md`](../ARCHITECTURE-PLAN.md)
2. [`docs/IMPLEMENTATION-LOG.md`](./IMPLEMENTATION-LOG.md)
3. [`docs/MIGRATION-MATRIX.md`](./MIGRATION-MATRIX.md)
4. [`docs/THREE-STAGE-ROADMAP.md`](./THREE-STAGE-ROADMAP.md)
5. `docs/FRONTEND-INTEGRATION.md` if visual/frontend work is being split across agents
6. [`docs/DDIMPORT-COMPARISON.md`](./DDIMPORT-COMPARISON.md) for import/export workflow benchmarking

## Current Technical Priorities

- Stage A from `docs/THREE-STAGE-ROADMAP.md`: stabilize preflight, import/export workflow, and exporter convergence before wider product polish;
- shared preflight now exists in `packages/contracts` + `packages/domain`, and `packages/foundry-exporter` already consumes it;
- shared preflight now covers total-level overflow plus spell/equipment normalization mismatches, not only missing ids;
- shared preflight also checks stale `derived` snapshots for proficiency bonus and spellcasting consistency, plus duplicate class entries;
- shared proficiency resolution now lives in `packages/domain/src/proficiencies.ts` and is reused by the exporter;
- shared exporter now preserves mixed equipment and quantities instead of truncating to a single weapon/armor pair;
- legacy Foundry runtime now uses module settings for folder creation, warning notifications, and optional auto-open on success;
- legacy `character-builder` now reuses the full shared preview item list instead of rebuilding only a subset of items;
- legacy `foundry-export-bridge` now mirrors mixed equipment and quantity handling more closely, so runtime preview items are less divergent;
- legacy preview now carries more of the final `system` shape, and `character-builder` reuses more of that structure directly;
- legacy preview now also consumes more `choices.normalized` data for proficiencies and features when available;
- legacy preview now includes more top-level actor shape as well (`prototypeToken`, `_stats`, `ownership`, `folder`);
- `apps/web` now surfaces exporter preflight to the operator before download;
- the legacy Foundry runtime now uses a temporary `scripts/preflight-bridge.js` to surface blockers and warnings before actor creation;
- next work should focus on deleting or collapsing legacy-only builder/bridge logic that is now shadowed by `canonicalFoundryPreview`, because both `system` shape and normalized choices are carrying more of the runtime already;
- after that, reduce bridge duplication and converge Foundry runtime on the shared preflight path instead of adding new validation layers elsewhere;
- keep `apps/web` dual-purpose: financier-facing demo first, builder internals second;
- keep extracting logic out of legacy Foundry JS and into shared packages;
- tighten the contract between `CharacterBuild` and `FoundryActorPayload`;
- keep datasets canonical and id-based instead of label-based;
- grow tests around shared packages before replacing more legacy runtime behavior.

## Validation Baseline

There are now real tests in the shared packages:

- `packages/contracts/test`
- `packages/data-engine/test`
- `packages/domain/test`
- `packages/foundry-exporter/test`

Recommended validation order after code changes:

1. build shared packages;
2. run shared package tests;
3. only then touch legacy Foundry integration or web/api integration points.

For frontend-only demo work, use:

1. `corepack pnpm web:typecheck`
2. `corepack pnpm web:build`
3. refresh `docs/web-demo-financiers.png` if the visual changed materially

## Rules of Thumb for Future Work

- Prefer changing `packages/` before changing `scripts/`.
- Preserve the financier demo framing in `apps/web/src/App.tsx`; hide raw JSON and low-level details behind `showTechnicalView`.
- Treat `scripts/foundry-export-bridge.js` as temporary duplication, not a permanent API.
- If a new field is added to the canonical build, update:
  - contracts;
  - domain if derived;
  - exporter if Foundry-relevant;
  - migration matrix if it affects legacy replacement;
  - implementation log for continuity.
- Avoid new imports that reach into another package's `src/` directly.

## Known Weak Spots

- Encoding/mojibake still exists in some docs and labels.
- The legacy module is still the active actor creation runtime.
- Some user-facing choices are still text-based and only later normalized into structured data.
- The monorepo is ahead architecturally of its test coverage, even after the new baseline tests.
- Import/export orchestration is still weaker than the canonical modeling itself; use `ddimport.js` comparison doc as the process benchmark.

## Good Next Tasks

- turn the web demo into a capture-ready surface with screenshots, tighter spacing, and a dedicated demo route if needed;
- converge shared exporter and legacy Foundry preview bridge;
- add more fixtures for classes/backgrounds/spellcasting edge cases;
- move more final actor sections from `scripts/character-builder.js` to shared exporter output;
- replace more free-text proficiency/equipment handling with structured picks in the web builder.

## Latest Convergence Note

- `scripts/character-builder.js` now reuses more top-level actor metadata from `canonicalFoundryPreview`, not just `system` and `items`.
- The legacy runtime currently prefers preview-backed `name`, `type`, `img`, `prototypeToken`, `effects`, `folder`, `_stats`, and `ownership`.
- Preview flags are now merged into the final actor envelope before attaching `bertinis-vault` metadata.
- A dead-code cleanup pass was attempted on old item/spell helper functions, but the file's encoding made block deletion brittle with `apply_patch`; prefer structural convergence or a future whole-file normalization pass before aggressive removal.

## Latest Preflight Hardening

- `packages/domain/src/preflight.ts` now warns on duplicate canonical entries across:
  - `background.grantedFeatIds`
  - `choices.feats`
  - `choices.normalized.spells`
  - `choices.normalized.equipment`
- Those warnings are covered in `packages/domain/test/preflight.test.mjs` and confirmed to propagate through `packages/foundry-exporter/test/index.test.mjs`.
- This was intended as a Stage A reliability push: catch operationally inconsistent but structurally valid builds before they drift into export/import workflows.
- Current Stage A estimate after this slice: about `90%`, with the main remaining gap being deeper manual validation inside Foundry VTT plus continued legacy retirement rather than missing shared preflight/export primitives.

## Latest Runtime Convergence

- `scripts/vault-app.js` now creates actors from `canonicalFoundryPreview` when that preview is present in `buildActor(...)` flags.
- Runtime-enriched flags from `buildActor(...)` are merged back onto the shared preview before `Actor.create(...)`, so operational metadata is preserved.
- Full fallback to the legacy-built actor payload remains in place if the canonical preview is unavailable.
- This is one of the highest-leverage convergence steps so far because the active Foundry creation path now prefers the shared preview, not just the legacy builder output.

## Latest Stage B Move

- `scripts/character-builder.js` now treats `previewActor.system` as the preferred system payload and keeps its local system assembly as fallback.
- This reduces the practical responsibility of the legacy wrapper even when `buildActor(...)` is still used as a metadata carrier.
- A stable summary file now exists at `docs/PROJECT-STATUS.md` for project state, percentages, and recommended next steps if the thread ends abruptly.

## Latest Runtime Ownership Shift

- `scripts/vault-app.js` no longer depends on `buildActor(...)` to create the active Foundry actor.
- The active runtime now builds from `canonicalBuild` and `buildFoundryActorPreview(...)`, then enriches flags directly before `Actor.create(...)`.
- `scripts/character-builder.js` is now best understood as compatibility scaffolding; its operational importance is much lower than before.
- Current estimate after this slice:
  - `Stage A`: `90%`
  - `Stage B`: `90%`

## Latest Stage C Start

- `apps/web/src/App.tsx` now includes a visible beta-readiness section with stage percentages and release framing.
- `apps/web/src/styles.css` includes the supporting presentation layer for that section.
- `docs/BETA-RELEASE-CHECKLIST.md` now exists as the release-oriented checklist for moving from demo to beta.
- Current estimate after this slice:
  - `Stage A`: `90%`
  - `Stage B`: `90%`
  - `Stage C`: `55%`

## Latest Stage C Packaging

- `apps/web/src/App.tsx` now also includes a beta scope section covering supported flows and honest risks.
- `docs/BETA-RELEASE-NOTES.md` now exists as the release-facing summary for testers or collaborators.
- `docs/PROJECT-STATUS.md` now reflects `Stage C` at `70%`.
- Remaining work to reach `90%` is mostly outside pure code:
  - screenshot/capture pass
  - manual validation in live Foundry
  - final beta announcement/release pass

## Latest Stage C Closing Prep

- `docs/FOUNDRY-MANUAL-VALIDATION.md` now exists for the final live Foundry validation pass.
- `docs/BETA-ANNOUNCEMENT-TEMPLATE.md` now exists for the final beta communication step.
- `docs/PROJECT-STATUS.md` now reflects `Stage C` at `80%`.
- What remains before calling Stage C `90%` is execution, not framework:
  - run the manual validation pass
  - capture the final demo/screenshots
  - publish or dry-run the beta announcement/release package

## Latest Stage C Sharing Prep

- `docs/DEMO-CAPTURE-GUIDE.md` now exists for the final screenshot/demo pass.
- `docs/TESTER-FEEDBACK-TEMPLATE.md` now exists for structured tester reports.
- `docs/PROJECT-STATUS.md` now reflects `Stage C` at `85%`.
- The remaining gap to `90%` is now almost entirely:
  - execute the Foundry validation pass
  - capture the final demo assets
  - run the final release/announcement pass

## Stage C At 90 And Next Stage

- `docs/BETA-SIGNOFF.md` now exists for the final beta signoff record.
- `docs/POST-BETA-HARDENING.md` now defines the next stage after this roadmap's Stage C.
- `docs/PROJECT-STATUS.md` now reflects:
  - `Stage A`: `90%`
  - `Stage B`: `90%`
  - `Stage C`: `90%`
- After final beta execution, continue using `docs/POST-BETA-HARDENING.md` as the next-stage anchor.

## Latest Legacy Cleanup

- `scripts/character-builder.js` was rewritten as a minimal compatibility wrapper.
- The large unreachable legacy actor-assembly block inside that file has been removed.
- Active cleanup focus can now shift more comfortably toward temporary bridges and web/product surface work.

## Latest Web Packaging Pass

- `apps/web/src/App.tsx` now includes a `BetaPackageSection`.
- `apps/web/src/styles.css` includes the presentation layer for that section.
- The demo now exposes the beta package itself as part of the visible product surface, not just the builder and sheet preview.
