import { resolveClassId } from "@bertinis-vault/data-engine";
import type { AbilityId } from "@bertinis-vault/contracts";

export type SpellProgression = "full" | "half" | "pact" | "none";

export const spellAbilityByClassId: Partial<Record<string, AbilityId>> = {
  artificer: "int",
  bard: "cha",
  cleric: "wis",
  druid: "wis",
  paladin: "cha",
  ranger: "wis",
  sorcerer: "cha",
  warlock: "cha",
  wizard: "int",
};

export const hitDieByClassId: Partial<Record<string, number>> = {
  artificer: 8,
  barbarian: 12,
  bard: 8,
  cleric: 8,
  druid: 8,
  fighter: 10,
  monk: 8,
  paladin: 10,
  ranger: 10,
  rogue: 8,
  sorcerer: 6,
  warlock: 8,
  wizard: 6,
};

export const spellProgressionByClassId: Partial<Record<string, SpellProgression>> = {
  artificer: "half",
  bard: "full",
  cleric: "full",
  druid: "full",
  paladin: "half",
  ranger: "half",
  sorcerer: "full",
  warlock: "pact",
  wizard: "full",
  barbarian: "none",
  fighter: "none",
  monk: "none",
  rogue: "none",
};

export const spellSlotsFullCasterTable: Record<number, number[]> = {
  1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

export function normalizeClassId(classId: string): string {
  return resolveClassId(classId);
}

export function getHitDieForClass(classId: string): number {
  return hitDieByClassId[normalizeClassId(classId)] ?? 8;
}

export function getSpellAbilityForClass(classId: string): AbilityId | undefined {
  return spellAbilityByClassId[normalizeClassId(classId)];
}

export function getSpellProgressionForClass(classId: string): SpellProgression {
  return spellProgressionByClassId[normalizeClassId(classId)] ?? "none";
}

export function getSpellSlotsForClassLevel(classId: string, level: number): Record<string, number> {
  const progression = getSpellProgressionForClass(classId);
  const slots: Record<string, number> = {};

  for (let slotLevel = 1; slotLevel <= 9; slotLevel += 1) {
    slots[`spell${slotLevel}`] = 0;
  }

  if (progression === "none") {
    return slots;
  }

  if (progression === "pact") {
    const pactSlots = Math.min(2 + Math.floor((level - 1) / 4), 4);
    const pactLevel = Math.min(Math.ceil(level / 2), 5);
    slots[`spell${pactLevel}`] = pactSlots;
    return slots;
  }

  const effectiveLevel = progression === "half" ? Math.floor(level / 2) : level;
  const table = spellSlotsFullCasterTable[Math.max(effectiveLevel, 1)] ?? spellSlotsFullCasterTable[1] ?? [];

  table.forEach((count, index) => {
    slots[`spell${index + 1}`] = count;
  });

  return slots;
}
