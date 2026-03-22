import { normalizeLabel } from "./normalize";

export type ArmorCatalogEntry = {
  id: string;
  label: string;
  armorFormula: string;
  grantsShieldBonus?: boolean;
  aliases: string[];
};

export type WeaponCatalogEntry = {
  id: string;
  label: string;
  itemType: string;
  damage: string;
  damageType: string;
  attackType: "melee" | "ranged";
  aliases: string[];
};

export type GearCatalogEntry = {
  id: string;
  label: string;
  aliases: string[];
};

export const armorCatalog: ArmorCatalogEntry[] = [
  {
    id: "unarmored",
    label: "Unarmored",
    armorFormula: "10+DEX",
    aliases: ["sin armadura", "unarmored"],
  },
  {
    id: "mage-armor",
    label: "Mage Armor",
    armorFormula: "13+DEX",
    aliases: ["mage armor", "armadura de mago"],
  },
  {
    id: "leather",
    label: "Leather Armor",
    armorFormula: "11+DEX",
    aliases: ["leather", "leather armor", "armadura de cuero"],
  },
  {
    id: "chain-mail",
    label: "Chain Mail",
    armorFormula: "16",
    aliases: ["chain-mail", "chain mail", "cota de malla"],
  },
  {
    id: "shield",
    label: "Shield",
    armorFormula: "10+DEX",
    grantsShieldBonus: true,
    aliases: ["shield", "escudo", "si (+2 ca)"],
  },
];

export const weaponCatalog: WeaponCatalogEntry[] = [
  {
    id: "dagger",
    label: "Dagger",
    itemType: "simpleM",
    damage: "1d4",
    damageType: "piercing",
    attackType: "melee",
    aliases: ["dagger", "daga"],
  },
  {
    id: "mace",
    label: "Mace",
    itemType: "simpleM",
    damage: "1d6",
    damageType: "bludgeoning",
    attackType: "melee",
    aliases: ["mace", "maza"],
  },
  {
    id: "quarterstaff",
    label: "Quarterstaff",
    itemType: "simpleM",
    damage: "1d6",
    damageType: "bludgeoning",
    attackType: "melee",
    aliases: ["quarterstaff", "baston", "bastón", "vara"],
  },
  {
    id: "longsword",
    label: "Longsword",
    itemType: "martialM",
    damage: "1d8",
    damageType: "slashing",
    attackType: "melee",
    aliases: ["longsword", "espada larga"],
  },
  {
    id: "shortbow",
    label: "Shortbow",
    itemType: "simpleR",
    damage: "1d6",
    damageType: "piercing",
    attackType: "ranged",
    aliases: ["shortbow", "arco corto"],
  },
];

export const gearCatalog: GearCatalogEntry[] = [
  { id: "spellbook", label: "Spellbook", aliases: ["grimorio", "libro de conjuros"] },
  { id: "component-pouch", label: "Component Pouch", aliases: ["bolsa de componentes"] },
  { id: "arcane-focus", label: "Arcane Focus", aliases: ["foco arcano"] },
  { id: "holy-symbol", label: "Holy Symbol", aliases: ["simbolo sagrado"] },
  { id: "thieves-tools", label: "Thieves' Tools", aliases: ["herramientas de ladron"] },
  { id: "explorers-pack", label: "Explorer's Pack", aliases: ["mochila de explorador"] },
  { id: "dungeoneers-pack", label: "Dungeoneer's Pack", aliases: ["mochila de dungeonero"] },
  { id: "rope-hempen", label: "Hempen Rope", aliases: ["cuerda de canamo", "cuerda"] },
  { id: "torch", label: "Torch", aliases: ["antorcha"] },
  { id: "rations", label: "Rations", aliases: ["raciones"] },
  { id: "waterskin", label: "Waterskin", aliases: ["odre"] },
];

const armorAliasMap = new Map<string, string>();
const weaponAliasMap = new Map<string, string>();
const gearAliasMap = new Map<string, string>();

for (const entry of armorCatalog) {
  armorAliasMap.set(normalizeLabel(entry.id), entry.id);
  armorAliasMap.set(normalizeLabel(entry.label), entry.id);

  for (const alias of entry.aliases) {
    armorAliasMap.set(normalizeLabel(alias), entry.id);
  }
}

for (const entry of weaponCatalog) {
  weaponAliasMap.set(normalizeLabel(entry.id), entry.id);
  weaponAliasMap.set(normalizeLabel(entry.label), entry.id);

  for (const alias of entry.aliases) {
    weaponAliasMap.set(normalizeLabel(alias), entry.id);
  }
}

for (const entry of gearCatalog) {
  gearAliasMap.set(normalizeLabel(entry.id), entry.id);
  gearAliasMap.set(normalizeLabel(entry.label), entry.id);

  for (const alias of entry.aliases) {
    gearAliasMap.set(normalizeLabel(alias), entry.id);
  }
}

export function resolveArmorId(value: string): string {
  return armorAliasMap.get(normalizeLabel(value)) ?? normalizeLabel(value).replace(/\s+/g, "-");
}

export function getArmorCatalogEntry(value: string): ArmorCatalogEntry | undefined {
  const resolvedId = resolveArmorId(value);
  return armorCatalog.find((entry) => entry.id === resolvedId);
}

export function resolveWeaponId(value: string): string {
  return weaponAliasMap.get(normalizeLabel(value)) ?? normalizeLabel(value).replace(/\s+/g, "-");
}

export function getWeaponCatalogEntry(value: string): WeaponCatalogEntry | undefined {
  const resolvedId = resolveWeaponId(value);
  return weaponCatalog.find((entry) => entry.id === resolvedId);
}

export function findWeaponCatalogEntry(value: string): WeaponCatalogEntry | undefined {
  const normalized = normalizeLabel(value);

  return weaponCatalog.find((entry) =>
    [entry.id, entry.label, ...entry.aliases].some((candidate) =>
      normalized.includes(normalizeLabel(candidate)),
    ),
  );
}

export function resolveGearId(value: string): string {
  return gearAliasMap.get(normalizeLabel(value)) ?? normalizeLabel(value).replace(/\s+/g, "-");
}

export function getGearCatalogEntry(value: string): GearCatalogEntry | undefined {
  const resolvedId = resolveGearId(value);
  return gearCatalog.find((entry) => entry.id === resolvedId);
}
