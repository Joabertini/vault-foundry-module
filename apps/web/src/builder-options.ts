import {
  armorCatalog,
  backgroundCatalog,
  classCatalog,
  featCatalog,
  gearCatalog,
  raceCatalog,
  spellCatalog,
  subclassCatalog,
  weaponCatalog,
} from "@bertinis-vault/data-engine";

export type SelectOption = {
  id: string;
  label: string;
};

export type BuilderOptionsPayload = {
  source: {
    mode: string;
    upstream: string;
  };
  classes: Array<
    SelectOption & {
      hitDie?: number;
      spellcastingAbility?: string | null;
      casterProgression?: string;
      startingEquipment?: string[];
      primaryAbilities?: string[];
    }
  >;
  subclasses: Record<string, SelectOption[]>;
  races: SelectOption[];
  backgrounds: Array<SelectOption & { source?: string; grantedFeatIds?: string[] }>;
  feats: SelectOption[];
  spells: {
    cantrips: Array<
      SelectOption & {
        level: number;
        classes?: string[];
        school?: string | null;
        summary?: string;
        castingTimeLabel?: string;
        rangeLabel?: string;
        durationLabel?: string;
        componentsLabel?: string;
      }
    >;
    spells: Array<
      SelectOption & {
        level: number;
        classes?: string[];
        school?: string | null;
        summary?: string;
        castingTimeLabel?: string;
        rangeLabel?: string;
        durationLabel?: string;
        componentsLabel?: string;
      }
    >;
  };
  equipment: {
    gear: SelectOption[];
    armor: Array<SelectOption & { armorFormula?: string; grantsShieldBonus?: boolean }>;
    weapons: Array<SelectOption & { damage?: string; damageType?: string; attackType?: string }>;
  };
};

type DatasetEnvelope<T> = {
  source: {
    mode: string;
    upstream: string;
  };
  items?: T[];
  cantrips?: Array<
    SelectOption & {
      level: number;
      classes?: string[];
      school?: string | null;
      summary?: string;
      castingTimeLabel?: string;
      rangeLabel?: string;
      durationLabel?: string;
      componentsLabel?: string;
    }
  >;
  spells?: Array<
    SelectOption & {
      level: number;
      classes?: string[];
      school?: string | null;
      summary?: string;
      castingTimeLabel?: string;
      rangeLabel?: string;
      durationLabel?: string;
      componentsLabel?: string;
    }
  >;
  gear?: SelectOption[];
  armor?: Array<SelectOption & { armorFormula?: string; grantsShieldBonus?: boolean }>;
  weapons?: Array<SelectOption & { damage?: string; damageType?: string; attackType?: string }>;
};

const classMetadataById: Record<
  string,
  {
    hitDie: number;
    spellcastingAbility: string | null;
    casterProgression: string;
    startingEquipment: string[];
    primaryAbilities: string[];
  }
> = {
  artificer: { hitDie: 8, spellcastingAbility: "int", casterProgression: "half", startingEquipment: ["leather", "dagger", "thieves-tools", "explorers-pack"], primaryAbilities: ["int", "con"] },
  barbarian: { hitDie: 12, spellcastingAbility: null, casterProgression: "none", startingEquipment: ["greataxe", "handaxe", "explorers-pack"], primaryAbilities: ["str", "con"] },
  bard: { hitDie: 8, spellcastingAbility: "cha", casterProgression: "full", startingEquipment: ["dagger", "component-pouch", "lute", "explorers-pack"], primaryAbilities: ["cha", "dex"] },
  cleric: { hitDie: 8, spellcastingAbility: "wis", casterProgression: "full", startingEquipment: ["mace", "shield", "holy-symbol", "priests-pack"], primaryAbilities: ["wis", "str"] },
  druid: { hitDie: 8, spellcastingAbility: "wis", casterProgression: "full", startingEquipment: ["quarterstaff", "leather", "explorers-pack", "druidic-focus"], primaryAbilities: ["wis", "con"] },
  fighter: { hitDie: 10, spellcastingAbility: null, casterProgression: "none", startingEquipment: ["chain-mail", "longsword", "shield", "dungeoneers-pack"], primaryAbilities: ["str", "con"] },
  monk: { hitDie: 8, spellcastingAbility: null, casterProgression: "none", startingEquipment: ["quarterstaff", "dart", "explorers-pack"], primaryAbilities: ["dex", "wis"] },
  paladin: { hitDie: 10, spellcastingAbility: "cha", casterProgression: "half", startingEquipment: ["chain-mail", "shield", "longsword", "holy-symbol"], primaryAbilities: ["str", "cha"] },
  ranger: { hitDie: 10, spellcastingAbility: "wis", casterProgression: "half", startingEquipment: ["leather", "shortbow", "dagger", "explorers-pack"], primaryAbilities: ["dex", "wis"] },
  rogue: { hitDie: 8, spellcastingAbility: null, casterProgression: "none", startingEquipment: ["dagger", "thieves-tools", "leather", "dungeoneers-pack"], primaryAbilities: ["dex", "int"] },
  sorcerer: { hitDie: 6, spellcastingAbility: "cha", casterProgression: "full", startingEquipment: ["dagger", "arcane-focus", "component-pouch", "dungeoneers-pack"], primaryAbilities: ["cha", "con"] },
  warlock: { hitDie: 8, spellcastingAbility: "cha", casterProgression: "pact", startingEquipment: ["dagger", "leather", "arcane-focus", "scholars-pack"], primaryAbilities: ["cha", "con"] },
  wizard: { hitDie: 6, spellcastingAbility: "int", casterProgression: "full", startingEquipment: ["quarterstaff", "spellbook", "component-pouch", "scholars-pack"], primaryAbilities: ["int", "con"] },
};

