import {
  armorCatalog,
  backgroundCatalog,
  classCatalog,
  raceCatalog,
  weaponCatalog,
} from "@bertinis-vault/data-engine";

export function buildBuilderOptionsPayload() {
  return {
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
}
