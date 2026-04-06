import type { CharacterBuild } from "@bertinis-vault/contracts";

export type DerivedEquipmentEntry = {
  lookupName: string;
  label: string;
  category: "weapon" | "armor" | "shield" | "gear" | "other";
  quantity: number;
};

export type DerivedSpellEntry = {
  name: string;
  level: number;
  spellId?: string;
};

export function getNormalizedProficiencyLabels(
  character: CharacterBuild,
  kind: "skill" | "language" | "tool",
): string[] {
  const entries = character.choices.normalized?.proficiencies ?? [];
  return entries
    .filter((entry) => entry.kind === kind)
    .map((entry) => entry.label);
}

export function getProficiencyLabels(
  character: CharacterBuild,
  kind: "skill" | "language" | "tool",
): string[] {
  const normalizedLabels = getNormalizedProficiencyLabels(character, kind);
  if (normalizedLabels.length) {
    return normalizedLabels;
  }

  if (kind === "language") {
    return character.choices.proficiencies
      .filter((entry) => /^language:/i.test(entry))
      .map((entry) => entry.replace(/^language:\s*/i, "").trim());
  }

  if (kind === "tool") {
    return character.choices.proficiencies
      .filter((entry) => /^tool:/i.test(entry))
      .map((entry) => entry.replace(/^tool:\s*/i, "").trim());
  }

  return character.choices.proficiencies.filter(
    (entry) => !/^language:/i.test(entry) && !/^tool:/i.test(entry),
  );
}

export function getSpellEntries(character: CharacterBuild): DerivedSpellEntry[] {
  const normalizedSpells = character.choices.normalized?.spells ?? [];
  if (normalizedSpells.length) {
    return normalizedSpells.map((entry) => ({
      name: entry.label,
      level: entry.level,
      ...(entry.spellId ? { spellId: entry.spellId } : {}),
    }));
  }

  return character.choices.spells.map((rawSpell) => {
    const match = rawSpell.match(/^(?:nv\s*(\d+)\s*:\s*)?(.+)$/i);
    if (!match) {
      return { name: rawSpell.trim(), level: 1 };
    }

    return {
      level: match[1] ? Number.parseInt(match[1], 10) : 1,
      name: (match[2] ?? rawSpell).trim(),
    };
  });
}

export function getFeatureEntries(character: CharacterBuild) {
  const normalizedFeatures = character.choices.normalized?.features ?? [];
  if (normalizedFeatures.length) {
    return normalizedFeatures.map((entry) => ({
      name: entry.label,
      source: entry.source,
    }));
  }

  return character.choices.features.map((feature) => ({
    name: feature,
    source: "class" as const,
  }));
}

export function getEquipmentEntries(character: CharacterBuild): DerivedEquipmentEntry[] {
  const normalizedEquipment = character.choices.normalized?.equipment ?? [];
  if (normalizedEquipment.length) {
    return normalizedEquipment.map((entry) => ({
      lookupName: entry.itemId ?? entry.label,
      label: entry.label,
      category: entry.category,
      quantity: entry.quantity,
    }));
  }

  return character.choices.equipment.map((entry) => ({
    lookupName: entry,
    label: entry,
    category: "other" as const,
    quantity: 1,
  }));
}
