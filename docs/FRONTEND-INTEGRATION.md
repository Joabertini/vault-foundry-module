# Frontend Integration Flow

This document exists to coordinate split work where one agent focuses on the visual surface and another agent validates build, continuity, and release.

## Roles

- Frontend worker:
  - edits only `apps/web` unless tiny doc updates are needed;
  - improves visual design, copy, presets, layout, and usability;
  - does not change shared packages or monorepo tooling.
- Build/integration worker:
  - reviews frontend diffs;
  - runs typecheck and build;
  - captures screenshots when needed;
  - updates continuity docs;
  - commits and pushes.

## Allowed Frontend Scope

- `apps/web/src/App.tsx`
- `apps/web/src/styles.css`
- optional local files under `apps/web/src/`
- optional minimal updates to:
  - `apps/web/README.md`
  - `docs/IMPLEMENTATION-LOG.md`

## Required Frontend Constraints

- keep `showTechnicalView`;
- keep the real builder functional underneath the demo;
- do not add dependencies;
- do not touch `packages/`, `scripts/`, API routes, or build config;
- prefer product-facing copy over internal/dev-facing copy;
- fix mojibake in any visible strings that are touched.

## Integration Sequence

1. Review the frontend diff for scope creep.
2. Run:
   - `corepack pnpm web:typecheck`
   - `corepack pnpm web:build`
3. If the build passes, run preview locally:
   - `corepack pnpm web:preview`
4. Capture or refresh the demo screenshot if the visual changed materially.
5. Update docs that describe the current purpose of `apps/web`.
6. Commit and push only after the repo is clean and validated.

## Screenshot Convention

- Current screenshot path:
  - `docs/web-demo-financiers.png`
- Replace it when:
  - the hero changes materially;
  - presets are added;
  - the preview sheet changes visually enough that the old capture is misleading.

## Acceptance Checklist

- the page reads as a product demo before it reads as an internal tool;
- the builder still works;
- technical JSON remains hidden by default;
- desktop and mobile both remain usable;
- typecheck passes;
- Vite production build passes;
- docs reflect the current demo purpose of `apps/web`.
