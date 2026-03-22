import type { AbilityId } from "@bertinis-vault/contracts";

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function abilityModifierMap(
  scores: Record<AbilityId, number>,
): Record<AbilityId, number> {
  return {
    str: abilityModifier(scores.str),
    dex: abilityModifier(scores.dex),
    con: abilityModifier(scores.con),
    int: abilityModifier(scores.int),
    wis: abilityModifier(scores.wis),
    cha: abilityModifier(scores.cha),
  };
}
