# Beta Announcement Template

## Short Version

Bertini's Vault entered beta preview.

This version already uses the canonical shared pipeline as the active source of truth for Foundry actor creation, includes preflight validation before import, and ships with a web demo that shows the full character-to-Foundry flow more clearly.

What is included:

- canonical build model in active use
- preflight blockers and warnings before Foundry creation
- Foundry actor creation from the canonical preview path
- web demo with presets, sheet preview, and export visibility

What we want feedback on:

- mismatches between preflight and final actor behavior
- spellcasting, multiclass, proficiency, and equipment edge cases
- confusing demo or operator-facing messaging

## Longer Version

We're sharing a beta preview of Bertini's Vault.

This is the first project state where the shared canonical pipeline is no longer just architecture on paper: it is now the active path behind Foundry actor creation. The project also includes preflight checks before actor creation, clearer export/demo surfaces, and a more complete documentation package for collaborators and testers.

Supported focus for this beta:

- D&D 5e 2014-oriented flows covered by the shared pipeline
- demo/preset sharing through the web builder
- Foundry actor creation aligned with the canonical preview path

Known weak spots:

- final deep manual validation in live Foundry still matters
- some compatibility scaffolding and temporary bridges remain
- a few files still need cleanup due to encoding/mojibake issues

If you test it, the most useful feedback is:

- actor creation mismatches
- export/preflight inconsistencies
- confusing warning or blocker messaging
- edge cases around multiclass, equipment, or spellcasting
