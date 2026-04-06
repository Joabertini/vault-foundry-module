import {
  armorCatalog,
  backgroundCatalog,
  classCatalog,
  featCatalog,
  gearCatalog,
  raceCatalog,
  getSpellClasses,
  spellCatalog,
  subclassCatalog,
  weaponCatalog,
} from "@bertinis-vault/data-engine";

type ClassMetadata = {
  hitDie: number;
  spellcastingAbility: string | null;
  casterProgression: "none" | "full" | "half" | "pact" | "third";
  startingEquipment: string[];
  primaryAbilities: string[];
};

const classMetadataById: Record<string, ClassMetadata> = {
  barbarian: {
    hitDie: 12,
    spellcastingAbility: null,
    casterProgression: "none",
    startingEquipment: ["greataxe", "handaxe", "explorers-pack"],
    primaryAbilities: ["str", "con"],
  },
  bard: {
    hitDie: 8,
    spellcastingAbility: "cha",
    casterProgression: "full",
    startingEquipment: ["dagger", "component-pouch", "lute", "explorers-pack"],
    primaryAbilities: ["cha", "dex"],
  },
  cleric: {
    hitDie: 8,
    spellcastingAbility: "wis",
    casterProgression: "full",
    startingEquipment: ["mace", "shield", "holy-symbol", "priests-pack"],
    primaryAbilities: ["wis", "str"],
  },
  druid: {
    hitDie: 8,
    spellcastingAbility: "wis",
    casterProgression: "full",
    startingEquipment: ["quarterstaff", "leather", "explorers-pack", "druidic-focus"],
    primaryAbilities: ["wis", "con"],
  },
  fighter: {
    hitDie: 10,
    spellcastingAbility: null,
    casterProgression: "none",
    startingEquipment: ["chain-mail", "longsword", "shield", "dungeoneers-pack"],
    primaryAbilities: ["str", "con"],
  },
  monk: {
    hitDie: 8,
    spellcastingAbility: null,
    casterProgression: "none",
    startingEquipment: ["quarterstaff", "dart", "explorers-pack"],
    primaryAbilities: ["dex", "wis"],
  },
  paladin: {
    hitDie: 10,
    spellcastingAbility: "cha",
    casterProgression: "half",
    startingEquipment: ["chain-mail", "shield", "longsword", "holy-symbol"],
    primaryAbilities: ["str", "cha"],
  },
  ranger: {
    hitDie: 10,
    spellcastingAbility: "wis",
    casterProgression: "half",
    startingEquipment: ["leather", "shortbow", "dagger", "explorers-pack"],
    primaryAbilities: ["dex", "wis"],
  },
  rogue: {
    hitDie: 8,
    spellcastingAbility: null,
    casterProgression: "none",
    startingEquipment: ["dagger", "thieves-tools", "leather", "dungeoneers-pack"],
    primaryAbilities: ["dex", "int"],
  },
  sorcerer: {
    hitDie: 6,
    spellcastingAbility: "cha",
    casterProgression: "full",
    startingEquipment: ["dagger", "arcane-focus", "component-pouch", "dungeoneers-pack"],
    primaryAbilities: ["cha", "con"],
  },
  warlock: {
    hitDie: 8,
    spellcastingAbility: "cha",
    casterProgression: "pact",
    startingEquipment: ["dagger", "leather", "arcane-focus", "scholars-pack"],
    primaryAbilities: ["cha", "con"],
  },
  wizard: {
    hitDie: 6,
    spellcastingAbility: "int",
    casterProgression: "full",
    startingEquipment: ["quarterstaff", "spellbook", "component-pouch", "scholars-pack"],
    primaryAbilities: ["int", "con"],
  },
  artificer: {
    hitDie: 8,
    spellcastingAbility: "int",
    casterProgression: "half",
    startingEquipment: ["leather", "dagger", "thieves-tools", "explorers-pack"],
    primaryAbilities: ["int", "con"],
  },
};

