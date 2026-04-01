import {
  type AbilityId,
  type CharacterBuild,
  type FoundryActorPayload,
  type PreflightResult,
  foundryActorPayloadSchema,
} from "@bertinis-vault/contracts";
import { findWeaponCatalogEntry } from "@bertinis-vault/data-engine";
import {
  getArmorCatalogEntry,
  getFeatCatalogEntry,
  getGearCatalogEntry,
  getSpellCatalogEntry,
} from "@bertinis-vault/data-engine";
import {
  abilityModifierMap,
  buildPreflightResult,
  getEquipmentEntries,
  getFeatureEntries,
  getHitDieForClass,
  getProficiencyLabels,
  resolveLanguageId as resolveLanguageIdShared,
  resolveSkillId as resolveSkillIdShared,
  getSpellAbilityForClass,
  getSpellEntries,
  getSpellProgressionForClass,
  normalizeClassId,
  resolveToolEntry as resolveToolEntryShared,
} from "@bertinis-vault/domain";

type FoundryItem = Record<string, unknown>;
type FoundryAbilityData = {
  value: number;
  mod: number;
  proficient: 0 | 1;
  bonuses: {
    check: string;
    save: string;
  };
};
type FoundryAbilities = Record<AbilityId, FoundryAbilityData>;
type DerivedSpellEntry = {
  name: string;
  level: number;
  spellId?: string;
};
type SpellReferenceCatalogMeta = {
  label?: string;
  source?: { book?: string };
  plutonium?: {
    source?: string;
    page?: string;
    hash?: string;
    propDroppable?: string;
  };
};
export type FoundryExportResult = {
  preflight: PreflightResult;
  payload?: FoundryActorPayload;
};

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

const CLASS_SAVE_PROFS_BY_ID: Record<string, AbilityId[]> = {
  barbarian: ["str", "con"],
  bard: ["dex", "cha"],
  cleric: ["wis", "cha"],
  druid: ["int", "wis"],
  fighter: ["str", "con"],
  monk: ["str", "dex"],
  paladin: ["wis", "cha"],
  ranger: ["str", "dex"],
  rogue: ["dex", "int"],
  sorcerer: ["con", "cha"],
  warlock: ["wis", "cha"],
  wizard: ["int", "wis"],
  artificer: ["con", "int"],
};

const BACKGROUND_SKILL_PROFS_BY_ID: Record<string, string[]> = {
  acolyte: ["ins", "rel"],
  charlatan: ["dec", "slt"],
  criminal: ["dec", "ste"],
  entertainer: ["acr", "prf"],
  "folk-hero": ["ani", "sur"],
  "guild-artisan": ["ins", "per"],
  hermit: ["med", "rel"],
  noble: ["his", "per"],
  outlander: ["ath", "sur"],
  sage: ["arc", "his"],
  sailor: ["ath", "prc"],
  soldier: ["ath", "itm"],
  urchin: ["slt", "ste"],
};

const SKILL_ALIAS_TO_ID: Record<string, string> = {
  acrobatics: "acr",
  acrobacia: "acr",
  "animal handling": "ani",
  "manejo de animales": "ani",
  arcana: "arc",
  athletics: "ath",
  atletismo: "ath",
  deception: "dec",
  engaño: "dec",
  engano: "dec",
  history: "his",
  historia: "his",
  insight: "ins",
  intuicion: "ins",
  intuición: "ins",
  intimidation: "itm",
  intimidacion: "itm",
  intimidación: "itm",
  investigation: "inv",
  investigacion: "inv",
  investigación: "inv",
  medicine: "med",
  medicina: "med",
  nature: "nat",
  naturaleza: "nat",
  perception: "prc",
  percepcion: "prc",
  percepción: "prc",
  performance: "prf",
  interpretacion: "prf",
  interpretación: "prf",
  persuasion: "per",
  persuasione: "per",
  religion: "rel",
  religione: "rel",
  "sleight of hand": "slt",
  "juego de manos": "slt",
  stealth: "ste",
  sigilo: "ste",
  survival: "sur",
  supervivencia: "sur",
};

