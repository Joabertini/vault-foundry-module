import { normalizeLabel } from "./normalize";

export type ArmorCatalogEntry = {
  id: string;
  label: string;
  armorFormula: string;
  grantsShieldBonus?: boolean;
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

const armorAliasMap = new Map<string, string>();

for (const entry of armorCatalog) {
  armorAliasMap.set(normalizeLabel(entry.id), entry.id);
  armorAliasMap.set(normalizeLabel(entry.label), entry.id);

  for (const alias of entry.aliases) {
    armorAliasMap.set(normalizeLabel(alias), entry.id);
  }
}

export function resolveArmorId(value: string): string {
  return armorAliasMap.get(normalizeLabel(value)) ?? normalizeLabel(value).replace(/\s+/g, "-");
}

export function getArmorCatalogEntry(value: string): ArmorCatalogEntry | undefined {
  const resolvedId = resolveArmorId(value);
  return armorCatalog.find((entry) => entry.id === resolvedId);
}
