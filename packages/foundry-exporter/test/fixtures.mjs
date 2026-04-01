export function makeBaseCharacterBuild() {
  return {
    meta: {
      rulesVersion: "5e-2014",
      sourceProfile: "vault-v1",
      createdAt: "2026-03-22T00:00:00.000Z",
      updatedAt: "2026-03-22T00:00:00.000Z",
    },
    identity: {
      characterName: "Seraphina Vale",
      alignment: "Neutral Good",
      biography: {
        trait: "Always writes everything down.",
        ideal: "Knowledge before fear.",
      },
    },
    ancestry: {
      raceId: "human",
    },
    classing: {
      classes: [{ classId: "wizard", level: 3 }],
    },
    background: {
      backgroundId: "sage",
      grantedFeatIds: ["magic-initiate"],
    },
    abilities: {
      generationMethod: "manual",
      base: { str: 8, dex: 14, con: 13, int: 17, wis: 12, cha: 10 },
      final: { str: 8, dex: 14, con: 13, int: 17, wis: 12, cha: 10 },
    },
    choices: {
      feats: ["alert"],
      proficiencies: ["Arcana", "Investigation", "Language: Elvish", "Tool: Thieves' Tools"],
      spells: ["Nv0: Mage Hand", "Nv1: Shield"],
      equipment: ["quarterstaff", "mage-armor", "spellbook", "component-pouch"],
      features: ["Arcane Recovery"],
      normalized: {
        feats: ["alert"],
        proficiencies: [
          { kind: "skill", label: "Arcana" },
          { kind: "skill", label: "Investigation" },
          { kind: "language", label: "Elvish" },
          { kind: "tool", label: "Thieves' Tools" },
        ],
        spells: [
          { label: "Mage Hand", level: 0 },
          { label: "Shield", level: 1 },
        ],
        equipment: [
          { itemId: "quarterstaff", label: "Quarterstaff", quantity: 1, category: "weapon" },
          { itemId: "mage-armor", label: "Mage Armor", quantity: 1, category: "armor" },
          { label: "spellbook", quantity: 1, category: "gear" },
          { label: "component-pouch", quantity: 1, category: "gear" },
        ],
        features: [{ label: "Arcane Recovery", source: "class" }],
      },
    },
    derived: {
      proficiencyBonus: 2,
      hp: 14,
      ac: 15,
      spellcasting: {
        ability: "int",
        attackBonus: 5,
        saveDC: 13,
        slots: {
          spell1: 4,
          spell2: 2,
          spell3: 0,
          spell4: 0,
          spell5: 0,
          spell6: 0,
          spell7: 0,
          spell8: 0,
          spell9: 0,
        },
      },
    },
  };
}

export function makeMartialValidationBuild() {
  const build = makeBaseCharacterBuild();
  build.identity.characterName = "Brom Ironwall";
  build.ancestry.raceId = "dwarf";
  build.classing.classes = [{ classId: "fighter", level: 5 }];
  build.background.backgroundId = "soldier";
  build.background.grantedFeatIds = [];
  build.abilities.base = { str: 18, dex: 12, con: 16, int: 10, wis: 12, cha: 8 };
  build.abilities.final = { str: 18, dex: 12, con: 16, int: 10, wis: 12, cha: 8 };
  build.choices.feats = ["tough"];
  build.choices.proficiencies = ["Athletics", "Intimidation"];
  build.choices.spells = [];
  build.choices.equipment = ["longsword", "shield", "chain-mail", "explorers-pack"];
  build.choices.features = ["Second Wind", "Action Surge"];
  build.choices.normalized = {
    feats: ["tough"],
    proficiencies: [
      { kind: "skill", label: "Athletics" },
      { kind: "skill", label: "Intimidation" },
    ],
    spells: [],
    equipment: [
      { itemId: "longsword", label: "Longsword", quantity: 1, category: "weapon" },
      { itemId: "shield", label: "Shield", quantity: 1, category: "shield" },
      { itemId: "chain-mail", label: "Chain Mail", quantity: 1, category: "armor" },
      { itemId: "explorers-pack", label: "Explorer's Pack", quantity: 1, category: "gear" },
    ],
    features: [
      { label: "Second Wind", source: "class" },
      { label: "Action Surge", source: "class" },
    ],
  };
  build.derived = {
    proficiencyBonus: 3,
    hp: 44,
    ac: 18,
    spellcasting: undefined,
  };
  return build;
}

