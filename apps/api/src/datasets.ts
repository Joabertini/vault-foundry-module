import {
  armorCatalog,
  backgroundCatalog,
  classCatalog,
  featCatalog,
  raceCatalog,
  weaponCatalog,
} from "@bertinis-vault/data-engine";

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
  };
}
