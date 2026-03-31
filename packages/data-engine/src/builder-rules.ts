export const classSkillOptionsByClassId: Record<string, string[]> = {
  artificer: ["Arcana", "History", "Investigation", "Medicine", "Nature", "Perception"],
  bard: ["Acrobatics", "Performance", "Persuasion", "Insight", "Deception", "History"],
  cleric: ["History", "Insight", "Medicine", "Persuasion", "Religion"],
  druid: ["Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"],
  fighter: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"],
  monk: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"],
  paladin: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"],
  ranger: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"],
  rogue: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Sleight of Hand", "Stealth"],
  sorcerer: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"],
  warlock: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"],
  wizard: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
};

export const backgroundGrantedProficienciesById: Record<string, string[]> = {
  acolyte: ["Insight", "Religion"],
  charlatan: ["Deception", "Sleight of Hand"],
  criminal: ["Deception", "Stealth", "Thieves' Tools"],
  entertainer: ["Acrobatics", "Performance"],
  "folk-hero": ["Animal Handling", "Survival"],
  "guild-artisan": ["Insight", "Persuasion"],
  hermit: ["Medicine", "Religion"],
  noble: ["History", "Persuasion"],
  outlander: ["Athletics", "Survival"],
  sage: ["Arcana", "History"],
  sailor: ["Athletics", "Perception"],
  soldier: ["Athletics", "Intimidation"],
  urchin: ["Sleight of Hand", "Stealth", "Thieves' Tools"],
};

export const classSkillPickCountByClassId: Record<string, number> = {
  artificer: 2,
  bard: 3,
  cleric: 2,
  druid: 2,
  fighter: 2,
  monk: 2,
  paladin: 2,
  ranger: 3,
  rogue: 4,
  sorcerer: 2,
  warlock: 2,
  wizard: 2,
};

export const classWeaponOptionIdsByClassId: Record<string, string[]> = {
  artificer: ["dagger", "light-crossbow", "quarterstaff"],
  bard: ["dagger", "rapier", "shortsword", "light-crossbow"],
  cleric: ["mace", "warhammer", "light-crossbow"],
  druid: ["club", "dagger", "mace", "quarterstaff", "scimitar", "spear"],
  fighter: ["longsword", "greatsword", "battleaxe", "warhammer", "shortbow", "light-crossbow"],
  monk: ["quarterstaff", "shortsword", "dart", "spear"],
  paladin: ["longsword", "warhammer", "javelin", "light-crossbow"],
  ranger: ["shortbow", "longbow", "longsword", "shortsword", "dagger"],
  rogue: ["dagger", "rapier", "shortsword", "shortbow", "light-crossbow"],
  sorcerer: ["dagger", "quarterstaff", "light-crossbow"],
  warlock: ["dagger", "mace", "quarterstaff", "light-crossbow"],
  wizard: ["dagger", "quarterstaff", "light-crossbow"],
};

export const classArmorOptionIdsByClassId: Record<string, string[]> = {
  artificer: ["leather", "scale-mail", "shield"],
  bard: ["leather"],
  cleric: ["chain-mail", "scale-mail", "shield"],
  druid: ["leather", "hide", "shield"],
  fighter: ["chain-mail", "scale-mail", "shield"],
  monk: ["unarmored"],
  paladin: ["chain-mail", "scale-mail", "shield"],
  ranger: ["leather", "scale-mail", "shield"],
  rogue: ["leather"],
  sorcerer: ["mage-armor", "unarmored"],
  warlock: ["leather", "mage-armor"],
  wizard: ["mage-armor", "unarmored"],
};

export function getClassSkillOptions(classId: string): string[] {
  return classSkillOptionsByClassId[classId] ?? [];
}

export function getBackgroundGrantedProficiencies(backgroundId: string): string[] {
  return backgroundGrantedProficienciesById[backgroundId] ?? [];
}

export function getClassSkillPickCount(classId: string): number {
  const options = getClassSkillOptions(classId);
  return classSkillPickCountByClassId[classId] ?? Math.min(2, options.length);
}

export function getClassWeaponOptionIds(classId: string): string[] {
  return classWeaponOptionIdsByClassId[classId] ?? [];
}

export function getClassArmorOptionIds(classId: string): string[] {
  return classArmorOptionIdsByClassId[classId] ?? [];
}