export const fallbackBuilderOptions: BuilderOptionsPayload = {
  source: {
    mode: "curated-local",
    upstream: "5etools-planned-via-bff",
  },
  classes: classCatalog.map((entry) => ({
    id: entry.id,
    label: entry.label,
    spellcastingAbility: classMetadataById[entry.id]?.spellcastingAbility ?? null,
    casterProgression: classMetadataById[entry.id]?.casterProgression ?? "none",
    startingEquipment: classMetadataById[entry.id]?.startingEquipment ?? [],
    primaryAbilities: classMetadataById[entry.id]?.primaryAbilities ?? [],
    hitDie: classMetadataById[entry.id]?.hitDie ?? 8,
  })),
  subclasses: Object.fromEntries(
    classCatalog.map((classEntry) => [
      classEntry.id,
      subclassCatalog
        .filter((entry: { classId: string }) => entry.classId === classEntry.id)
        .map((entry: { id: string; label: string }) => ({ id: entry.id, label: entry.label })),
    ]),
  ),
  races: raceCatalog.map((entry) => ({
    id: entry.id,
    label: entry.label,
  })),
  backgrounds: backgroundCatalog.map((entry) => ({
    id: entry.id,
    label: entry.label,
    source: entry.source,
    grantedFeatIds: entry.grantedFeatIds,
  })),
  feats: featCatalog.map((entry) => ({
    id: entry.id,
    label: entry.label,
  })),
  spells: {
    cantrips: spellCatalog
      .filter((entry) => entry.level === 0)
      .map((entry) => ({
        id: entry.id,
        label: entry.label,
        level: entry.level,
        classes: entry.classes ?? [],
        school: entry.school ?? null,
        summary: entry.summary ?? "",
        castingTimeLabel: entry.castingTime?.label ?? "",
        rangeLabel: entry.range?.label ?? "",
        durationLabel: entry.duration?.label ?? "",
        componentsLabel: entry.components?.join(", ") ?? "",
      })),
    spells: spellCatalog
      .filter((entry) => entry.level > 0)
      .map((entry) => ({
        id: entry.id,
        label: entry.label,
        level: entry.level,
        classes: entry.classes ?? [],
        school: entry.school ?? null,
        summary: entry.summary ?? "",
        castingTimeLabel: entry.castingTime?.label ?? "",
        rangeLabel: entry.range?.label ?? "",
        durationLabel: entry.duration?.label ?? "",
        componentsLabel: entry.components?.join(", ") ?? "",
      })),
  },
  equipment: {
    gear: gearCatalog.map((entry) => ({
      id: entry.id,
      label: entry.label,
    })),
    armor: armorCatalog.map((entry) => ({
      id: entry.id,
      label: entry.label,
      armorFormula: entry.armorFormula,
      grantsShieldBonus: Boolean(entry.grantsShieldBonus),
    })),
    weapons: weaponCatalog.map((entry) => ({
      id: entry.id,
      label: entry.label,
      damage: entry.damage,
      damageType: entry.damageType,
      attackType: entry.attackType,
    })),
  },
};

function getFallbackSpell(spellId: string) {
  return spellCatalog.find((spell) => spell.id === spellId);
}