const LANGUAGE_ALIAS_TO_ID: Record<string, string> = {
  common: "common",
  comun: "common",
  "enano": "dwarvish",
  dwarvish: "dwarvish",
  dwarf: "dwarvish",
  elvish: "elvish",
  elfico: "elvish",
  elficoo: "elvish",
  gnomish: "gnomish",
  gnomo: "gnomish",
  halfling: "halfling",
  mediano: "halfling",
  giant: "giant",
  gigante: "giant",
  goblin: "goblin",
  draconic: "draconic",
  draconico: "draconic",
  infernal: "infernal",
  abyssal: "abyssal",
  celestial: "celestial",
  primordial: "primordial",
  sylvan: "sylvan",
  orc: "orc",
  orcish: "orc",
  undercommon: "undercommon",
  "deep speech": "deep",
};

const TOOL_ALIAS_TO_ID: Record<string, { id: string; ability: string; label: string }> = {
  "thieves tools": { id: "thief", ability: "dex", label: "Thieves' Tools" },
  "herramientas de ladron": { id: "thief", ability: "dex", label: "Thieves' Tools" },
  "herbalism kit": { id: "herb", ability: "wis", label: "Herbalism Kit" },
  "kit de herboristeria": { id: "herb", ability: "wis", label: "Herbalism Kit" },
  "disguise kit": { id: "disg", ability: "cha", label: "Disguise Kit" },
  "kit de disfraz": { id: "disg", ability: "cha", label: "Disguise Kit" },
  "forgery kit": { id: "forg", ability: "dex", label: "Forgery Kit" },
  "kit de falsificacion": { id: "forg", ability: "dex", label: "Forgery Kit" },
  "navigator's tools": { id: "navg", ability: "wis", label: "Navigator's Tools" },
  "herramientas de navegacion": { id: "navg", ability: "wis", label: "Navigator's Tools" },
  "gaming set": { id: "game", ability: "int", label: "Gaming Set" },
  "vehicle land": { id: "land", ability: "dex", label: "Land Vehicles" },
  "vehiculos terrestres": { id: "land", ability: "dex", label: "Land Vehicles" },
  "vehicle water": { id: "water", ability: "dex", label: "Water Vehicles" },
  "vehiculos acuaticos": { id: "water", ability: "dex", label: "Water Vehicles" },
  "musical instrument": { id: "music", ability: "cha", label: "Musical Instrument" },
  "instrumento musical": { id: "music", ability: "cha", label: "Musical Instrument" },
  "artisan's tools": { id: "art", ability: "int", label: "Artisan's Tools" },
  "artisan tools": { id: "art", ability: "int", label: "Artisan's Tools" },
  "herramientas de artesano": { id: "art", ability: "int", label: "Artisan's Tools" },
};

const BACKGROUND_LANGUAGE_PROFS_BY_ID: Record<string, string[]> = {
  acolyte: ["common"],
  "guild-artisan": ["common"],
  hermit: ["common"],
  noble: ["common"],
  outlander: ["common"],
  sage: ["common"],
};