function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesLookup(
  value: string,
  candidate: { id: string; label: string; aliases?: string[] },
) {
  const needle = normalizeToken(value);
  return [candidate.id, candidate.label, ...(candidate.aliases ?? [])].some(
    (entry) => normalizeToken(entry) === needle,
  );
}

export function buildDatasetMeta() {
  return {
    source: {
      mode: "curated-local",
      upstream: "5etools-planned-via-bff",
    },
  };
}

export function buildClassesDataset() {
  return {
    ...buildDatasetMeta(),
    items: classCatalog.map((entry) => ({
      id: entry.id,
      label: entry.label,
      hitDie: classMetadataById[entry.id]?.hitDie ?? 8,
      spellcastingAbility: classMetadataById[entry.id]?.spellcastingAbility ?? null,
      casterProgression: classMetadataById[entry.id]?.casterProgression ?? "none",
      startingEquipment: classMetadataById[entry.id]?.startingEquipment ?? [],
      primaryAbilities: classMetadataById[entry.id]?.primaryAbilities ?? [],
    })),
  };
}

export function buildRacesDataset() {
  return {
    ...buildDatasetMeta(),
    items: raceCatalog.map((entry) => ({
      id: entry.id,
      label: entry.label,
    })),
  };
}

export function buildSubclassDataset() {
  return {
    ...buildDatasetMeta(),
    items: subclassCatalog.map((entry) => ({
      id: entry.id,
      classId: entry.classId,
      label: entry.label,
      aliases: entry.aliases,
    })),
  };
}

export function buildBackgroundsDataset() {
  return {
    ...buildDatasetMeta(),
    items: backgroundCatalog.map((entry) => ({
      id: entry.id,
      label: entry.label,
      source: entry.source,
      grantedFeatIds: entry.grantedFeatIds,
    })),
  };
}

export function buildFeatsDataset() {
  return {
    ...buildDatasetMeta(),
    items: featCatalog.map((entry) => ({
      id: entry.id,
      label: entry.label,
    })),
  };
}

export function buildEquipmentDataset() {
  return {
    ...buildDatasetMeta(),
    gear: gearCatalog.map((entry) => ({
      id: entry.id,
      label: entry.label,
      category: "gear",
    })),
    armor: armorCatalog.map((entry) => ({
      id: entry.id,
      label: entry.label,
      category: "armor",
      armorFormula: entry.armorFormula,
      grantsShieldBonus: Boolean(entry.grantsShieldBonus),
    })),
    weapons: weaponCatalog.map((entry) => ({
      id: entry.id,
      label: entry.label,
      category: "weapon",
      itemType: entry.itemType,
      damage: entry.damage,
      damageType: entry.damageType,
      attackType: entry.attackType,
    })),
  };
}

export function buildSpellsDataset() {
  const items = spellCatalog.map((entry) => ({
    id: entry.id,
    label: entry.label,
    level: entry.level,
    classes: getSpellClasses(entry.id),
    school: entry.school ?? null,
    summary: entry.summary ?? "",
    castingTimeLabel: entry.castingTime?.label ?? "",
    rangeLabel: entry.range?.label ?? "",
    durationLabel: entry.duration?.label ?? "",
    componentsLabel: entry.components?.join(", ") ?? "",
  }));

  return {
    ...buildDatasetMeta(),
    cantrips: items.filter((entry) => entry.level === 0),
    spells: items.filter((entry) => entry.level > 0),
  };
}

export function findClassEntry(value: string) {
  const entry = classCatalog.find((candidate) => matchesLookup(value, candidate));
  if (!entry) {
    return null;
  }

  return {
    ...entry,
    ...(classMetadataById[entry.id] ?? {
      hitDie: 8,
      spellcastingAbility: null,
      casterProgression: "none",
      startingEquipment: [],
      primaryAbilities: [],
    }),
  };
}