export function makePreparedCasterValidationBuild() {
  const build = makeBaseCharacterBuild();
  build.identity.characterName = "Ilyra Dawn";
  build.ancestry.raceId = "aasimar";
  build.classing.classes = [{ classId: "cleric", level: 5 }];
  build.background.backgroundId = "acolyte";
  build.background.grantedFeatIds = [];
  build.abilities.base = { str: 10, dex: 12, con: 14, int: 8, wis: 17, cha: 13 };
  build.abilities.final = { str: 10, dex: 12, con: 14, int: 8, wis: 17, cha: 13 };
  build.choices.feats = [];
  build.choices.proficiencies = ["Insight", "Religion", "Language: Celestial"];
  build.choices.spells = ["Nv0: Sacred Flame", "Nv3: Spirit Guardians"];
  build.choices.equipment = ["mace", "shield", "chain-mail", "holy-symbol"];
  build.choices.features = ["Channel Divinity"];
  build.choices.normalized = {
    feats: [],
    proficiencies: [
      { kind: "skill", label: "Insight" },
      { kind: "skill", label: "Religion" },
      { kind: "language", label: "Celestial" },
    ],
    spells: [
      { label: "Sacred Flame", level: 0 },
      { label: "Spirit Guardians", level: 3 },
    ],
    equipment: [
      { itemId: "mace", label: "Mace", quantity: 1, category: "weapon" },
      { itemId: "shield", label: "Shield", quantity: 1, category: "shield" },
      { itemId: "chain-mail", label: "Chain Mail", quantity: 1, category: "armor" },
      { label: "holy-symbol", quantity: 1, category: "gear" },
    ],
    features: [{ label: "Channel Divinity", source: "class" }],
  };
  build.derived = {
    proficiencyBonus: 3,
    hp: 33,
    ac: 18,
    spellcasting: {
      ability: "wis",
      attackBonus: 6,
      saveDC: 14,
      slots: {
        spell1: 4,
        spell2: 3,
        spell3: 2,
        spell4: 0,
        spell5: 0,
        spell6: 0,
        spell7: 0,
        spell8: 0,
        spell9: 0,
      },
    },
  };
  return build;
}

export function makePactCasterValidationBuild() {
  const build = makeBaseCharacterBuild();
  build.identity.characterName = "Nox Vey";
  build.classing.classes = [{ classId: "warlock", level: 5 }];
  build.background.backgroundId = "charlatan";
  build.background.grantedFeatIds = [];
  build.abilities.base = { str: 8, dex: 14, con: 14, int: 10, wis: 12, cha: 18 };
  build.abilities.final = { str: 8, dex: 14, con: 14, int: 10, wis: 12, cha: 18 };
  build.choices.feats = [];
  build.choices.proficiencies = ["Deception", "Arcana"];
  build.choices.spells = ["Nv0: Eldritch Blast", "Nv3: Hunger of Hadar"];
  build.choices.equipment = ["dagger", "leather", "arcane-focus"];
  build.choices.features = ["Pact Magic"];
  build.choices.normalized = {
    feats: [],
    proficiencies: [
      { kind: "skill", label: "Deception" },
      { kind: "skill", label: "Arcana" },
    ],
    spells: [
      { label: "Eldritch Blast", level: 0 },
      { label: "Hunger of Hadar", level: 3 },
    ],
    equipment: [
      { itemId: "dagger", label: "Dagger", quantity: 1, category: "weapon" },
      { itemId: "leather", label: "Leather Armor", quantity: 1, category: "armor" },
      { label: "arcane-focus", quantity: 1, category: "gear" },
    ],
    features: [{ label: "Pact Magic", source: "class" }],
  };
  build.derived = {
    proficiencyBonus: 3,
    hp: 38,
    ac: 14,
    spellcasting: {
      ability: "cha",
      attackBonus: 7,
      saveDC: 15,
      slots: {
        spell1: 0,
        spell2: 0,
        spell3: 2,
        spell4: 0,
        spell5: 0,
        spell6: 0,
        spell7: 0,
        spell8: 0,
        spell9: 0,
      },
    },
  };
  return build;
}