const BACKGROUND_TOOL_PROFS_BY_ID: Record<string, string[]> = {
  charlatan: ["Disguise Kit", "Forgery Kit"],
  criminal: ["Thieves' Tools", "Gaming Set"],
  entertainer: ["Disguise Kit", "Musical Instrument"],
  "guild-artisan": ["Artisan's Tools"],
  hermit: ["Herbalism Kit"],
  noble: ["Gaming Set"],
  outlander: ["Musical Instrument"],
  sailor: ["Navigator's Tools", "Vehicle Water"],
  soldier: ["Gaming Set", "Vehicle Land"],
  urchin: ["Disguise Kit", "Thieves' Tools"],
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

function makeStats(compendiumSource: string | null = null) {
  return {
    compendiumSource,
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

function buildFoundryAbilities(character: CharacterBuild): FoundryAbilities {
  const modifiers = abilityModifierMap(character.abilities.final);
  const primaryClassId = normalizeClassId(character.classing.classes[0]?.classId ?? "");
  const saveProficiencies = new Set(CLASS_SAVE_PROFS_BY_ID[primaryClassId] ?? []);

  return {
    str: makeAbility(character.abilities.final.str, modifiers.str, saveProficiencies.has("str")),
    dex: makeAbility(character.abilities.final.dex, modifiers.dex, saveProficiencies.has("dex")),
    con: makeAbility(character.abilities.final.con, modifiers.con, saveProficiencies.has("con")),
    int: makeAbility(character.abilities.final.int, modifiers.int, saveProficiencies.has("int")),
    wis: makeAbility(character.abilities.final.wis, modifiers.wis, saveProficiencies.has("wis")),
    cha: makeAbility(character.abilities.final.cha, modifiers.cha, saveProficiencies.has("cha")),
  };
}

function makeAbility(value: number, modifier: number, saveProficient: boolean) {
  return {
    value,
    mod: modifier,
    proficient: (saveProficient ? 1 : 0) as 0 | 1,
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

function normalizeSkillLabel(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveSkillId(value: string) {
  return resolveSkillIdShared(value);
}

function normalizeProficiencyLabel(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s:-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseLanguageEntry(value: string) {
  return resolveLanguageIdShared(value);
}

function parseToolEntry(value: string) {
  return resolveToolEntryShared(value);
}

function buildSkills(character: CharacterBuild) {
  const skills = makeSkills();
  const backgroundSkillIds = BACKGROUND_SKILL_PROFS_BY_ID[character.background.backgroundId] ?? [];
  const selectedSkillIds = getProficiencyLabels(character, "skill")
    .map((entry) => resolveSkillId(entry))
    .filter((entry): entry is string => Boolean(entry));

  const proficientSkills = new Set([...backgroundSkillIds, ...selectedSkillIds]);

  for (const skillId of proficientSkills) {
    if (skillId in skills) {
      skills[skillId as keyof typeof skills].value = 1;
    }
  }

  return skills;
}

function makeTool(ability: string, customLabel?: string) {
  return {
    ability,
    bonus: "",
    value: 1,
    prof: 1,
    roll: { min: null, max: null, mode: 0 },
    custom: customLabel ?? "",
  };
}

function buildTools(character: CharacterBuild) {
  const tools: Record<string, ReturnType<typeof makeTool>> = {};
  const backgroundToolEntries = BACKGROUND_TOOL_PROFS_BY_ID[character.background.backgroundId] ?? [];
  const toolEntries = [...backgroundToolEntries, ...getProficiencyLabels(character, "tool")];

  for (const entry of toolEntries) {
    const tool = parseToolEntry(entry);
    if (!tool) {
      continue;
    }

    tools[tool.id] = makeTool(tool.ability, tool.label);
  }

  return tools;
}

function buildLanguages(character: CharacterBuild) {
  const backgroundLanguageIds = BACKGROUND_LANGUAGE_PROFS_BY_ID[character.background.backgroundId] ?? [];
  const selectedLanguageIds = getProficiencyLabels(character, "language")
    .map((entry) => parseLanguageEntry(entry))
    .filter((entry): entry is string => Boolean(entry));
  const uniqueLanguageIds = Array.from(new Set([...backgroundLanguageIds, ...selectedLanguageIds]));

  return {
    value: uniqueLanguageIds,
    custom: "",
    communication: {},
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

function buildSpellReference(spellId: string | undefined) {
  if (!spellId) {
    return null;
  }

  return {
    type: "spell",
    spellId,
    compendiumPack: "dnd5e.spells",
    lookup: `identifier:${spellId}`,
    comparable: true,
  };
}

function toPlutoniumSource(book?: string) {
  if (!book) {
    return "PHB";
  }

  return book
    .replace(/'14/g, "")
    .replace(/'24/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
}

function toPlutoniumHash(name: string, source: string) {
  return `${encodeURIComponent(name.trim().toLowerCase())}_${source.trim().toLowerCase()}`;
}

function buildPlutoniumSpellReference(
  name: string,
  spellId: string,
  catalogEntry?: SpellReferenceCatalogMeta,
) {
  const source = catalogEntry?.plutonium?.source ?? toPlutoniumSource(catalogEntry?.source?.book);
  const page = catalogEntry?.plutonium?.page ?? "spells.html";
  const hash = catalogEntry?.plutonium?.hash ?? toPlutoniumHash(catalogEntry?.label ?? name, source);
  const propDroppable = catalogEntry?.plutonium?.propDroppable ?? "spell";

  return {
    page,
    source,
    hash,
    propDroppable,
    spellId,
  };
}

function buildSpellDescription(name: string, summary?: string, reference?: ReturnType<typeof buildSpellReference>) {
  const lines = [`<p>${summary || `${name} exported from the canonical Bertini's Vault build.`}</p>`];

  if (reference) {
    lines.push(
      `<p><strong>Compendium lookup:</strong> ${reference.compendiumPack} / ${reference.lookup}</p>`,
    );
  }

  return lines.join("");
}

function buildSpellItem(entry: DerivedSpellEntry, classId: string): FoundryItem {
  const catalogEntry = getSpellCatalogEntry(entry.spellId ?? entry.name);
  const spellId = entry.spellId ?? catalogEntry?.id ?? slugify(entry.name);
  const name = catalogEntry?.label ?? entry.name;
  const level = catalogEntry?.level ?? entry.level;
  const spellAbility = getSpellAbilityForClass(classId) ?? "int";
  const activityId = "dnd5eactivity000";
  const reference = buildSpellReference(spellId);
  const plutoniumReference = buildPlutoniumSpellReference(name, spellId, catalogEntry);
  const description = buildSpellDescription(name, catalogEntry?.summary, reference);
  const components = catalogEntry?.components ?? ["vocal", "somatic"];
  const castingTime = catalogEntry?.castingTime ?? { type: "action", value: 1 };
  const range = catalogEntry?.range ?? { value: null, units: "ft" };
  const duration = catalogEntry?.duration ?? { value: "", units: "inst" };

  return {
    _id: makeId(),
    name,
    type: "spell",
    img: "icons/svg/book.svg",
    system: {
      source: {
        custom: "",
        book: "",
        page: "",
        license: "",
        rules: "2014",
        revision: 1,
      },
      description: { value: description, chat: catalogEntry?.summary ?? "" },
      level,
      school: catalogEntry?.school ?? "evo",
      properties: components,
      ability: spellAbility,
      materials: { value: catalogEntry?.materials ?? "", consumed: false, cost: 0, supply: 0 },
      target: { template: { contiguous: false, units: "ft" }, affects: { count: "1", type: "creature", choice: false } },
      range: { value: range.value, units: range.units },
      activation: { type: castingTime.type, value: castingTime.value, condition: "" },
      duration: { value: duration.value, units: duration.units },
      uses: { max: "", recovery: [], spent: 0 },
      method: "spell",
      prepared: level === 0 ? 2 : 1,
      sourceClass: classId,
      activities: {
        [activityId]: {
            _id: activityId,
            type: "utility",
            activation: { type: castingTime.type, value: null, override: false },
            consumption: { targets: [], scaling: { allowed: false, max: "" }, spellSlot: true },
            description: { chatFlavor: catalogEntry?.summary ?? "" },
            duration: { units: duration.units, concentration: false, override: false },
            effects: [],
            range: { override: false, units: range.units },
            target: { prompt: true, template: { contiguous: false, units: "ft" }, affects: { choice: false }, override: false },
            uses: { spent: 0, recovery: [] },
            sort: 0,
            flags: {},
          },
        },
        identifier: spellId,
      },
      flags: {
        plutonium: {
          ...plutoniumReference,
        },
        "bertinis-vault": {
          reference,
          plutonium: plutoniumReference,
        },
      },
      effects: [],
      _stats: makeStats(),
      folder: null,
      sort: 0,
      ownership: { default: 0 },
  };
}

function buildSpellItems(character: CharacterBuild): FoundryItem[] {
  const primaryClassId = normalizeClassId(character.classing.classes[0]?.classId ?? "");
  const dedupedItems: FoundryItem[] = [];
  const seen = new Set<string>();

  for (const entry of getSpellEntries(character)) {
    const catalogEntry = getSpellCatalogEntry(entry.spellId ?? entry.name);
    const spellKey = `${catalogEntry?.id ?? slugify(entry.name)}:${entry.level}`;
    if (seen.has(spellKey)) {
      continue;
    }

    seen.add(spellKey);
    dedupedItems.push(buildSpellItem(entry, primaryClassId));
  }

  return dedupedItems;
}

function buildFeatItems(character: CharacterBuild): FoundryItem[] {
  const backgroundFeats = character.background.grantedFeatIds.map((featId) =>
    buildFeatItem(getFeatCatalogEntry(featId)?.label ?? featId, "background"),
  );
  const chosenFeats = character.choices.feats.map((featId) =>
    buildFeatItem(getFeatCatalogEntry(featId)?.label ?? featId, "feat"),
  );
  const featureItems = getFeatureEntries(character).map((feature) =>
    buildFeatItem(feature.name, feature.source),
  );
  const dedupedItems: FoundryItem[] = [];
  const seen = new Set<string>();

  for (const item of [...backgroundFeats, ...chosenFeats, ...featureItems]) {
    const key = `${String(item.type)}:${String(item.name).toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedupedItems.push(item);
  }

  return dedupedItems;
}

function parseDamageFormula(formula: string) {
  const match = formula.match(/(\d+)d(\d+)/i);
  const [, numberPart, denominationPart] = match ?? [];

  return {
    number: numberPart ? Number.parseInt(numberPart, 10) : 1,
    denomination: denominationPart ? Number.parseInt(denominationPart, 10) : 6,
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

function buildWeaponItem(name: string, quantity = 1): FoundryItem {
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
      quantity,
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

function buildArmorItem(name: string, quantity = 1, equipped: boolean): FoundryItem {
  const armorData = findArmorData(name);

  return {
    _id: makeId(),
    name: armorData?.label ?? name,
    type: "equipment",
    img: "icons/svg/shield.svg",
    system: {
      source: { custom: "", book: "", page: "", license: "", rules: "2014", revision: 1 },
      description: { value: "", chat: "" },
      quantity,
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

function buildGearItem(name: string, quantity = 1): FoundryItem {
  const gearData = findGearData(name);

  return {
    _id: makeId(),
    name: gearData?.label ?? name,
    type: "loot",
    img: "icons/svg/item-bag.svg",
    system: {
      source: { custom: "", book: "", page: "", license: "", rules: "2014", revision: 1 },
      description: { value: "", chat: "" },
      quantity,
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
    languages: buildLanguages(character),
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
  const equipment = getEquipmentEntries(character);
  let equippedArmorAssigned = false;
  let equippedShieldAssigned = false;

  const equipmentItems = equipment.flatMap((item) => {
    if (findWeaponData(item.lookupName)) {
      return [buildWeaponItem(item.lookupName, item.quantity)];
    }

    const armorData = findArmorData(item.lookupName);
    if (armorData) {
      const isShield = Boolean(armorData.grantsShieldBonus);
      const shouldEquip = isShield
        ? !equippedShieldAssigned
        : !equippedArmorAssigned;

      if (isShield) {
        equippedShieldAssigned = true;
      } else {
        equippedArmorAssigned = true;
      }

      return [buildArmorItem(item.lookupName, item.quantity, shouldEquip)];
    }

    return [buildGearItem(item.lookupName, item.quantity)];
  });

  return [
    ...buildClassItems(character),
    ...buildFeatItems(character),
    ...buildSpellItems(character),
    ...equipmentItems,
  ];
}

function buildFoundryActorPayloadUnchecked(character: CharacterBuild): FoundryActorPayload {
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
      skills: buildSkills(character),
      tools: buildTools(character),
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
        preflight: {
          blockers: 0,
          warnings: 0,
          info: 0,
          total: 0,
        },
      },
    },
    prototypeToken: makeToken(character.identity.characterName),
    folder: null,
    ownership: { default: 0 },
    _stats: makeStats(),
  };

  return foundryActorPayloadSchema.parse(payload);
}

export function buildFoundryExportResult(character: CharacterBuild): FoundryExportResult {
  const preflight = buildPreflightResult(character, {
    target: {
      rulesVersion: character.meta.rulesVersion,
      sourceProfile: character.meta.sourceProfile,
      foundryVersion: "13.351",
      systemId: "dnd5e",
      systemVersion: "5.2.5",
    },
  });

  if (!preflight.ok) {
    return { preflight };
  }

  const payload = buildFoundryActorPayloadUnchecked(character);
  const flaggedPayload: FoundryActorPayload = foundryActorPayloadSchema.parse({
    ...payload,
    flags: {
      ...payload.flags,
      "bertinis-vault": {
        ...((payload.flags?.["bertinis-vault"] as Record<string, unknown> | undefined) ?? {}),
        preflight: preflight.summary,
      },
    },
  });

  return {
    preflight,
    payload: flaggedPayload,
  };
}

export function buildFoundryActorPayload(character: CharacterBuild): FoundryActorPayload {
  const result = buildFoundryExportResult(character);

  if (!result.payload) {
    const blockerSummary = result.preflight.issues
      .filter((issue) => issue.severity === "blocker")
      .map((issue) => issue.message)
      .join(" ");

    throw new Error(
      blockerSummary || "Foundry export blocked by preflight validation.",
    );
  }

  return result.payload;
}
