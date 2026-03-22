import {
  armorCatalog,
  backgroundCatalog,
  classCatalog,
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
  equipment: {
    armor: Array<SelectOption & { armorFormula?: string; grantsShieldBonus?: boolean }>;
    weapons: Array<SelectOption & { damage?: string; damageType?: string; attackType?: string }>;
  };
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
  const baseUrl =
    import.meta.env.VITE_BERTINIS_API_URL?.trim() || "http://127.0.0.1:3001";
  const response = await fetch(`${baseUrl}/datasets/builder-options`);

  if (!response.ok) {
    throw new Error(`Builder options request failed: ${response.status}`);
  }

  return response.json() as Promise<BuilderOptionsPayload>;
}
