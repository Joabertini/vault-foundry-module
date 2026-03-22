import {
  type CharacterBuild,
  type FoundryActorPayload,
  foundryActorPayloadSchema,
} from "@bertinis-vault/contracts";
import {
  abilityModifierMap,
  getHitDieForClass,
  getSpellAbilityForClass,
  getSpellProgressionForClass,
  normalizeClassId,
} from "@bertinis-vault/domain";

type FoundryItem = Record<string, unknown>;

function makeId(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 16 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s/-]/g, "")
    .trim()
    .replace(/[\s/]+/g, "-");
}

function makeStats() {
  return {
    compendiumSource: null,
    duplicateSource: null,
    exportSource: null,
    coreVersion: "13.351",
    systemId: "dnd5e",
    systemVersion: "5.2.5",
    createdTime: null,
    modifiedTime: null,
    lastModifiedBy: null,
  };
}

function buildFoundryAbilities(character: CharacterBuild) {
  const modifiers = abilityModifierMap(character.abilities.final);

  return {
    str: makeAbility(character.abilities.final.str, modifiers.str),
    dex: makeAbility(character.abilities.final.dex, modifiers.dex),
    con: makeAbility(character.abilities.final.con, modifiers.con),
    int: makeAbility(character.abilities.final.int, modifiers.int),
    wis: makeAbility(character.abilities.final.wis, modifiers.wis),
    cha: makeAbility(character.abilities.final.cha, modifiers.cha),
  };
}

function makeAbility(value: number, modifier: number) {
  return {
    value,
    mod: modifier,
    proficient: 0,
    bonuses: { check: "", save: "" },
  };
}

function buildClassItems(character: CharacterBuild): FoundryItem[] {
  return character.classing.classes.map((entry) => {
    const classId = normalizeClassId(entry.classId);
    const spellAbility = getSpellAbilityForClass(classId) ?? "";
    const progression = getSpellProgressionForClass(classId);
    const hitDie = getHitDieForClass(classId);

    return {
      _id: makeId(),
      name: entry.classId,
      type: "class",
      img: "systems/dnd5e/icons/svg/items/class.svg",
      system: {
        identifier: slugify(entry.classId),
        description: {
          value: `<p>${entry.classId}${entry.subclassId ? ` - ${entry.subclassId}` : ""}</p>`,
          chat: "",
        },
        source: { custom: "", book: "PHB'14", page: "", license: "", rules: "2014", revision: 1 },
        levels: entry.level,
        hd: { denomination: `d${hitDie}`, spent: 0, additional: "" },
        spellcasting: { progression, ability: spellAbility, preparation: {} },
        primaryAbility: { value: [spellAbility || "str"], all: false },
        wealth: "",
        advancement: [],
        startingEquipment: [],
        properties: [],
      },
      flags: {},
      effects: [],
      _stats: makeStats(),
      folder: null,
      sort: 0,
      ownership: { default: 0 },
    };
  });
}

function buildFeatItem(name: string, featType: string): FoundryItem {
  return {
    _id: makeId(),
    name,
    type: "feat",
    img: "icons/svg/item-bag.svg",
    system: {
      source: { custom: "", book: "", page: "", license: "", rules: "2014", revision: 1 },
      description: { value: "", chat: "" },
      requirements: "",
      uses: { max: "", recovery: [], spent: 0 },
      type: { value: featType, subtype: "" },
      properties: [],
      advancement: [],
      activities: {},
      identifier: slugify(name),
      crewed: false,
      enchant: {},
      prerequisites: { items: [], repeatable: false },
    },
    flags: {},
    effects: [],
    _stats: makeStats(),
    folder: null,
    sort: 0,
    ownership: { default: 0 },
  };
}

function parseSpellEntry(raw: string): { name: string; level: number } {
  const match = raw.match(/^(?:nv\s*(\d+)\s*:\s*)?(.+)$/i);
  if (!match) {
    return { name: raw.trim(), level: 1 };
  }

  return {
    level: match[1] ? Number.parseInt(match[1], 10) : 1,
    name: match[2].trim(),
  };
}

