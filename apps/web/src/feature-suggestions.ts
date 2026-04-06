import type { BuilderState } from "./builder";

const classFeatureSuggestions: Record<string, string[]> = {
  barbarian: ["Rage", "Unarmored Defense", "Danger Sense"],
  bard: ["Bardic Inspiration", "Jack of All Trades", "Song of Rest"],
  cleric: ["Spellcasting", "Channel Divinity", "Divine Domain"],
  druid: ["Wild Shape", "Druidic", "Spellcasting"],
  fighter: ["Second Wind", "Action Surge", "Fighting Style"],
  monk: ["Martial Arts", "Ki", "Unarmored Movement"],
  paladin: ["Divine Sense", "Lay on Hands", "Fighting Style"],
  ranger: ["Favored Enemy", "Natural Explorer", "Fighting Style"],
  rogue: ["Sneak Attack", "Cunning Action", "Expertise"],
  sorcerer: ["Font of Magic", "Metamagic", "Sorcerous Origin"],
  warlock: ["Pact Magic", "Eldritch Invocations", "Otherworldly Patron"],
  wizard: ["Arcane Recovery", "Spellcasting", "Arcane Tradition"],
  artificer: ["Magical Tinkering", "Infuse Item", "Tool Expertise"],
};

const subclassFeatureSuggestions: Record<string, string[]> = {
  "school-of-evocation": ["Evocation Savant", "Sculpt Spells"],
  "school-of-abjuration": ["Abjuration Savant", "Arcane Ward"],
  "life-domain": ["Disciple of Life", "Preserve Life"],
  "light-domain": ["Warding Flare", "Radiance of the Dawn"],
  "trickery-domain": ["Blessing of the Trickster", "Invoke Duplicity"],
  "battle-master": ["Combat Superiority", "Student of War"],
  "eldritch-knight": ["Weapon Bond", "War Magic"],
  "champion": ["Improved Critical", "Remarkable Athlete"],
  "thief": ["Fast Hands", "Second-Story Work"],
  "arcane-trickster": ["Mage Hand Legerdemain", "Versatile Trickster"],
  "beast-master": ["Ranger's Companion", "Exceptional Training"],
  "gloom-stalker": ["Dread Ambusher", "Umbral Sight"],
  "oath-of-devotion": ["Sacred Weapon", "Turn the Unholy"],
  "oath-of-vengeance": ["Abjure Enemy", "Vow of Enmity"],
  "draconic-bloodline": ["Draconic Resilience", "Elemental Affinity"],
  "wild-magic": ["Tides of Chaos", "Bend Luck"],
  "the-hexblade": ["Hexblade's Curse", "Hex Warrior"],
  "the-fiend": ["Dark One's Blessing", "Dark One's Own Luck"],
  "alchemist": ["Experimental Elixir", "Alchemical Savant"],
  "battle-smith": ["Battle Ready", "Steel Defender"],
};

const backgroundFeatureSuggestions: Record<string, string[]> = {
  sage: ["Researcher"],
  soldier: ["Military Rank"],
  acolyte: ["Shelter of the Faithful"],
  criminal: ["Criminal Contact"],
  noble: ["Position of Privilege"],
  hermit: ["Discovery"],
};

const featFeatureSuggestions: Record<string, string[]> = {
  "magic-initiate": ["Bonus Cantrip Access", "1st-level Spell Access"],
  "war-caster": ["Advantage on Concentration Saves", "Somatic Components with Weapons"],
  alert: ["Initiative Bonus", "Cannot Be Surprised"],
  lucky: ["Luck Points"],
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function getFeatureSuggestions(state: BuilderState) {
  return unique([
    ...(classFeatureSuggestions[state.classId] ?? []),
    ...(subclassFeatureSuggestions[state.subclassId] ?? []),
    ...(backgroundFeatureSuggestions[state.backgroundId] ?? []),
    ...(featFeatureSuggestions[state.featId] ?? []),
  ]);
}
