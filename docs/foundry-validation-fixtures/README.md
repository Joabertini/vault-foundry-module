# Foundry Validation Packet

Generated at: `2026-04-01T01:33:40.053Z`

## Fixture Summary

| Fixture | Result | Blockers | Warnings | Issues | Output |
| --- | --- | ---: | ---: | --- | --- |
| `martial-fighter-5` | ok | 0 | 0 | - | `docs/foundry-validation-fixtures/martial-fighter-5.json` |
| `prepared-cleric-5` | ok | 0 | 0 | - | `docs/foundry-validation-fixtures/prepared-cleric-5.json` |
| `pact-warlock-5` | ok | 0 | 1 | `DERIVED_SPELL_SLOTS_MISMATCH` | `docs/foundry-validation-fixtures/pact-warlock-5.json` |
| `background-feat` | ok | 0 | 0 | - | `docs/foundry-validation-fixtures/background-feat.json` |
| `wizard-spellbook-5` | ok | 0 | 0 | - | `docs/foundry-validation-fixtures/wizard-spellbook-5.json` |
| `warning-only` | ok | 0 | 3 | `SPELL_ID_LABEL_MISMATCH`, `SPELL_LEVEL_MISMATCH`, `EQUIPMENT_CATEGORY_MISMATCH` | `docs/foundry-validation-fixtures/warning-only.json` |
| `blocked-invalid-class` | blocked | 1 | 1 | `UNKNOWN_CLASS_ID`, `UNEXPECTED_DERIVED_SPELLCASTING` | `docs/foundry-validation-fixtures/blocked-invalid-class.json` |

## Manual Validation Workflow

1. Run `corepack pnpm foundry:fixtures` to refresh the packet.
2. Open `docs/FOUNDRY-MANUAL-VALIDATION.md` for the live Foundry checklist.
3. Record human results in `docs/FOUNDRY-MANUAL-VALIDATION-REPORT.md` or the generated working copy below.