export function buildClassSpellDataset(classId: string) {
  return {
    ...buildDatasetMeta(),
    classId,
    items: spellCatalog
      .filter((entry) => getSpellClasses(entry.id).includes(classId))
      .map((entry) => ({
        id: entry.id,
        label: entry.label,
        level: entry.level,
        school: entry.school ?? null,
        classes: getSpellClasses(entry.id),
        summary: entry.summary ?? "",
        castingTimeLabel: entry.castingTime?.label ?? "",
        rangeLabel: entry.range?.label ?? "",
        durationLabel: entry.duration?.label ?? "",
        componentsLabel: entry.components?.join(", ") ?? "",
      })),
  };
}

export function buildSpellsIndex(filters: {
  classId?: string | null;
  level?: number | null;
  school?: string | null;
}) {
  let items = spellCatalog.slice();

  if (filters.classId) {
    items = items.filter((entry) => getSpellClasses(entry.id).includes(filters.classId as string));
  }

  if (filters.level !== null && filters.level !== undefined) {
    items = items.filter((entry) => entry.level === filters.level);
  }

  if (filters.school) {
    items = items.filter((entry) => entry.school?.toLowerCase() === filters.school?.toLowerCase());
  }

  return {
    ...buildDatasetMeta(),
    items: items.map((entry) => ({
      id: entry.id,
      label: entry.label,
      level: entry.level,
      school: entry.school ?? null,
      classes: getSpellClasses(entry.id),
      summary: entry.summary ?? "",
      castingTimeLabel: entry.castingTime?.label ?? "",
      rangeLabel: entry.range?.label ?? "",
      durationLabel: entry.duration?.label ?? "",
      componentsLabel: entry.components?.join(", ") ?? "",
    })),
  };
}

export function buildSpellDetails(idOrName: string) {
  const entry = spellCatalog.find((candidate) => matchesLookup(idOrName, candidate));
  if (!entry) {
    return null;
  }

  return {
    ...entry,
    classes: getSpellClasses(entry.id),
    castingTimeLabel: entry.castingTime?.label ?? "",
    rangeLabel: entry.range?.label ?? "",
    durationLabel: entry.duration?.label ?? "",
    componentsLabel: entry.components?.join(", ") ?? "",
  };
}

export function buildItemsIndex() {
  return {
    ...buildDatasetMeta(),
    items: [
      ...gearCatalog.map((entry) => ({
        id: entry.id,
        label: entry.label,
        category: "gear",
      })),
      ...armorCatalog.map((entry) => ({
        id: entry.id,
        label: entry.label,
        category: "armor",
        armorFormula: entry.armorFormula,
        grantsShieldBonus: Boolean(entry.grantsShieldBonus),
      })),
      ...weaponCatalog.map((entry) => ({
        id: entry.id,
        label: entry.label,
        category: "weapon",
        itemType: entry.itemType,
        damage: entry.damage,
        damageType: entry.damageType,
        attackType: entry.attackType,
      })),
    ],
  };
}

export function buildItemDetails(idOrName: string) {
  const gearEntry = gearCatalog.find((candidate) => matchesLookup(idOrName, candidate));
  if (gearEntry) {
    return {
      id: gearEntry.id,
      label: gearEntry.label,
      category: "gear",
    };
  }

  const armorEntry = armorCatalog.find((candidate) => matchesLookup(idOrName, candidate));
  if (armorEntry) {
    return {
      id: armorEntry.id,
      label: armorEntry.label,
      category: "armor",
      armorFormula: armorEntry.armorFormula,
      grantsShieldBonus: Boolean(armorEntry.grantsShieldBonus),
    };
  }

  const weaponEntry = weaponCatalog.find((candidate) => matchesLookup(idOrName, candidate));
  if (weaponEntry) {
    return {
      id: weaponEntry.id,
      label: weaponEntry.label,
      category: "weapon",
      itemType: weaponEntry.itemType,
      damage: weaponEntry.damage,
      damageType: weaponEntry.damageType,
      attackType: weaponEntry.attackType,
    };
  }

  return null;
}
