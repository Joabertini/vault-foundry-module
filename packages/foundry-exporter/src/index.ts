import {
  type CharacterBuild,
  type FoundryActorPayload,
  foundryActorPayloadSchema,
} from "@bertinis-vault/contracts";
import { findWeaponCatalogEntry } from "@bertinis-vault/data-engine";
import {
  getArmorCatalogEntry,
  getGearCatalogEntry,
} from "../../data-engine/src/equipment.ts";
import {
  abilityModifierMap,
  getHitDieForClass,
  getSpellAbilityForClass,
  getSpellProgressionForClass,
  normalizeClassId,
} from "@bertinis-vault/domain";

type FoundryItem = Record<string, unknown>;

const CLASS_PROFS_BY_ID: Record<string, { armor: string[]; weapons: string[] }> = {
  barbarian: { armor: ["light", "medium", "shields"], weapons: ["simple", "martial"] },
  bard: { armor: ["light"], weapons: ["simple", "hand crossbow", "longsword", "rapier", "shortsword"] },
  cleric: { armor: ["light", "medium", "shields"], weapons: ["simple"] },
  druid: {
    armor: ["light", "medium", "shields"],
    weapons: ["clubs", "daggers", "darts", "javelins", "maces", "quarterstaffs", "scimitars", "sickles", "slings", "spears"],
  },
  fighter: { armor: ["light", "medium", "heavy", "shields"], weapons: ["simple", "martial"] },
  monk: { armor: [], weapons: ["simple", "shortswords"] },
  paladin: { armor: ["light", "medium", "heavy", "shields"], weapons: ["simple", "martial"] },
  ranger: { armor: ["light", "medium", "shields"], weapons: ["simple", "martial"] },
  rogue: { armor: ["light"], weapons: ["simple", "hand crossbow", "longsword", "rapier", "shortsword"] },
  sorcerer: { armor: [], weapons: ["daggers", "darts", "slings", "quarterstaffs", "light crossbows"] },
  warlock: { armor: ["light"], weapons: ["simple"] },
  wizard: { armor: [], weapons: ["daggers", "darts", "slings", "quarterstaffs", "light crossbows"] },
  artificer: { armor: ["light", "medium", "shields"], weapons: ["simple"] },
};

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

function makeSkill(ability: string) {
  return {
    ability,
    roll: { min: null, max: null, mode: 0 },
    value: 0,
    bonuses: { check: "", passive: "" },
  };
}

function makeSkills() {
  return {
    acr: makeSkill("dex"),
    ani: makeSkill("wis"),
    arc: makeSkill("int"),
    ath: makeSkill("str"),
    dec: makeSkill("cha"),
    his: makeSkill("int"),
    ins: makeSkill("wis"),
    itm: makeSkill("cha"),
    inv: makeSkill("int"),
    med: makeSkill("wis"),
    nat: makeSkill("int"),
    prc: makeSkill("wis"),
    prf: makeSkill("cha"),
    per: makeSkill("cha"),
    rel: makeSkill("int"),
    slt: makeSkill("dex"),
    ste: makeSkill("dex"),
    sur: makeSkill("wis"),
  };
}

