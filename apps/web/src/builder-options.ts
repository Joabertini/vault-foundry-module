import {
  armorCatalog,
  backgroundCatalog,
  classCatalog,
  featCatalog,
  gearCatalog,
  raceCatalog,
  spellCatalog,
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
  classes: SelectOption[];
  races: SelectOption[];
  backgrounds: Array<SelectOption & { source?: string; grantedFeatIds?: string[] }>;
  feats: SelectOption[];
  spells: {
    cantrips: Array<SelectOption & { level: number }>;
    spells: Array<SelectOption & { level: number }>;
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
  cantrips?: Array<SelectOption & { level: number }>;
  spells?: Array<SelectOption & { level: number }>;
  gear?: SelectOption[];
  armor?: Array<SelectOption & { armorFormula?: string; grantsShieldBonus?: boolean }>;
  weapons?: Array<SelectOption & { damage?: string; damageType?: string; attackType?: string }>;
};

export const fallbackBuilderOptions: BuilderOptionsPayload = {
  source: {
    mode: "curated-local",
    upstream: "5etools-planned-via-bff",
  },
  classes: classCatalog.map((entry) => ({
    id: entry.id,
    label: entry.label,
  })),
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
      .map((entry) => ({ id: entry.id, label: entry.label, level: entry.level })),
    spells: spellCatalog
      .filter((entry) => entry.level > 0)
      .map((entry) => ({ id: entry.id, label: entry.label, level: entry.level })),
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
    fetchJson<DatasetEnvelope<SelectOption>>(classesUrl),
    fetchJson<DatasetEnvelope<SelectOption>>(racesUrl),
    fetchJson<DatasetEnvelope<SelectOption & { source?: string; grantedFeatIds?: string[] }>>(
      backgroundsUrl,
    ),
    fetchJson<DatasetEnvelope<SelectOption>>(featsUrl),
    fetchJson<
      DatasetEnvelope<SelectOption> & {
        cantrips: Array<SelectOption & { level: number }>;
        spells: Array<SelectOption & { level: number }>;
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
    classes: classes.items ?? [],
    races: races.items ?? [],
    backgrounds: backgrounds.items ?? [],
    feats: feats.items ?? [],
    spells: {
      cantrips: spells.cantrips ?? [],
      spells: spells.spells ?? [],
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
