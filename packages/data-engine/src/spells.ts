import { normalizeLabel, slugifyId } from "./normalize";

export type SpellCatalogEntry = {
  id: string;
  label: string;
  level: number;
  aliases: string[];
};

export const spellCatalog: SpellCatalogEntry[] = [
  { id: "mage-hand", label: "Mage Hand", level: 0, aliases: ["mano de mago"] },
  { id: "prestidigitation", label: "Prestidigitation", level: 0, aliases: ["prestidigitacion"] },
  { id: "ray-of-frost", label: "Ray of Frost", level: 0, aliases: ["rayo de escarcha"] },
  { id: "fire-bolt", label: "Fire Bolt", level: 0, aliases: ["rayo de fuego"] },
  { id: "minor-illusion", label: "Minor Illusion", level: 0, aliases: ["ilusion menor"] },
  { id: "guidance", label: "Guidance", level: 0, aliases: ["guia"] },
  { id: "eldritch-blast", label: "Eldritch Blast", level: 0, aliases: ["estallido sobrenatural"] },
  { id: "sacred-flame", label: "Sacred Flame", level: 0, aliases: ["llama sagrada"] },
  { id: "shield", label: "Shield", level: 1, aliases: ["escudo"] },
  { id: "magic-missile", label: "Magic Missile", level: 1, aliases: ["misil magico"] },
  { id: "cure-wounds", label: "Cure Wounds", level: 1, aliases: ["curar heridas"] },
  { id: "guiding-bolt", label: "Guiding Bolt", level: 1, aliases: ["rayo guiador"] },
  { id: "hex", label: "Hex", level: 1, aliases: ["maldicion"] },
  { id: "burning-hands", label: "Burning Hands", level: 1, aliases: ["manos ardientes"] },
  { id: "misty-step", label: "Misty Step", level: 2, aliases: ["paso brumoso"] },
  { id: "mirror-image", label: "Mirror Image", level: 2, aliases: ["imagen multiple"] },
  { id: "scorching-ray", label: "Scorching Ray", level: 2, aliases: ["rayo abrasador"] },
  { id: "hold-person", label: "Hold Person", level: 2, aliases: ["inmovilizar persona"] },
  { id: "fireball", label: "Fireball", level: 3, aliases: ["bola de fuego"] },
  { id: "counterspell", label: "Counterspell", level: 3, aliases: ["contraconjuro"] },
  { id: "fly", label: "Fly", level: 3, aliases: ["volar"] },
  { id: "revivify", label: "Revivify", level: 3, aliases: ["revivificar"] },
];

const spellAliasMap = new Map<string, string>();

for (const entry of spellCatalog) {
  spellAliasMap.set(normalizeLabel(entry.id), entry.id);
  spellAliasMap.set(normalizeLabel(entry.label), entry.id);

  for (const alias of entry.aliases) {
    spellAliasMap.set(normalizeLabel(alias), entry.id);
  }
}

export function resolveSpellId(value: string): string {
  return spellAliasMap.get(normalizeLabel(value)) ?? slugifyId(value);
}

export function getSpellCatalogEntry(value: string): SpellCatalogEntry | undefined {
  const resolvedId = resolveSpellId(value);
  return spellCatalog.find((entry) => entry.id === resolvedId);
}
