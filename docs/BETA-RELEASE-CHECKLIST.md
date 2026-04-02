# Beta Release Checklist

## Goal

Ship a beta that is credible for sharing, demoing, and controlled early feedback.

## Product Surface

- web demo shows presets, sheet preview, and preflight state clearly;
- Foundry export is visible and understandable from the demo;
- project status is documented in `docs/PROJECT-STATUS.md`;
- release scope is limited to supported 5e 2014 flows already covered by the shared pipeline.

## Runtime Confidence

- shared preflight runs before Foundry actor creation;
- blockers stop actor creation cleanly;
- warnings remain visible to the operator;
- active Foundry runtime creates from the canonical preview path;
- canonical build, preview, and preflight are attached in actor flags for traceability.

## Validation

- run `corepack pnpm mvp:verify`;
- review `docs/MVP-RELEASE-STATUS.md`;
- after the manual pass is complete, run `corepack pnpm release:ready`;
- confirm the tag-based GitHub release workflow will publish only after `corepack pnpm mvp:verify` passes;
- manually validate at least:
  - one martial build
  - one caster build
  - one multiclass build
  - one build with warnings but no blockers

## Release Notes

- summarize what is supported;
- summarize what is still legacy or transitional;
- list known weak spots honestly;
- provide feedback expectations for testers.

## Exit Criteria

A beta is ready to announce when:

- Stage A is stable enough that imports are repeatable;
- Stage B is stable enough that active runtime ownership is shared-first;
- demo and docs are good enough that a collaborator can understand the project without live explanation.
