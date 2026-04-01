# Foundry Validation Baseline

## Purpose

This file explains how to read the generated Foundry validation packet before a human runs the live Foundry pass.

It separates:

- expected clean fixtures;
- intentionally noisy fixtures;
- warnings that still represent real follow-up work.

## Current Baseline

### Clean Fixtures

These fixtures are expected to have:

- `ok: true`
- `blockers: 0`
- `warnings: 0`

Current clean set:

1. `martial-fighter-5`
2. `prepared-cleric-5`
3. `background-feat`
4. `wizard-spellbook-5`

If one of these starts emitting warnings or blockers, treat it as a regression candidate.

### Expected Warning Fixtures

These fixtures are expected to emit warnings today and should not be misread as accidental failures.

1. `warning-only`
Reason:
This fixture is intentionally malformed to prove that warning-only flows still export and stay understandable.
Expected issue codes:
- `SPELL_ID_LABEL_MISMATCH`
- `SPELL_LEVEL_MISMATCH`
- `EQUIPMENT_CATEGORY_MISMATCH`

2. `blocked-invalid-class`
Reason:
This fixture is intentionally invalid to prove that blocker flows stop creation cleanly.
Expected issue codes:
- `UNKNOWN_CLASS_ID`
- `UNEXPECTED_DERIVED_SPELLCASTING`

### Real Follow-Up Warning

1. `pact-warlock-5`
Current issue:
- `DERIVED_SPELL_SLOTS_MISMATCH`

Interpretation:
This is not a synthetic failure fixture. It is a real signal that the current canonical warlock sample and the shared expected progression disagree.

What this means operationally:

- keep the fixture in the validation packet;
- do not treat the warning as a blocker for the whole packet;
- treat it as an active follow-up item if the team wants the exported example build to be fully clean.

## Operator Rule Of Thumb

During manual Foundry validation:

1. if a clean fixture emits a new warning, log it as a likely regression;
2. if an intentionally noisy fixture behaves differently from its expected issue codes, log that as workflow drift;
3. if `pact-warlock-5` still warns but imports correctly, note it as known debt instead of a surprise failure;
4. if a blocker appears on a clean fixture, stop and treat it as high priority.
