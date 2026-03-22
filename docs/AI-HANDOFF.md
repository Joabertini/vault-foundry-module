# Bertini's Vault - AI Handoff

This document is the fast-start guide for the next AI working on the repo.

## Project Shape

- Active Git branch: usually `main` unless a feature branch is created for a focused task.
- Active production-like Foundry prototype: repo root.
- New target architecture: `apps/` plus `packages/`.
- Canonical character model: [`packages/contracts/src/character-build.ts`](/C:/Users/CodexSandboxOffline/.codex/.sandbox/cwd/2ccd18d90a51fd7a/bertinis-vault/packages/contracts/src/character-build.ts).
- Shared derivations: [`packages/domain/src/derive.ts`](/C:/Users/CodexSandboxOffline/.codex/.sandbox/cwd/2ccd18d90a51fd7a/bertinis-vault/packages/domain/src/derive.ts).
- Shared Foundry exporter: [`packages/foundry-exporter/src/index.ts`](/C:/Users/CodexSandboxOffline/.codex/.sandbox/cwd/2ccd18d90a51fd7a/bertinis-vault/packages/foundry-exporter/src/index.ts).
- Legacy-to-canonical bridges: [`scripts/model-bridge.js`](/C:/Users/CodexSandboxOffline/.codex/.sandbox/cwd/2ccd18d90a51fd7a/bertinis-vault/scripts/model-bridge.js) and [`scripts/foundry-export-bridge.js`](/C:/Users/CodexSandboxOffline/.codex/.sandbox/cwd/2ccd18d90a51fd7a/bertinis-vault/scripts/foundry-export-bridge.js).

## Read These First

1. [`ARCHITECTURE-PLAN.md`](/C:/Users/CodexSandboxOffline/.codex/.sandbox/cwd/2ccd18d90a51fd7a/bertinis-vault/ARCHITECTURE-PLAN.md)
2. [`docs/IMPLEMENTATION-LOG.md`](/C:/Users/CodexSandboxOffline/.codex/.sandbox/cwd/2ccd18d90a51fd7a/bertinis-vault/docs/IMPLEMENTATION-LOG.md)
3. [`docs/MIGRATION-MATRIX.md`](/C:/Users/CodexSandboxOffline/.codex/.sandbox/cwd/2ccd18d90a51fd7a/bertinis-vault/docs/MIGRATION-MATRIX.md)
4. [`docs/THREE-STAGE-ROADMAP.md`](/D:/Users/Martin/Desktop/RESPALDO/D&D%205e/Documents/web%20builder/bertinis-vault-github-ready/bertinis-vault/docs/THREE-STAGE-ROADMAP.md)
5. `docs/FRONTEND-INTEGRATION.md` if visual/frontend work is being split across agents
6. [`docs/DDIMPORT-COMPARISON.md`](/D:/Users/Martin/Desktop/RESPALDO/D&D%205e/Documents/web%20builder/bertinis-vault-github-ready/bertinis-vault/docs/DDIMPORT-COMPARISON.md) for import/export workflow benchmarking

## Current Technical Priorities

- Stage A from `docs/THREE-STAGE-ROADMAP.md`: stabilize preflight, import/export workflow, and exporter convergence before wider product polish;
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