function makeToken(name: string) {
  return {
    name,
    displayName: 0,
    actorLink: true,
    width: 1,
    height: 1,
    texture: {
      src: "systems/dnd5e/icons/svg/actors/character.svg",
      anchorX: 0.5,
      anchorY: 0.5,
      offsetX: 0,
      offsetY: 0,
      fit: "contain",
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      tint: "#ffffff",
      alphaThreshold: 0.75,
    },
    lockRotation: false,
    rotation: 0,
    alpha: 1,
    disposition: 1,
    displayBars: 0,
    bar1: { attribute: "attributes.hp" },
    bar2: { attribute: null },
    light: {
      negative: false,
      priority: 0,
      alpha: 0.5,
      angle: 360,
      bright: 0,
      color: null,
      coloration: 1,
      dim: 0,
      attenuation: 0.5,
      luminosity: 0.5,
      saturation: 0,
      contrast: 0,
      shadows: 0,
      animation: { type: null, speed: 5, intensity: 5, reverse: false },
      darkness: { min: 0, max: 1 },
    },
    sight: {
      enabled: true,
      range: 0,
      angle: 360,
      visionMode: "basic",
      color: null,
      attenuation: 0.1,
      brightness: 0,
      saturation: 0,
      contrast: 0,
    },
    detectionModes: [],
    occludable: { radius: 0 },
    ring: { enabled: false, colors: { ring: null, background: null }, effects: 1, subject: { scale: 1, texture: null } },
    turnMarker: { mode: 1, animation: null, src: null, disposition: false },
    movementAction: null,
    flags: {},
    randomImg: false,
    appendNumber: false,
    prependAdjective: false,
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

function parseDamageFormula(formula: string) {
  const match = formula.match(/(\d+)d(\d+)/i);

  return {
    number: match ? Number.parseInt(match[1], 10) : 1,
    denomination: match ? Number.parseInt(match[2], 10) : 6,
  };
}

function findWeaponData(name: string) {
  return findWeaponCatalogEntry(name);
}

function findArmorData(name: string) {
  return getArmorCatalogEntry(name);
}

function findGearData(name: string) {
  return getGearCatalogEntry(name);
}

function buildWeaponItem(name: string): FoundryItem {
  const weaponData = findWeaponData(name);
  const activityId = "dnd5eactivity000";
  const damage = parseDamageFormula(weaponData?.damage ?? "1d6");

  return {
    _id: makeId(),
    name,
    type: "weapon",
    img: "icons/svg/sword.svg",
    system: {
      source: { custom: "", book: "", page: "", license: "", rules: "2014", revision: 1 },
      description: { value: "", chat: "" },
      quantity: 1,
      weight: { value: 0, units: "lb" },
      price: { value: 0, denomination: "gp" },
      attunement: { required: false },
      equipped: true,
      identified: true,
      rarity: "common",
      uses: { max: "", recovery: [], spent: 0 },
      activation: { type: "action", value: 1, condition: "" },
      duration: { value: "", units: "inst" },
      target: { template: { contiguous: false, units: "ft" }, affects: { count: "1", type: "creature", choice: false } },
      range: { value: null, units: "ft" },
      damage: {
        base: {
          number: damage.number,
          denomination: damage.denomination,
          bonus: "",
          types: [weaponData?.damageType ?? "slashing"],
          custom: { enabled: false },
          scaling: { mode: "whole", number: 1, formula: "" },
        },
      },
      type: { value: weaponData?.itemType ?? "simpleM", baseItem: "" },
      properties: [],
      proficient: null,
      activities: {
        [activityId]: {
          _id: activityId,
          type: "attack",
          activation: { type: "action", value: null, override: false },
          consumption: { targets: [], scaling: { allowed: false, max: "" }, spellSlot: false },
          description: { chatFlavor: "" },
          duration: { units: "inst", concentration: false, override: false },
          effects: [],
          range: { override: false, units: "ft" },
          target: { prompt: true, template: { contiguous: false, units: "ft" }, affects: { choice: false }, override: false },
          attack: {
            ability: "",
            bonus: "",
            critical: { threshold: null },
            flat: false,
            type: { value: weaponData?.attackType ?? "melee", classification: "weapon" },
          },
          damage: {
            critical: { bonus: "" },
            includeBase: true,
            parts: [
              {
                number: damage.number,
                denomination: damage.denomination,
                bonus: "",
                types: [weaponData?.damageType ?? "slashing"],
                custom: { enabled: false, formula: "" },
                scaling: { mode: "whole", number: 1, formula: "" },
              },
            ],
          },
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

function buildArmorItem(name: string, equipped: boolean): FoundryItem {
  const armorData = findArmorData(name);

  return {
    _id: makeId(),
    name: armorData?.label ?? name,
    type: "equipment",
    img: "icons/svg/shield.svg",
    system: {
      source: { custom: "", book: "", page: "", license: "", rules: "2014", revision: 1 },
      description: { value: "", chat: "" },
      quantity: 1,
      weight: { value: 0, units: "lb" },
      price: { value: 0, denomination: "gp" },
      attunement: { required: false },
      equipped,
      identified: true,
      rarity: "common",
      uses: { max: "", recovery: [], spent: 0 },
      armor: {
        type: armorData?.grantsShieldBonus ? "shield" : "light",
        value: armorData?.armorFormula ?? "",
      },
      strength: 0,
      stealth: false,
      proficient: null,
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

function buildGearItem(name: string): FoundryItem {
  const gearData = findGearData(name);

  return {
    _id: makeId(),
    name: gearData?.label ?? name,
    type: "loot",
    img: "icons/svg/item-bag.svg",
    system: {
      source: { custom: "", book: "", page: "", license: "", rules: "2014", revision: 1 },
      description: { value: "", chat: "" },
      quantity: 1,
      weight: { value: 0, units: "lb" },
      price: { value: 0, denomination: "gp" },
      rarity: "common",
      identified: true,
      container: null,
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

function buildBiography(character: CharacterBuild) {
  const biography = character.identity.biography ?? {};
  const lines: string[] = [];

  if (biography.trait) lines.push(`<p><em>Trait:</em> ${biography.trait}</p>`);
  if (biography.ideal) lines.push(`<p><em>Ideal:</em> ${biography.ideal}</p>`);
  if (biography.bond) lines.push(`<p><em>Bond:</em> ${biography.bond}</p>`);
  if (biography.flaw) lines.push(`<p><em>Flaw:</em> ${biography.flaw}</p>`);
  if (biography.notes) lines.push(`<p><em>Notes:</em> ${biography.notes}</p>`);

  return lines.join("");
}

function buildTraitData(character: CharacterBuild) {
  const primaryClassId = normalizeClassId(character.classing.classes[0]?.classId ?? "");
  const profs = CLASS_PROFS_BY_ID[primaryClassId] ?? { armor: [], weapons: [] };

  return {
    size: "med",
    di: { value: [], custom: "", bypasses: [] },
    dr: { value: [], custom: "", bypasses: [] },
    dv: { value: [], custom: "", bypasses: [] },
    dm: { amount: {}, bypasses: [] },
    ci: { value: [], custom: "" },
    languages: { value: [], custom: "", communication: {} },
    weaponProf: {
      value: [],
      custom: profs.weapons.join(", "),
      mastery: { value: [], bonus: [] },
    },
    armorProf: {
      value: profs.armor.filter((type) => ["light", "medium", "heavy"].includes(type)),
      custom: profs.armor.includes("shields") ? "shields" : "",
    },
  };
}

function buildItems(character: CharacterBuild): FoundryItem[] {
  const equipment = character.choices.equipment;
  const primaryWeapon = equipment.find((item) => Boolean(findWeaponData(item)));
  const primaryArmor = equipment.find((item) => Boolean(findArmorData(item)));
  const extraGear = equipment.filter(
    (item) => !findWeaponData(item) && !findArmorData(item),
  );

  const weaponItems = primaryWeapon ? [buildWeaponItem(primaryWeapon)] : [];
  const armorItems = primaryArmor ? [buildArmorItem(primaryArmor, true)] : [];
  const gearItems = extraGear.map((item) => buildGearItem(item));

  return [
    ...buildClassItems(character),
    ...buildFeatItems(character),
    ...buildSpellItems(character),
    ...armorItems,
    ...weaponItems,
    ...gearItems,
  ];
}

export function buildFoundryActorPayload(character: CharacterBuild): FoundryActorPayload {
  const payload: FoundryActorPayload = {
    name: character.identity.characterName,
    type: "character",
    img: "systems/dnd5e/icons/svg/actors/character.svg",
    system: {
      currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
      abilities: buildFoundryAbilities(character),
      bonuses: {
        mwak: { attack: "", damage: "" },
        rwak: { attack: "", damage: "" },
        msak: { attack: "", damage: "" },
        rsak: { attack: "", damage: "" },
        abilities: { check: "", save: "", skill: "" },
        spell: { dc: "" },
      },
      skills: makeSkills(),
      tools: {},
      attributes: {
        ac: {
          flat: character.derived.ac,
        },
        hp: {
          value: character.derived.hp,
          max: character.derived.hp,
        },
        spellcasting: character.derived.spellcasting?.ability ?? "",
        init: { ability: "", roll: { min: null, max: null, mode: 0 }, bonus: "" },
        movement: { units: null, hover: false, ignoredDifficultTerrain: [] },
        attunement: { max: 3 },
        senses: {
          darkvision: null,
          blindsight: null,
          tremorsense: null,
          truesight: null,
          units: null,
          special: "",
        },
        exhaustion: 0,
        concentration: {
          ability: "",
          roll: { min: null, max: null, mode: 0 },
          bonuses: { save: "" },
          limit: 1,
        },
        loyalty: {},
        death: {
          roll: { min: null, max: null, mode: 0 },
          success: 0,
          failure: 0,
          bonuses: { save: "" },
        },
        inspiration: false,
      },
      bastion: { name: "", description: "" },
      details: {
        alignment: character.identity.alignment ?? "",
        biography: { value: buildBiography(character), public: "" },
        race: character.ancestry.raceId,
        background: character.background.backgroundId,
        originalClass: character.classing.classes[0]?.classId ?? "",
        trait: character.identity.biography?.trait ?? "",
        appearance: "",
        ideal: character.identity.biography?.ideal ?? "",
        bond: character.identity.biography?.bond ?? "",
        flaw: character.identity.biography?.flaw ?? "",
      },
      spells: character.derived.spellcasting?.slots ?? {},
      traits: buildTraitData(character),
      resources: {
        primary: { value: 0, max: 0, sr: false, lr: false, label: "" },
        secondary: { value: 0, max: 0, sr: false, lr: false, label: "" },
        tertiary: { value: 0, max: 0, sr: false, lr: false, label: "" },
      },
      favorites: [],
    },
    items: buildItems(character),
    effects: [],
    flags: {
      "bertinis-vault": {
        sourceProfile: character.meta.sourceProfile,
        rulesVersion: character.meta.rulesVersion,
      },
    },
    prototypeToken: makeToken(character.identity.characterName),
    folder: null,
    ownership: { default: 0 },
    _stats: makeStats(),
  };

  return foundryActorPayloadSchema.parse(payload);
}
