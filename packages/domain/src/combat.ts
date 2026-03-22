const armorFormulaBase: Record<string, number> = {
  "10+DEX": 10,
  "11+DEX": 11,
  "12+DEX": 12,
  "13+DEX": 13,
  "16": 16,
  "17": 17,
  "18": 18,
};

export function calculateArmorClass(input: {
  armorFormula?: string;
  dexModifier: number;
  hasShield?: boolean;
  unarmoredAbilityModifier?: number;
  dexCap?: number;
}): number {
  const dexContribution =
    input.dexCap === undefined
      ? input.dexModifier
      : Math.min(input.dexModifier, input.dexCap);

  let base = 10 + dexContribution;
  const formula = input.armorFormula;
  const formulaBase = formula ? armorFormulaBase[formula] : undefined;

  if (formulaBase !== undefined && formula) {
    base = formulaBase + (formula.endsWith("+DEX") ? dexContribution : 0);
  } else if (formula === "13+DEX2") {
    base = 13 + Math.min(input.dexModifier, 2);
  } else if (formula === "14+DEX2") {
    base = 14 + Math.min(input.dexModifier, 2);
  } else if (formula === "15+DEX2") {
    base = 15 + Math.min(input.dexModifier, 2);
  } else if (formula === "special") {
    base = 10 + input.dexModifier + (input.unarmoredAbilityModifier ?? 0);
  }

  return base + (input.hasShield ? 2 : 0);
}

export function calculateEstimatedHitPoints(input: {
  hitDie: number;
  level: number;
  constitutionModifier: number;
}): number {
  const firstLevel = input.hitDie + input.constitutionModifier;
  const laterLevels =
    Math.max(input.level - 1, 0) *
    (Math.floor(input.hitDie / 2) + 1 + input.constitutionModifier);

  return Math.max(firstLevel + laterLevels, 1);
}
