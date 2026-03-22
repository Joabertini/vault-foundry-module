# Bertini's Vault - `ddimport.js` Procedural Comparison

This document treats [`ddimport.js`](D:/Users/Martin/Desktop/RESPALDO/D&D%205e/Documents/web%20builder/ddimport.js) as an external procedural anchor.

The goal is not to copy its domain behavior directly. The goal is to compare how it structures an import pipeline and use that to harden Bertini's Vault.

## Why It Matters

`ddimport.js` is more mature than our current character export flow in one specific way:

- it has a very explicit operational pipeline;
- it persists operator settings;
- it validates inputs before heavy work starts;
- it uses a transformation stage before final persistence;
- it gives the operator progress feedback;
- it treats import as a workflow, not just a conversion function.

Our current stack is stronger on canonical modeling and shared packages, but weaker on workflow orchestration around Foundry import/export.

## Anchor Stages Seen in `ddimport.js`

The external importer follows a clean sequence:

1. entrypoint injection into Foundry UI;
2. persistent import settings registration;
3. input collection through a dedicated application form;
4. preflight validation;
5. source file parsing;
6. intermediate aggregation and normalization;
7. heavy transformation step;
8. upload / persistence;
9. Foundry-side scene creation;
10. settings persistence for the next run;
11. user notifications throughout the flow.

Key examples in [`ddimport.js`](D:/Users/Martin/Desktop/RESPALDO/D&D%205e/Documents/web%20builder/ddimport.js):

- settings registration: lines 11-39;
- form context hydration: lines 78-119;
- submit pipeline: lines 123-357;
- transformation and aggregation: lines 196-339;
- progressive operator feedback: lines 176, 257, 264, 336, 338.

## Our Current Character Pipeline

Bertini's Vault currently does this:

1. collect builder state in web or legacy Foundry form;
2. coerce or bridge that state into canonical `CharacterBuild`;
3. derive combat/spellcasting data in shared domain code;
4. generate a `FoundryActorPayload` preview in the shared exporter;
5. optionally finalize actor assembly in legacy runtime.

Primary files:

- web orchestration: [`apps/web/src/App.tsx`](/D:/Users/Martin/Desktop/RESPALDO/D&D%205e/Documents/web%20builder/bertinis-vault-github-ready/bertinis-vault/apps/web/src/App.tsx)
- canonical bridge: [`scripts/model-bridge.js`](/D:/Users/Martin/Desktop/RESPALDO/D&D%205e/Documents/web%20builder/bertinis-vault-github-ready/bertinis-vault/scripts/model-bridge.js)
- shared exporter: [`packages/foundry-exporter/src/index.ts`](/D:/Users/Martin/Desktop/RESPALDO/D&D%205e/Documents/web%20builder/bertinis-vault-github-ready/bertinis-vault/packages/foundry-exporter/src/index.ts)
- legacy Foundry preview bridge: [`scripts/foundry-export-bridge.js`](/D:/Users/Martin/Desktop/RESPALDO/D&D%205e/Documents/web%20builder/bertinis-vault-github-ready/bertinis-vault/scripts/foundry-export-bridge.js)
- legacy runtime actor creation: [`scripts/character-builder.js`](/D:/Users/Martin/Desktop/RESPALDO/D&D%205e/Documents/web%20builder/bertinis-vault-github-ready/bertinis-vault/scripts/character-builder.js)

## Comparative Read

## Where Bertini's Vault Is Stronger

- Canonical contract is explicit and shared.
- Derivations are being centralized outside Foundry runtime.
- Export target is already modeled as typed payload, not just ad hoc object mutation.
- Web, API and exporter are already converging around shared packages.

## Where `ddimport.js` Is Operationally Stronger

- it has explicit preflight validation before doing the expensive work;
- it keeps operator settings durable between runs;
- it uses a clear intermediate aggregate before final import;
- it separates parse, transform and persist stages more visibly;
- it exposes progress notifications as part of the workflow;
- it treats multi-source input as a first-class concern.

## Process Gaps We Should Close

These are the procedural gaps that matter most for our service.

### 1. Missing preflight stage

Right now the web demo can generate export payloads, but the pipeline does not expose a strong "can this be imported cleanly?" gate.

