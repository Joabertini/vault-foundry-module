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
    ...(backgroundFeatureSuggestions[state.backgroundId] ?? []),
    ...(featFeatureSuggestions[state.featId] ?? []),
  ]);
}
