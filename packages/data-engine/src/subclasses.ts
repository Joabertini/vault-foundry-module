import { normalizeLabel } from "./normalize.js";

export type SubclassCatalogEntry = {
  id: string;
  classId: string;
  label: string;
  aliases: string[];
};

export const subclassCatalog: SubclassCatalogEntry[] = [
  { id: "path-of-the-berserker", classId: "barbarian", label: "Path of the Berserker", aliases: [] },
  { id: "path-of-the-totem-warrior", classId: "barbarian", label: "Path of the Totem Warrior", aliases: [] },
  { id: "path-of-the-ancestral-guardian", classId: "barbarian", label: "Path of the Ancestral Guardian", aliases: [] },
  { id: "path-of-the-battlerager", classId: "barbarian", label: "Path of the Battlerager", aliases: [] },
  { id: "path-of-the-beast", classId: "barbarian", label: "Path of the Beast", aliases: [] },
  { id: "path-of-the-storm-herald", classId: "barbarian", label: "Path of the Storm Herald", aliases: [] },
  { id: "path-of-the-zealot", classId: "barbarian", label: "Path of the Zealot", aliases: [] },
  { id: "path-of-wild-magic", classId: "barbarian", label: "Path of Wild Magic", aliases: [] },
  { id: "path-of-the-giant", classId: "barbarian", label: "Path of the Giant", aliases: [] },
  { id: "college-of-lore", classId: "bard", label: "College of Lore", aliases: [] },
  { id: "college-of-valor", classId: "bard", label: "College of Valor", aliases: [] },
  { id: "college-of-creation", classId: "bard", label: "College of Creation", aliases: [] },
  { id: "college-of-eloquence", classId: "bard", label: "College of Eloquence", aliases: [] },
  { id: "college-of-glamour", classId: "bard", label: "College of Glamour", aliases: [] },
  { id: "college-of-swords", classId: "bard", label: "College of Swords", aliases: [] },
  { id: "college-of-whispers", classId: "bard", label: "College of Whispers", aliases: [] },
  { id: "college-of-spirits", classId: "bard", label: "College of Spirits", aliases: [] },
  { id: "life-domain", classId: "cleric", label: "Life Domain", aliases: [] },
  { id: "light-domain", classId: "cleric", label: "Light Domain", aliases: [] },
  { id: "trickery-domain", classId: "cleric", label: "Trickery Domain", aliases: [] },
  { id: "knowledge-domain", classId: "cleric", label: "Knowledge Domain", aliases: [] },
  { id: "nature-domain", classId: "cleric", label: "Nature Domain", aliases: [] },
  { id: "tempest-domain", classId: "cleric", label: "Tempest Domain", aliases: [] },
  { id: "war-domain", classId: "cleric", label: "War Domain", aliases: [] },
  { id: "death-domain", classId: "cleric", label: "Death Domain", aliases: [] },
  { id: "arcana-domain", classId: "cleric", label: "Arcana Domain", aliases: [] },
  { id: "forge-domain", classId: "cleric", label: "Forge Domain", aliases: [] },
  { id: "grave-domain", classId: "cleric", label: "Grave Domain", aliases: [] },
  { id: "order-domain", classId: "cleric", label: "Order Domain", aliases: [] },
  { id: "peace-domain", classId: "cleric", label: "Peace Domain", aliases: [] },
  { id: "twilight-domain", classId: "cleric", label: "Twilight Domain", aliases: [] },
  { id: "circle-of-the-land", classId: "druid", label: "Circle of the Land", aliases: [] },
  { id: "circle-of-the-moon", classId: "druid", label: "Circle of the Moon", aliases: [] },
  { id: "circle-of-dreams", classId: "druid", label: "Circle of Dreams", aliases: [] },
  { id: "circle-of-the-shepherd", classId: "druid", label: "Circle of the Shepherd", aliases: [] },
  { id: "circle-of-spores", classId: "druid", label: "Circle of Spores", aliases: [] },
  { id: "circle-of-stars", classId: "druid", label: "Circle of Stars", aliases: [] },
  { id: "circle-of-wildfire", classId: "druid", label: "Circle of Wildfire", aliases: [] },
  { id: "battle-master", classId: "fighter", label: "Battle Master", aliases: [] },
  { id: "champion", classId: "fighter", label: "Champion", aliases: [] },
  { id: "eldritch-knight", classId: "fighter", label: "Eldritch Knight", aliases: [] },
  { id: "arcane-archer", classId: "fighter", label: "Arcane Archer", aliases: [] },
  { id: "cavalier", classId: "fighter", label: "Cavalier", aliases: [] },
  { id: "echo-knight", classId: "fighter", label: "Echo Knight", aliases: [] },
  { id: "psi-warrior", classId: "fighter", label: "Psi Warrior", aliases: [] },
  { id: "rune-knight", classId: "fighter", label: "Rune Knight", aliases: [] },
  { id: "samurai", classId: "fighter", label: "Samurai", aliases: [] },
  { id: "purple-dragon-knight", classId: "fighter", label: "Purple Dragon Knight", aliases: [] },
  { id: "way-of-the-open-hand", classId: "monk", label: "Way of the Open Hand", aliases: [] },
  { id: "way-of-shadow", classId: "monk", label: "Way of Shadow", aliases: [] },
  { id: "way-of-the-four-elements", classId: "monk", label: "Way of the Four Elements", aliases: [] },
  { id: "way-of-the-sun-soul", classId: "monk", label: "Way of the Sun Soul", aliases: [] },
  { id: "way-of-the-kensei", classId: "monk", label: "Way of the Kensei", aliases: [] },
  { id: "way-of-the-drunken-master", classId: "monk", label: "Way of the Drunken Master", aliases: [] },
  { id: "way-of-the-astral-self", classId: "monk", label: "Way of the Astral Self", aliases: [] },
  { id: "way-of-mercy", classId: "monk", label: "Way of Mercy", aliases: [] },
  { id: "way-of-the-ascendant-dragon", classId: "monk", label: "Way of the Ascendant Dragon", aliases: [] },
  { id: "oath-of-devotion", classId: "paladin", label: "Oath of Devotion", aliases: [] },
  { id: "oath-of-the-ancients", classId: "paladin", label: "Oath of the Ancients", aliases: [] },
  { id: "oath-of-vengeance", classId: "paladin", label: "Oath of Vengeance", aliases: [] },
  { id: "oath-of-conquest", classId: "paladin", label: "Oath of Conquest", aliases: [] },
  { id: "oath-of-redemption", classId: "paladin", label: "Oath of Redemption", aliases: [] },
  { id: "oath-of-glory", classId: "paladin", label: "Oath of Glory", aliases: [] },
  { id: "oath-of-the-watchers", classId: "paladin", label: "Oath of the Watchers", aliases: [] },
  { id: "oathbreaker", classId: "paladin", label: "Oathbreaker", aliases: [] },
  { id: "beast-master", classId: "ranger", label: "Beast Master", aliases: [] },
  { id: "hunter", classId: "ranger", label: "Hunter", aliases: [] },
  { id: "gloom-stalker", classId: "ranger", label: "Gloom Stalker", aliases: [] },
  { id: "horizon-walker", classId: "ranger", label: "Horizon Walker", aliases: [] },
  { id: "monster-slayer", classId: "ranger", label: "Monster Slayer", aliases: [] },
  { id: "fey-wanderer", classId: "ranger", label: "Fey Wanderer", aliases: [] },
  { id: "swarmkeeper", classId: "ranger", label: "Swarmkeeper", aliases: [] },
  { id: "drakewarden", classId: "ranger", label: "Drakewarden", aliases: [] },
  { id: "thief", classId: "rogue", label: "Thief", aliases: [] },
  { id: "assassin", classId: "rogue", label: "Assassin", aliases: [] },
  { id: "arcane-trickster", classId: "rogue", label: "Arcane Trickster", aliases: [] },
  { id: "inquisitive", classId: "rogue", label: "Inquisitive", aliases: [] },
  { id: "mastermind", classId: "rogue", label: "Mastermind", aliases: [] },
  { id: "scout", classId: "rogue", label: "Scout", aliases: [] },
  { id: "swashbuckler", classId: "rogue", label: "Swashbuckler", aliases: [] },
  { id: "phantom", classId: "rogue", label: "Phantom", aliases: [] },
  { id: "soulknife", classId: "rogue", label: "Soulknife", aliases: [] },
  { id: "draconic-bloodline", classId: "sorcerer", label: "Draconic Bloodline", aliases: [] },
  { id: "wild-magic", classId: "sorcerer", label: "Wild Magic", aliases: [] },
  { id: "storm-sorcery", classId: "sorcerer", label: "Storm Sorcery", aliases: [] },
  { id: "divine-soul", classId: "sorcerer", label: "Divine Soul", aliases: [] },
  { id: "shadow-magic", classId: "sorcerer", label: "Shadow Magic", aliases: [] },
  { id: "aberrant-mind", classId: "sorcerer", label: "Aberrant Mind", aliases: [] },
  { id: "clockwork-soul", classId: "sorcerer", label: "Clockwork Soul", aliases: [] },
  { id: "lunar-sorcery", classId: "sorcerer", label: "Lunar Sorcery", aliases: [] },
  { id: "the-archfey", classId: "warlock", label: "The Archfey", aliases: [] },
  { id: "the-fiend", classId: "warlock", label: "The Fiend", aliases: [] },
  { id: "the-great-old-one", classId: "warlock", label: "The Great Old One", aliases: [] },
  { id: "the-celestial", classId: "warlock", label: "The Celestial", aliases: [] },
  { id: "the-hexblade", classId: "warlock", label: "The Hexblade", aliases: [] },
  { id: "the-fathomless", classId: "warlock", label: "The Fathomless", aliases: [] },
  { id: "the-genie", classId: "warlock", label: "The Genie", aliases: [] },
  { id: "the-undead", classId: "warlock", label: "The Undead", aliases: [] },
  { id: "the-undying", classId: "warlock", label: "The Undying", aliases: [] },
  { id: "school-of-abjuration", classId: "wizard", label: "School of Abjuration", aliases: [] },
  { id: "school-of-conjuration", classId: "wizard", label: "School of Conjuration", aliases: [] },
  { id: "school-of-divination", classId: "wizard", label: "School of Divination", aliases: [] },
  { id: "school-of-enchantment", classId: "wizard", label: "School of Enchantment", aliases: [] },
  { id: "school-of-evocation", classId: "wizard", label: "School of Evocation", aliases: [] },
  { id: "school-of-illusion", classId: "wizard", label: "School of Illusion", aliases: [] },
  { id: "school-of-necromancy", classId: "wizard", label: "School of Necromancy", aliases: [] },
  { id: "school-of-transmutation", classId: "wizard", label: "School of Transmutation", aliases: [] },
  { id: "bladesinging", classId: "wizard", label: "Bladesinging", aliases: [] },
  { id: "order-of-scribes", classId: "wizard", label: "Order of Scribes", aliases: [] },
  { id: "chronurgy-magic", classId: "wizard", label: "Chronurgy Magic", aliases: [] },
  { id: "graviturgy-magic", classId: "wizard", label: "Graviturgy Magic", aliases: [] },
  { id: "alchemist", classId: "artificer", label: "Alchemist", aliases: [] },
  { id: "armorer", classId: "artificer", label: "Armorer", aliases: [] },
  { id: "artillerist", classId: "artificer", label: "Artillerist", aliases: [] },
  { id: "battle-smith", classId: "artificer", label: "Battle Smith", aliases: [] },
];

const subclassAliasMap = new Map<string, string>();

for (const entry of subclassCatalog) {
  subclassAliasMap.set(normalizeLabel(entry.id), entry.id);
  subclassAliasMap.set(normalizeLabel(entry.label), entry.id);

  for (const alias of entry.aliases) {
    subclassAliasMap.set(normalizeLabel(alias), entry.id);
  }
}

export function resolveSubclassId(value: string): string {
  return subclassAliasMap.get(normalizeLabel(value)) ?? normalizeLabel(value).replace(/\s+/g, "-");
}

export function getSubclassCatalogEntry(value: string): SubclassCatalogEntry | undefined {
  const resolvedId = resolveSubclassId(value);
  return subclassCatalog.find((entry) => entry.id === resolvedId);
}

export function getSubclassesForClass(classId: string): SubclassCatalogEntry[] {
  return subclassCatalog.filter((entry) => entry.classId === classId);
}