We need a dedicated preflight result that reports:

- missing canonical ids;
- unresolved labels;
- unsupported spell/equipment entries;
- export warnings versus export blockers;
- target Foundry compatibility assumptions.

### 2. Missing import job envelope

`ddimport.js` wraps work in a form submission flow with persisted settings and user feedback.

We need an equivalent import/export job envelope for characters:

- source of truth used;
- target Foundry profile;
- export mode;
- validation result;
- generated payload metadata;
- import timestamp;
- revision or fingerprint.

### 3. Missing explicit aggregation stage

`ddimport.js` aggregates many source files into one normalized intermediate object before scene creation.

For Bertini's Vault, the equivalent aggregate should be a documented "resolved character package":

- canonical build;
- derived snapshot;
- Foundry payload;
- warnings;
- provenance metadata.

This package would make web preview, API export, Foundry import and future sync all consume the same resolved object.

### 4. Missing operator feedback loop

Our export actions mostly produce copy/download outcomes.

We should add workflow states such as:

- validating build;
- resolving Foundry payload;
- ready to import;
- imported with warnings;
- imported successfully;
- import failed at actor assembly stage.

### 5. Missing settings persistence for import destination

`ddimport.js` remembers path, source and transform settings.

Our equivalent should remember:

- last export target profile;
- preferred Foundry version / system profile;
- whether to export JSON, actor payload or live import;
- module-side defaults for image/token behavior once that exists.

## Recommended Integration Moves

These are the parts of the `ddimport.js` process that complement our service and should be integrated.

### Move A: Add exporter preflight output

Create a shared preflight function that runs before actor payload generation is considered final.

Suggested output shape:

- `ok`
- `warnings`
- `blockers`
- `resolvedIds`
- `unresolvedEntries`
- `targetProfile`

Best home:

- `packages/foundry-exporter`
- or a tiny sibling helper if we want to keep payload generation pure

### Move B: Define a resolved export package

Add a documented object that packages:

- canonical snapshot;
- derived summary;
- Foundry actor payload;
- validation/preflight report;
- exporter metadata.

This is the cleanest procedural equivalent to `ddimport.js`'s aggregated scene data.

### Move C: Introduce explicit import session settings

Start with a small persisted settings object in the web app and later reuse it inside `apps/foundry-module`.

Suggested fields:

- `targetFoundryVersion`
- `targetDnd5eVersion`
- `exportFormat`
- `preferCompendiumLookups`
- `strictMode`
- `includeTokenDefaults`

### Move D: Split workflow statuses from payload code

The exporter currently focuses on building the payload itself.

We should add a higher-level orchestration layer that manages:

- validation;
- export generation;
- copy/download/live-import actions;
- status reporting;
- eventual retry behavior.

This belongs closer to:

- `apps/web`
- future `apps/foundry-module`

not inside the raw payload builder.

### Move E: Make Foundry import a first-class phase

The architecture already says Foundry should be a destination, not the core. That still leaves room for a first-class import phase in the destination module.

The Foundry module should eventually do:

1. receive resolved export package;
2. run compatibility preflight;
3. create or sync actor;
4. report warnings and final result.

That is much closer to the `ddimport.js` pattern than our current "download payload and stop there" flow.

## Practical Next Steps

Ordered by return on effort:

1. Document and implement a shared export preflight result.
2. Add a `ResolvedCharacterExport` object or equivalent shared type.
3. Persist export/import preferences in web UI and later module UI.
4. Build a small orchestration layer in `apps/foundry-module` around payload import.
5. Rework the migration matrix around these explicit stages instead of only around files.

## What Not To Copy

We should not copy these parts directly from `ddimport.js`:

- its scene-specific logic;
- its file-picker and asset-upload assumptions;
- its UI implementation details;
- its direct coupling to Foundry hooks as the primary source of truth.

Our advantage is that we already have a canonical model. The procedural lesson is the workflow envelope, not the exact implementation.

## Bottom Line

`ddimport.js` should be treated as a process benchmark, not a domain template.

Its main lesson for Bertini's Vault is:

- make import/export feel like a managed job with validation, aggregation, status and persistence;
- keep canonical modeling as our core advantage;
- let Foundry become a clean destination module with a real orchestration layer.
