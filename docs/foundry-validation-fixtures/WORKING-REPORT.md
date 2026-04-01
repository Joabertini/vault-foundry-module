# Foundry Manual Validation Working Copy

Generated at: `2026-04-01T01:23:22.509Z`

Start from `docs/FOUNDRY-MANUAL-VALIDATION-REPORT.md` for the canonical template.

## Automatic Baseline

| Fixture | Label | Preflight | Blockers | Warnings | Output |
| --- | --- | --- | ---: | ---: | --- |
| `martial-fighter-5` | Martial with armor and shield | ok | 0 | 0 | `docs/foundry-validation-fixtures/martial-fighter-5.json` |
| `prepared-cleric-5` | Prepared caster cleric | ok | 0 | 0 | `docs/foundry-validation-fixtures/prepared-cleric-5.json` |
| `pact-warlock-5` | Pact caster warlock | ok | 0 | 1 | `docs/foundry-validation-fixtures/pact-warlock-5.json` |
| `background-feat` | Background feat plus chosen feat | ok | 0 | 0 | `docs/foundry-validation-fixtures/background-feat.json` |
| `wizard-spellbook-5` | Wizard spellbook | ok | 0 | 0 | `docs/foundry-validation-fixtures/wizard-spellbook-5.json` |
| `warning-only` | Warning-only validation case | ok | 0 | 3 | `docs/foundry-validation-fixtures/warning-only.json` |
| `blocked-invalid-class` | Blocked invalid class case | blocked | 1 | 1 | `docs/foundry-validation-fixtures/blocked-invalid-class.json` |

## Manual Notes

### 1. Martial with armor and shield

- Fixture: `martial-fighter-5`
- Automatic baseline: ok; blockers=0; warnings=0
- Live Foundry result:
- Notes:
- Screenshot paths:

### 2. Prepared caster cleric

- Fixture: `prepared-cleric-5`
- Automatic baseline: ok; blockers=0; warnings=0
- Live Foundry result:
- Notes:
- Screenshot paths:

### 3. Pact caster warlock

- Fixture: `pact-warlock-5`
- Automatic baseline: ok; blockers=0; warnings=1
- Live Foundry result:
- Notes:
- Screenshot paths:

### 4. Background feat plus chosen feat

- Fixture: `background-feat`
- Automatic baseline: ok; blockers=0; warnings=0
- Live Foundry result:
- Notes:
- Screenshot paths:

### 5. Wizard spellbook

- Fixture: `wizard-spellbook-5`
- Automatic baseline: ok; blockers=0; warnings=0
- Live Foundry result:
- Notes:
- Screenshot paths:

### 6. Warning-only validation case

- Fixture: `warning-only`
- Automatic baseline: ok; blockers=0; warnings=3
- Live Foundry result:
- Notes:
- Screenshot paths:

### 7. Blocked invalid class case

- Fixture: `blocked-invalid-class`
- Automatic baseline: blocked; blockers=1; warnings=1
- Live Foundry result:
- Notes:
- Screenshot paths:

