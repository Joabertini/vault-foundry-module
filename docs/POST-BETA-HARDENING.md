# Post-Beta Hardening

## Purpose

Define the stage after beta preparation: turn early feedback into a more durable, lower-risk product baseline.

## Main Workstreams

### 1. Resolve Beta Findings

- triage tester feedback;
- classify blockers, regressions, and cosmetic issues;
- fix the highest-confidence Foundry mismatches first.

### 2. Remove Transitional Legacy Debt

- clean unreachable code in `scripts/character-builder.js`;
- shrink or replace temporary JS bridges;
- continue moving shared ownership into packages where practical.

### 3. Strengthen Runtime Regression Coverage

- add more Foundry-oriented regression cases;
- preserve fixtures for multiclass, spellcasting, proficiencies, and equipment;
- expand validation around warning-only and blocker scenarios.

### 4. Improve Release Discipline

- keep the release notes current;
- preserve a repeatable validation + capture + announcement cycle;
- define a cleaner path from beta preview to wider release.

## Exit Criteria

This post-beta stage is healthy when:

- the biggest beta findings are resolved or deliberately deferred;
- compatibility scaffolding is smaller and easier to reason about;
- the Foundry runtime has stronger regression confidence;
- release work is repeatable without relying on ad hoc memory.
