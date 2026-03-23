# Beta Release Notes

## Summary

This beta is the first project state where the shared canonical pipeline is the active source of truth for Foundry actor creation, not just the architectural target.

## Included In This Beta

- canonical character build model in active use;
- shared preflight before Foundry actor creation;
- Foundry actor creation from canonical preview path;
- web demo with presets, sheet preview, preflight state, and beta-readiness framing;
- traceability flags attached to created actors:
  - `canonicalBuild`
  - `canonicalFoundryPreview`
  - `canonicalPreflight`

## Supported Scope

- D&D 5e 2014-focused flows already covered by the shared pipeline;
- demo/preset sharing through the web builder;
- Foundry actor export/import flow aligned with the canonical preview path.

## Known Weak Spots

- manual validation inside a live Foundry VTT environment still needs a final deep pass;
- some legacy scaffolding remains in compatibility wrappers and temporary JS bridges;
- a few files still contain mojibake/encoding issues that make cleanup slower than ideal.

## What Changed Recently

- Stage A reached a stable shared preflight/export baseline;
- Stage B moved active runtime ownership away from the legacy builder path;
- Stage C now includes beta-readiness messaging, release checklist material, and a more shareable demo surface.

## What Feedback We Want

- mismatches between preflight and actual Foundry import behavior;
- missing or misleading export data in real actor creation;
- confusing parts of the web demo for first-time viewers;
- edge cases around multiclass, spellcasting, proficiencies, and equipment.