export function makeBackgroundFeatValidationBuild() {
  const build = makeBaseCharacterBuild();
  build.identity.characterName = "Lyra Jetstream";
  build.background.backgroundId = "wildspacer";
  build.background.grantedFeatIds = ["tough"];
  build.choices.feats = ["alert"];
  build.choices.normalized.feats = ["alert"];
  return build;
}

export function makeWizardSpellbookValidationBuild() {
  const build = makeBaseCharacterBuild();
  build.identity.characterName = "Mira Quill";
  build.classing.classes = [{ classId: "wizard", level: 5 }];
  build.background.backgroundId = "sage";
  build.background.grantedFeatIds = ["magic-initiate"];
  build.abilities.base = { str: 8, dex: 14, con: 14, int: 18, wis: 12, cha: 10 };
  build.abilities.final = { str: 8, dex: 14, con: 14, int: 18, wis: 12, cha: 10 };
  build.choices.spells = ["Nv0: Mage Hand", "Nv1: Shield", "Nv3: Fireball"];
  build.choices.equipment = ["quarterstaff", "spellbook", "component-pouch"];
  build.choices.features = ["Arcane Recovery"];
  build.choices.normalized.spells = [
    { spellId: "mage-hand", label: "Mage Hand", level: 0 },
    { spellId: "shield", label: "Shield", level: 1 },
    { spellId: "fireball", label: "Fireball", level: 3 },
  ];
  build.choices.normalized.equipment = [
    { itemId: "quarterstaff", label: "Quarterstaff", quantity: 1, category: "weapon" },
    { label: "spellbook", quantity: 1, category: "gear" },
    { label: "component-pouch", quantity: 1, category: "gear" },
  ];
  build.derived = {
    proficiencyBonus: 3,
    hp: 32,
    ac: 14,
    spellcasting: {
      ability: "int",
      attackBonus: 7,
      saveDC: 15,
      slots: {
        spell1: 4,
        spell2: 3,
        spell3: 2,
        spell4: 0,
        spell5: 0,
        spell6: 0,
        spell7: 0,
        spell8: 0,
        spell9: 0,
      },
    },
  };
  return build;
}

export function makeWarningOnlyValidationBuild() {
  const build = makeBaseCharacterBuild();
  build.choices.normalized.spells = [{ spellId: "fireball", label: "Shield", level: 1 }];
  build.choices.normalized.equipment = [
    { itemId: "shield", label: "Shield", quantity: 1, category: "armor" },
  ];
  return build;
}

export function makeBlockedValidationBuild() {
  const build = makeBaseCharacterBuild();
  build.classing.classes[0].classId = "unknown-class";
  return build;
}

export const manualValidationFixtures = [
  { id: "martial-fighter-5", label: "Martial with armor and shield", build: makeMartialValidationBuild },
  { id: "prepared-cleric-5", label: "Prepared caster cleric", build: makePreparedCasterValidationBuild },
  { id: "pact-warlock-5", label: "Pact caster warlock", build: makePactCasterValidationBuild },
  { id: "background-feat", label: "Background feat plus chosen feat", build: makeBackgroundFeatValidationBuild },
  { id: "wizard-spellbook-5", label: "Wizard spellbook", build: makeWizardSpellbookValidationBuild },
  { id: "warning-only", label: "Warning-only validation case", build: makeWarningOnlyValidationBuild },
  { id: "blocked-invalid-class", label: "Blocked invalid class case", build: makeBlockedValidationBuild },
];
