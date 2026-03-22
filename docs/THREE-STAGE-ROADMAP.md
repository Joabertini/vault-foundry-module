# Bertini's Vault - Three-Stage Roadmap

This roadmap translates the current repo state into three execution stages.

It is intentionally operational: each stage has a purpose, concrete workstreams, exit criteria, and a handoff into the next stage.

## Why this roadmap exists

The repo is no longer just a Foundry prototype, but it is not yet a hardened beta product either.

What already exists:

- a working legacy Foundry module at repo root;
- a canonical contract in `packages/contracts`;
- shared derivations in `packages/domain`;
- normalized datasets in `packages/data-engine`;
- a shared exporter in `packages/foundry-exporter`;
- a presentable web builder/demo in `apps/web`;
- an early BFF in `apps/api`.

What still blocks a confident beta:

- legacy runtime is still the final actor assembly path;
- import/export orchestration is weaker than the shared modeling;
- transitional bridges still duplicate behavior;
- app-level testing and hardening are still shallow.

## Stage A - Stabilize Import/Export

### Goal

Make the Foundry import/export pipeline trustworthy enough to become the primary technical focus of the project.

### Why this comes first

The biggest current risk is not the canonical model itself.
The biggest risk is the operational gap between:

1. canonical build creation;
2. payload generation;
3. Foundry-side import behavior;
4. user feedback when something is unresolved or partially supported.

### Main workstreams

#### 1. Preflight layer

Add a dedicated preflight stage before actor creation.

It should report:

- blockers;
- warnings;
- informational notes;
- unresolved canonical ids;
- unsupported labels still surviving from legacy input;
- Foundry compatibility assumptions.

#### 2. Shared exporter as primary path

Keep converging the runtime toward `packages/foundry-exporter`.

That means:

- prefer shared exporter outputs over bridge-generated mirrors;
- treat `scripts/foundry-export-bridge.js` as temporary compatibility code only;
- remove hidden divergence between preview payload and final actor payload.

#### 3. Foundry-side import workflow

Turn import into an explicit workflow rather than a silent conversion.

Expected capabilities:

- operator settings persistence;
- progress notifications;
- visible preflight summary;
- import result summary;
- clearer failure handling.

#### 4. Validation fixtures

Add fixtures and tests for realistic character builds:

- single-class martial;
- single-class caster;
- pact caster;
- multiclass spellcaster;
- heavy armor + shield case;
- background-granted feat case.

### Exit criteria

Stage A is complete when:

- valid builds pass a visible preflight and import cleanly;
- invalid or partial builds fail with clear blockers or warnings;
- exporter behavior is covered by representative fixtures;
- Foundry runtime is no longer silently doing critical work outside the shared path without being documented.

### Suggested ticket order

1. define preflight result schema;
2. implement shared preflight checks;
3. wire preflight into Foundry UI/runtime;
4. converge exporter/bridge behavior;
5. add fixtures and regression tests.

## Stage B - Complete Canonical Migration

### Goal

Move the project from "hybrid legacy + shared architecture" to "shared architecture first, legacy compatibility second".

### Why this comes second

Once import/export is operationally safer, the next highest leverage work is to reduce duplicated logic and make the canonical model the real center of gravity.

### Main workstreams

#### 1. Remove legacy-only actor assembly

Move more final actor assembly out of `scripts/character-builder.js` and into shared packages wherever practical.

Priority areas:

- remaining `system` sections;
- traits/proficiencies still finalized in legacy code;
- item generation paths still duplicated;
- token or metadata shaping that does not need to remain Foundry-local.

#### 2. Replace free-text choices with structured choices

Prefer ids and structured entries over labels and free-text wherever the UI or bridges still allow loose input.

Priority areas:

- proficiencies;
- equipment;
- spells;
- features;
- subclass or background-dependent picks.

#### 3. Reduce transitional bridge duplication

Treat these files as migration targets, not permanent architecture:

- `scripts/model-bridge.js`
- `scripts/foundry-export-bridge.js`
- `scripts/character-builder.js`

Whenever shared packages can own the logic safely, the legacy layer should shrink.

#### 4. Harden API and shared contracts together

Bring `apps/api` closer to the same contract discipline already present in the shared packages.

That includes:

- stronger response validation;
- clearer dataset provenance metadata;
- better integration tests around local/upstream/hybrid modes.

### Exit criteria

Stage B is complete when:

- canonical contracts and shared packages drive most final actor behavior;
- free-text inputs are materially reduced in the builder path;
- transitional bridges are smaller and clearly temporary;
- API, web, and Foundry paths consume the same canonical assumptions consistently.

### Suggested ticket order

1. audit remaining legacy-owned actor fields;
2. migrate one actor area at a time to shared ownership;
3. structure remaining loose choices in web + bridge paths;
4. add API integration tests and provenance checks;
5. update migration matrix after each slice.

## Stage C - Ship a Defensible Beta

### Goal

Turn the now-stable architecture into a shareable beta product with a clean demo story and repeatable release discipline.

### Why this comes last

Visual polish and launch prep become more valuable only after the import path and canonical architecture are reliable enough not to undermine demos or early users.

### Main workstreams

#### 1. Product-facing web polish

Keep improving `apps/web` as both:

- a live builder;
- a financier/demo surface.

Focus on:

- stronger first-run clarity;
- cleaner draft handling;
- better sheet presentation;
- better mobile behavior;
- clearer demo presets and screenshots.

#### 2. Draft and character persistence

Introduce draft persistence and clearer character lifecycle handling.

Possible scope:

- local persistence first;
- API-backed persistence second;
- explicit save/load flows.

#### 3. Beta release discipline

Define a release checklist that covers:

- package validation;
- app validation;
- Foundry compatibility verification;
- screenshot/demo refresh;
- changelog and release notes quality.

#### 4. Feedback loop

Prepare the repo to receive real beta feedback cleanly:

- issue templates if needed;
- bug triage categories;
- known limitations documented honestly;
- compatibility notes easy to find.

### Exit criteria

Stage C is complete when:

- the web demo is strong enough for repeated sharing;
- Foundry import is stable enough for early external usage;
- release steps are repeatable instead of memory-based;
- the backlog after beta is organized by evidence, not guesswork.

## Recommended current focus

The project should start with Stage A immediately.

The first implementation slice should be:

1. preflight result model;
2. shared preflight checks;
3. Foundry workflow surface for blockers and warnings;
4. representative import/export fixtures.

## Maintenance rule

When work is completed against this roadmap:

- update `docs/IMPLEMENTATION-LOG.md`;
- update `docs/MIGRATION-MATRIX.md` if migration ownership changes;
- update `docs/AI-HANDOFF.md` if priorities or validation flow change.
