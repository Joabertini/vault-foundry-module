import {
  armorCatalog,
  backgroundCatalog,
  classCatalog,
  featCatalog,
  raceCatalog,
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
  equipment: {
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
  equipment: {
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
  const [meta, classes, races, backgrounds, feats, equipment] = await Promise.all([
    fetchJson<DatasetEnvelope<SelectOption>>(`${baseUrl}/datasets/meta`),
    fetchJson<DatasetEnvelope<SelectOption>>(`${baseUrl}/datasets/classes`),
    fetchJson<DatasetEnvelope<SelectOption>>(`${baseUrl}/datasets/races`),
    fetchJson<DatasetEnvelope<SelectOption & { source?: string; grantedFeatIds?: string[] }>>(
      `${baseUrl}/datasets/backgrounds`,
    ),
    fetchJson<DatasetEnvelope<SelectOption>>(`${baseUrl}/datasets/feats`),
    fetchJson<
      DatasetEnvelope<SelectOption> & {
        armor: Array<SelectOption & { armorFormula?: string; grantsShieldBonus?: boolean }>;
        weapons: Array<SelectOption & { damage?: string; damageType?: string; attackType?: string }>;
      }
    >(`${baseUrl}/datasets/equipment`),
  ]);

  return {
    source: meta.source,
    classes: classes.items ?? [],
    races: races.items ?? [],
    backgrounds: backgrounds.items ?? [],
    feats: feats.items ?? [],
    equipment: {
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