export async function loadBuilderOptions(): Promise<BuilderOptionsPayload> {
  const baseUrl = import.meta.env.VITE_BERTINIS_API_URL?.trim() || "http://127.0.0.1:3001";
  const classesUrl = `${baseUrl}/datasets/classes?source=hybrid`;
  const racesUrl = `${baseUrl}/datasets/races?source=hybrid`;
  const backgroundsUrl = `${baseUrl}/datasets/backgrounds?source=hybrid`;
  const featsUrl = `${baseUrl}/datasets/feats?source=hybrid`;
  const spellsUrl = `${baseUrl}/datasets/spells?source=hybrid`;
  const equipmentUrl = `${baseUrl}/datasets/equipment?source=hybrid`;
  const [meta, classes, races, backgrounds, feats, spells, equipment] = await Promise.all([
    fetchJson<DatasetEnvelope<SelectOption>>(`${baseUrl}/datasets/meta`),
    fetchJson<
      DatasetEnvelope<
        SelectOption & {
          hitDie?: number;
          spellcastingAbility?: string | null;
          casterProgression?: string;
          startingEquipment?: string[];
          primaryAbilities?: string[];
        }
      >
    >(classesUrl),
    fetchJson<DatasetEnvelope<SelectOption>>(racesUrl),
    fetchJson<DatasetEnvelope<SelectOption & { source?: string; grantedFeatIds?: string[] }>>(
      backgroundsUrl,
    ),
    fetchJson<DatasetEnvelope<SelectOption>>(featsUrl),
    fetchJson<
      DatasetEnvelope<SelectOption> & {
        cantrips: Array<
          SelectOption & {
            level: number;
            classes?: string[];
            school?: string | null;
            summary?: string;
            castingTimeLabel?: string;
            rangeLabel?: string;
            durationLabel?: string;
            componentsLabel?: string;
          }
        >;
        spells: Array<
          SelectOption & {
            level: number;
            classes?: string[];
            school?: string | null;
            summary?: string;
            castingTimeLabel?: string;
            rangeLabel?: string;
            durationLabel?: string;
            componentsLabel?: string;
          }
        >;
      }
    >(spellsUrl),
    fetchJson<
      DatasetEnvelope<SelectOption> & {
        gear: SelectOption[];
        armor: Array<SelectOption & { armorFormula?: string; grantsShieldBonus?: boolean }>;
        weapons: Array<SelectOption & { damage?: string; damageType?: string; attackType?: string }>;
      }
    >(equipmentUrl),
  ]);

  return {
    source: meta.source,
    classes: (classes.items ?? fallbackBuilderOptions.classes).map((entry) => ({
      ...classMetadataById[entry.id],
      ...entry,
      hitDie: entry.hitDie ?? classMetadataById[entry.id]?.hitDie ?? 8,
      spellcastingAbility: entry.spellcastingAbility ?? classMetadataById[entry.id]?.spellcastingAbility ?? null,
      casterProgression: entry.casterProgression ?? classMetadataById[entry.id]?.casterProgression ?? "none",
      startingEquipment: entry.startingEquipment?.length ? entry.startingEquipment : classMetadataById[entry.id]?.startingEquipment ?? [],
      primaryAbilities: entry.primaryAbilities?.length ? entry.primaryAbilities : classMetadataById[entry.id]?.primaryAbilities ?? [],
    })),
    subclasses:
      (meta as DatasetEnvelope<SelectOption> & { subclasses?: Record<string, SelectOption[]> }).subclasses ?? {},
    races: races.items ?? [],
    backgrounds: backgrounds.items ?? [],
    feats: feats.items ?? [],
    spells: {
      cantrips: (spells.cantrips ?? fallbackBuilderOptions.spells.cantrips).map((entry) => {
        const fallbackSpell = getFallbackSpell(entry.id);
        return {
          ...entry,
          classes: entry.classes?.length ? entry.classes : fallbackSpell?.classes ?? [],
          school: entry.school || fallbackSpell?.school || null,
          summary: entry.summary?.trim() ? entry.summary : fallbackSpell?.summary ?? "",
          castingTimeLabel: entry.castingTimeLabel || fallbackSpell?.castingTime?.label || "",
          rangeLabel: entry.rangeLabel || fallbackSpell?.range?.label || "",
          durationLabel: entry.durationLabel || fallbackSpell?.duration?.label || "",
          componentsLabel:
            entry.componentsLabel || fallbackSpell?.components?.join(", ") || "",
        };
      }),
      spells: (spells.spells ?? fallbackBuilderOptions.spells.spells).map((entry) => {
        const fallbackSpell = getFallbackSpell(entry.id);
        return {
          ...entry,
          classes: entry.classes?.length ? entry.classes : fallbackSpell?.classes ?? [],
          school: entry.school || fallbackSpell?.school || null,
          summary: entry.summary?.trim() ? entry.summary : fallbackSpell?.summary ?? "",
          castingTimeLabel: entry.castingTimeLabel || fallbackSpell?.castingTime?.label || "",
          rangeLabel: entry.rangeLabel || fallbackSpell?.range?.label || "",
          durationLabel: entry.durationLabel || fallbackSpell?.duration?.label || "",
          componentsLabel:
            entry.componentsLabel || fallbackSpell?.components?.join(", ") || "",
        };
      }),
    },
    equipment: {
      gear: equipment.gear ?? [],
      armor: equipment.armor ?? [],
      weapons: equipment.weapons ?? [],
    },
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Dataset request failed: ${response.status} for ${url}`);
  }

  return response.json() as Promise<T>;
}