function buildSpellItem(name: string, level: number, classId: string): FoundryItem {
  const spellAbility = getSpellAbilityForClass(classId) ?? "int";
  const activityId = "dnd5eactivity000";

  return {
    _id: makeId(),
    name,
    type: "spell",
    img: "icons/svg/book.svg",
    system: {
      source: { custom: "", book: "", page: "", license: "", rules: "2014", revision: 1 },
      description: { value: "", chat: "" },
      level,
      school: "evo",
      properties: ["vocal", "somatic"],
      ability: spellAbility,
      materials: { value: "", consumed: false, cost: 0, supply: 0 },
      target: { template: { contiguous: false, units: "ft" }, affects: { count: "1", type: "creature", choice: false } },
      range: { value: null, units: "ft" },
      activation: { type: "action", value: 1, condition: "" },
      duration: { value: "", units: "inst" },
      uses: { max: "", recovery: [], spent: 0 },
      method: "spell",
      prepared: level === 0 ? 2 : 1,
      sourceClass: classId,
      activities: {
        [activityId]: {
          _id: activityId,
          type: "utility",
          activation: { type: "action", value: null, override: false },
          consumption: { targets: [], scaling: { allowed: false, max: "" }, spellSlot: true },
          description: { chatFlavor: "" },
          duration: { units: "inst", concentration: false, override: false },
          effects: [],
          range: { override: false, units: "ft" },
          target: { prompt: true, template: { contiguous: false, units: "ft" }, affects: { choice: false }, override: false },
          uses: { spent: 0, recovery: [] },
          sort: 0,
          flags: {},
        },
      },
      identifier: slugify(name),
    },
    flags: {},
    effects: [],
    _stats: makeStats(),
    folder: null,
    sort: 0,
    ownership: { default: 0 },
  };
}

function buildSpellItems(character: CharacterBuild): FoundryItem[] {
  const primaryClassId = normalizeClassId(character.classing.classes[0]?.classId ?? "");

  return character.choices.spells.map((rawSpell) => {
    const { name, level } = parseSpellEntry(rawSpell);
    return buildSpellItem(name, level, primaryClassId);
  });
}

function buildFeatItems(character: CharacterBuild): FoundryItem[] {
  const backgroundFeats = character.background.grantedFeatIds.map((featId) =>
    buildFeatItem(featId, "background"),
  );
  const chosenFeats = character.choices.feats.map((featId) => buildFeatItem(featId, "feat"));
  const featureItems = character.choices.features.map((feature) => buildFeatItem(feature, "class"));

  return [...backgroundFeats, ...chosenFeats, ...featureItems];
}

function buildItems(character: CharacterBuild): FoundryItem[] {
  return [
    ...buildClassItems(character),
    ...buildFeatItems(character),
    ...buildSpellItems(character),
  ];
}

export function buildFoundryActorPayload(character: CharacterBuild): FoundryActorPayload {
  const payload: FoundryActorPayload = {
    name: character.identity.characterName,
    type: "character",
    img: "systems/dnd5e/icons/svg/actors/character.svg",
    system: {
      abilities: buildFoundryAbilities(character),
      attributes: {
        ac: {
          flat: character.derived.ac,
        },
        hp: {
          value: character.derived.hp,
          max: character.derived.hp,
        },
        spellcasting: character.derived.spellcasting?.ability ?? "",
      },
      details: {
        alignment: character.identity.alignment ?? "",
      },
      spells: character.derived.spellcasting?.slots ?? {},
    },
    items: buildItems(character),
    effects: [],
    flags: {
      "bertinis-vault": {
        sourceProfile: character.meta.sourceProfile,
        rulesVersion: character.meta.rulesVersion,
      },
    },
  };

  return foundryActorPayloadSchema.parse(payload);
}
