// ============================================================
// Bertini's Vault - Foundry Export Bridge
// Temporary JS bridge that derives a Foundry-like payload from
// the canonical CharacterBuild model inside the legacy module.
// ============================================================

import { WEAPON_OPTIONS } from './data.js';

const CLASS_PROFS_BY_ID = {
  barbarian: { armor: ['light', 'medium', 'shields'], weapons: ['simple', 'martial'] },
  bard: { armor: ['light'], weapons: ['simple', 'hand crossbow', 'longsword', 'rapier', 'shortsword'] },
  cleric: { armor: ['light', 'medium', 'shields'], weapons: ['simple'] },
  druid: { armor: ['light', 'medium', 'shields'], weapons: ['clubs', 'daggers', 'darts', 'javelins', 'maces', 'quarterstaffs', 'scimitars', 'sickles', 'slings', 'spears'] },
  ranger: { armor: ['light', 'medium', 'shields'], weapons: ['simple', 'martial'] },
  fighter: { armor: ['light', 'medium', 'heavy', 'shields'], weapons: ['simple', 'martial'] },
  sorcerer: { armor: [], weapons: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'] },
  wizard: { armor: [], weapons: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'] },
  monk: { armor: [], weapons: ['simple', 'shortswords'] },
  paladin: { armor: ['light', 'medium', 'heavy', 'shields'], weapons: ['simple', 'martial'] },
  rogue: { armor: ['light'], weapons: ['simple', 'hand crossbow', 'longsword', 'rapier', 'shortsword'] },
  warlock: { armor: ['light'], weapons: ['simple'] },
  artificer: { armor: ['light', 'medium', 'shields'], weapons: ['simple'] },
};

const CLASS_SAVE_PROFS_BY_ID = {
  barbarian: ['str', 'con'],
  bard: ['dex', 'cha'],
  cleric: ['wis', 'cha'],
  druid: ['int', 'wis'],
  fighter: ['str', 'con'],
  monk: ['str', 'dex'],
  paladin: ['wis', 'cha'],
  ranger: ['str', 'dex'],
  rogue: ['dex', 'int'],
  sorcerer: ['con', 'cha'],
  warlock: ['wis', 'cha'],
  wizard: ['int', 'wis'],
  artificer: ['con', 'int'],
};

const BACKGROUND_SKILL_PROFS_BY_ID = {
  acolyte: ['ins', 'rel'],
  charlatan: ['dec', 'slt'],
  criminal: ['dec', 'ste'],
  entertainer: ['acr', 'prf'],
  'folk-hero': ['ani', 'sur'],
  'guild-artisan': ['ins', 'per'],
  hermit: ['med', 'rel'],
  noble: ['his', 'per'],
  outlander: ['ath', 'sur'],
  sage: ['arc', 'his'],
  sailor: ['ath', 'prc'],
  soldier: ['ath', 'itm'],
  urchin: ['slt', 'ste'],
};

const SKILL_ALIAS_TO_ID = {
  acrobatics: 'acr',
  acrobacia: 'acr',
  'animal handling': 'ani',
  'manejo de animales': 'ani',
  arcana: 'arc',
  athletics: 'ath',
  atletismo: 'ath',
  deception: 'dec',
  engano: 'dec',
  history: 'his',
  historia: 'his',
  insight: 'ins',
  intuicion: 'ins',
  intimidation: 'itm',
  intimidacion: 'itm',
  investigation: 'inv',
  investigacion: 'inv',
  medicine: 'med',
  medicina: 'med',
  nature: 'nat',
  naturaleza: 'nat',
  perception: 'prc',
  percepcion: 'prc',
  performance: 'prf',
  interpretacion: 'prf',
  persuasion: 'per',
  persuasión: 'per',
  religion: 'rel',
  religione: 'rel',
  'sleight of hand': 'slt',
  'juego de manos': 'slt',
  stealth: 'ste',
  sigilo: 'ste',
  survival: 'sur',
  supervivencia: 'sur',
};

function makeId() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 16 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s/-]/g, '')
    .trim()
    .replace(/[\s/]+/g, '-');
}

function abilityMod(score) {
  return Math.floor(((parseInt(score, 10) || 10) - 10) / 2);
}

function makeStats() {
  return {
    compendiumSource: null,
    duplicateSource: null,
    exportSource: null,
    coreVersion: '13.351',
    systemId: 'dnd5e',
    systemVersion: '5.2.5',
    createdTime: null,
    modifiedTime: null,
    lastModifiedBy: null,
  };
}

function getSpellAbility(classId) {
  const map = {
    artificer: 'int',
    bard: 'cha',
    cleric: 'wis',
    druid: 'wis',
    paladin: 'cha',
    ranger: 'wis',
    sorcerer: 'cha',
    warlock: 'cha',
    wizard: 'int',
  };

  return map[classId] || '';
}

function getHitDie(classId) {
  const map = {
    artificer: 8,
    barbarian: 12,
    bard: 8,
    cleric: 8,
    druid: 8,
    fighter: 10,
    monk: 8,
    paladin: 10,
    ranger: 10,
    rogue: 8,
    sorcerer: 6,
    warlock: 8,
    wizard: 6,
  };

  return map[classId] || 8;
}

function getSpellProgression(classId) {
  const map = {
    artificer: 'half',
    bard: 'full',
    cleric: 'full',
    druid: 'full',
    paladin: 'half',
    ranger: 'half',
    sorcerer: 'full',
    warlock: 'pact',
    wizard: 'full',
    barbarian: 'none',
    fighter: 'none',
    monk: 'none',
    rogue: 'none',
  };

  return map[classId] || 'none';
}

function buildAbilities(canonicalBuild) {
  const final = canonicalBuild?.abilities?.final || {};
  const primaryClassId = canonicalBuild?.classing?.classes?.[0]?.classId || '';
  const saveProfs = new Set(CLASS_SAVE_PROFS_BY_ID[primaryClassId] || []);

  return {
    str: { value: final.str || 10, mod: abilityMod(final.str), proficient: saveProfs.has('str') ? 1 : 0, bonuses: { check: '', save: '' } },
    dex: { value: final.dex || 10, mod: abilityMod(final.dex), proficient: saveProfs.has('dex') ? 1 : 0, bonuses: { check: '', save: '' } },
    con: { value: final.con || 10, mod: abilityMod(final.con), proficient: saveProfs.has('con') ? 1 : 0, bonuses: { check: '', save: '' } },
    int: { value: final.int || 10, mod: abilityMod(final.int), proficient: saveProfs.has('int') ? 1 : 0, bonuses: { check: '', save: '' } },
    wis: { value: final.wis || 10, mod: abilityMod(final.wis), proficient: saveProfs.has('wis') ? 1 : 0, bonuses: { check: '', save: '' } },
    cha: { value: final.cha || 10, mod: abilityMod(final.cha), proficient: saveProfs.has('cha') ? 1 : 0, bonuses: { check: '', save: '' } },
  };
}

function makeSkill(ability) {
  return {
    ability,
    roll: { min: null, max: null, mode: 0 },
    value: 0,
    bonuses: { check: '', passive: '' },
  };
}

function makeSkills() {
  return {
    acr: makeSkill('dex'),
    ani: makeSkill('wis'),
    arc: makeSkill('int'),
    ath: makeSkill('str'),
    dec: makeSkill('cha'),
    his: makeSkill('int'),
    ins: makeSkill('wis'),
    itm: makeSkill('cha'),
    inv: makeSkill('int'),
    med: makeSkill('wis'),
    nat: makeSkill('int'),
    prc: makeSkill('wis'),
    prf: makeSkill('cha'),
    per: makeSkill('cha'),
    rel: makeSkill('int'),
    slt: makeSkill('dex'),
    ste: makeSkill('dex'),
    sur: makeSkill('wis'),
  };
}

function normalizeSkillLabel(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveSkillId(value) {
  return SKILL_ALIAS_TO_ID[normalizeSkillLabel(value)];
}

function buildSkills(canonicalBuild) {
  const skills = makeSkills();
  const backgroundId = canonicalBuild?.background?.backgroundId || '';
  const backgroundSkillIds = BACKGROUND_SKILL_PROFS_BY_ID[backgroundId] || [];
  const selectedSkillIds = (canonicalBuild?.choices?.proficiencies || [])
    .map(resolveSkillId)
    .filter(Boolean);
  const proficientSkills = new Set([...backgroundSkillIds, ...selectedSkillIds]);

  proficientSkills.forEach(skillId => {
    if (skills[skillId]) {
      skills[skillId].value = 1;
    }
  });

  return skills;
}

function buildClassItems(canonicalBuild) {
  const classes = canonicalBuild?.classing?.classes || [];

  return classes.map(entry => ({
    _id: makeId(),
    name: entry.classId,
    type: 'class',
    img: 'systems/dnd5e/icons/svg/items/class.svg',
    system: {
      identifier: slugify(entry.classId),
      description: {
        value: `<p>${entry.classId}${entry.subclassId ? ' - ' + entry.subclassId : ''}</p>`,
        chat: '',
      },
      source: { custom: '', book: "PHB'14", page: '', license: '', rules: '2014', revision: 1 },
      levels: entry.level,
      hd: { denomination: `d${getHitDie(entry.classId)}`, spent: 0, additional: '' },
      spellcasting: { progression: getSpellProgression(entry.classId), ability: getSpellAbility(entry.classId), preparation: {} },
      primaryAbility: { value: [getSpellAbility(entry.classId) || 'str'], all: false },
      wealth: '',
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
  }));
}

function buildFeatItem(name, featType) {
  return {
    _id: makeId(),
    name,
    type: 'feat',
    img: 'icons/svg/item-bag.svg',
    system: {
      source: { custom: '', book: '', page: '', license: '', rules: '2014', revision: 1 },
      description: { value: '', chat: '' },
      requirements: '',
      uses: { max: '', recovery: [], spent: 0 },
      type: { value: featType, subtype: '' },
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

function parseSpellEntry(raw) {
  const match = String(raw || '').match(/^(?:nv\s*(\d+)\s*:\s*)?(.+)$/i);
  if (!match) return { name: String(raw || '').trim(), level: 1 };

  return {
    level: match[1] ? parseInt(match[1], 10) : 1,
    name: match[2].trim(),
  };
}

function buildSpellItem(name, level, classId) {
  const activityId = 'dnd5eactivity000';

  return {
    _id: makeId(),
    name,
    type: 'spell',
    img: 'icons/svg/book.svg',
    system: {
      source: { custom: '', book: '', page: '', license: '', rules: '2014', revision: 1 },
      description: { value: '', chat: '' },
      level,
      school: 'evo',
      properties: ['vocal', 'somatic'],
      ability: getSpellAbility(classId) || 'int',
      materials: { value: '', consumed: false, cost: 0, supply: 0 },
      target: { template: { contiguous: false, units: 'ft' }, affects: { count: '1', type: 'creature', choice: false } },
      range: { value: null, units: 'ft' },
      activation: { type: 'action', value: 1, condition: '' },
      duration: { value: '', units: 'inst' },
      uses: { max: '', recovery: [], spent: 0 },
      method: 'spell',
      prepared: level === 0 ? 2 : 1,
      sourceClass: classId,
      activities: {
        [activityId]: {
          _id: activityId,
          type: 'utility',
          activation: { type: 'action', value: null, override: false },
          consumption: { targets: [], scaling: { allowed: false, max: '' }, spellSlot: true },
          description: { chatFlavor: '' },
          duration: { units: 'inst', concentration: false, override: false },
          effects: [],
          range: { override: false, units: 'ft' },
          target: { prompt: true, template: { contiguous: false, units: 'ft' }, affects: { choice: false }, override: false },
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

function findWeaponData(name) {
  const normalizedName = String(name || '').toLowerCase();
  return WEAPON_OPTIONS.find(weapon => normalizedName.includes(weapon.name.toLowerCase()));
}

function buildWeaponItem(name) {
  const weaponData = findWeaponData(name);
  const activityId = 'dnd5eactivity000';

  return {
    _id: makeId(),
    name,
    type: 'weapon',
    img: 'icons/svg/sword.svg',
    system: {
      source: { custom: '', book: '', page: '', license: '', rules: '2014', revision: 1 },
      description: { value: '', chat: '' },
      quantity: 1,
      weight: { value: 0, units: 'lb' },
      price: { value: 0, denomination: 'gp' },
      attunement: { required: false },
      equipped: true,
      identified: true,
      rarity: 'common',
      uses: { max: '', recovery: [], spent: 0 },
      activation: { type: 'action', value: 1, condition: '' },
      duration: { value: '', units: 'inst' },
      target: { template: { contiguous: false, units: 'ft' }, affects: { count: '1', type: 'creature', choice: false } },
      range: { value: null, units: 'ft' },
      damage: {
        base: {
          number: weaponData ? parseInt(String(weaponData.dmg).split('d')[0], 10) || 1 : 1,
          denomination: weaponData ? parseInt(String(weaponData.dmg).split('d')[1], 10) || 6 : 6,
          bonus: '',
          types: weaponData ? [weaponData.dmgType || 'slashing'] : [],
          custom: { enabled: false },
          scaling: { mode: 'whole', number: 1, formula: '' },
        },
      },
      type: { value: 'simpleM', baseItem: '' },
      properties: [],
      proficient: null,
      activities: {
        [activityId]: {
          _id: activityId,
          type: 'attack',
          activation: { type: 'action', value: null, override: false },
          consumption: { targets: [], scaling: { allowed: false, max: '' }, spellSlot: false },
          description: { chatFlavor: '' },
          duration: { units: 'inst', concentration: false, override: false },
          effects: [],
          range: { override: false, units: 'ft' },
          target: { prompt: true, template: { contiguous: false, units: 'ft' }, affects: { choice: false }, override: false },
          attack: {
            ability: '',
            bonus: '',
            critical: { threshold: null },
            flat: false,
            type: { value: 'melee', classification: 'weapon' },
          },
          damage: {
            critical: { bonus: '' },
            includeBase: true,
            parts: weaponData ? [{
              number: parseInt(String(weaponData.dmg).split('d')[0], 10) || 1,
              denomination: parseInt(String(weaponData.dmg).split('d')[1], 10) || 6,
              bonus: '',
              types: [weaponData.dmgType || 'slashing'],
              custom: { enabled: false, formula: '' },
              scaling: { mode: 'whole', number: 1, formula: '' },
            }] : [],
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

function buildBiography(canonicalBuild) {
  const bio = canonicalBuild?.identity?.biography || {};
  const lines = [];

  if (bio.trait) lines.push(`<p><em>Rasgo:</em> ${bio.trait}</p>`);
  if (bio.ideal) lines.push(`<p><em>Ideal:</em> ${bio.ideal}</p>`);
  if (bio.bond) lines.push(`<p><em>Vinculo:</em> ${bio.bond}</p>`);
  if (bio.flaw) lines.push(`<p><em>Defecto:</em> ${bio.flaw}</p>`);
  if (bio.notes) lines.push(`<p><em>Notas:</em> ${bio.notes}</p>`);

  return lines.join('');
}

function buildTraitData(canonicalBuild) {
  const primaryClassId = canonicalBuild?.classing?.classes?.[0]?.classId || '';
  const profs = CLASS_PROFS_BY_ID[primaryClassId] || { armor: [], weapons: [] };

  return {
    size: 'med',
    di: { value: [], custom: '', bypasses: [] },
    dr: { value: [], custom: '', bypasses: [] },
    dv: { value: [], custom: '', bypasses: [] },
    dm: { amount: {}, bypasses: [] },
    ci: { value: [], custom: '' },
    languages: { value: [], custom: '', communication: {} },
    weaponProf: {
      value: [],
      custom: profs.weapons.join(', '),
      mastery: { value: [], bonus: [] },
    },
    armorProf: {
      value: profs.armor.filter(type => ['light', 'medium', 'heavy'].includes(type)),
      custom: profs.armor.includes('shields') ? 'shields' : '',
    },
  };
}

function buildItems(canonicalBuild) {
  const backgroundFeats = (canonicalBuild?.background?.grantedFeatIds || []).map(featId =>
    buildFeatItem(featId, 'background')
  );
  const chosenFeats = (canonicalBuild?.choices?.feats || []).map(featId =>
    buildFeatItem(featId, 'feat')
  );
  const classFeatures = (canonicalBuild?.choices?.features || []).map(feature =>
    buildFeatItem(feature, 'class')
  );
  const primaryClassId = canonicalBuild?.classing?.classes?.[0]?.classId || '';
  const spellItems = (canonicalBuild?.choices?.spells || []).map(rawSpell => {
    const parsed = parseSpellEntry(rawSpell);
    return buildSpellItem(parsed.name, parsed.level, primaryClassId);
  });
  const weaponName = (canonicalBuild?.choices?.equipment || []).find(item => findWeaponData(item));
  const weaponItems = weaponName ? [buildWeaponItem(weaponName)] : [];

  return [
    ...buildClassItems(canonicalBuild),
    ...backgroundFeats,
    ...chosenFeats,
    ...classFeatures,
    ...spellItems,
    ...weaponItems,
  ];
}

export function buildFoundryActorPreview(canonicalBuild) {
  return {
    name: canonicalBuild?.identity?.characterName || 'New Character',
    type: 'character',
    img: 'systems/dnd5e/icons/svg/actors/character.svg',
    system: {
      bonuses: {
        mwak: { attack: '', damage: '' },
        rwak: { attack: '', damage: '' },
        msak: { attack: '', damage: '' },
        rsak: { attack: '', damage: '' },
        abilities: { check: '', save: '', skill: '' },
        spell: { dc: '' },
      },
      abilities: buildAbilities(canonicalBuild),
      skills: buildSkills(canonicalBuild),
      tools: {},
      attributes: {
        ac: { flat: canonicalBuild?.derived?.ac || 10 },
        hp: {
          value: canonicalBuild?.derived?.hp || 1,
          max: canonicalBuild?.derived?.hp || 1,
        },
        spellcasting: canonicalBuild?.derived?.spellcasting?.ability || '',
      },
      details: {
        alignment: canonicalBuild?.identity?.alignment || '',
        biography: { value: buildBiography(canonicalBuild), public: '' },
        race: canonicalBuild?.ancestry?.raceId || null,
        background: canonicalBuild?.background?.backgroundId || null,
        originalClass: canonicalBuild?.classing?.classes?.[0]?.classId || '',
        trait: canonicalBuild?.identity?.biography?.trait || '',
        appearance: '',
        ideal: canonicalBuild?.identity?.biography?.ideal || '',
        bond: canonicalBuild?.identity?.biography?.bond || '',
        flaw: canonicalBuild?.identity?.biography?.flaw || '',
      },
      spells: canonicalBuild?.derived?.spellcasting?.slots || {},
      traits: buildTraitData(canonicalBuild),
      resources: {
        primary: { value: 0, max: 0, sr: false, lr: false, label: '' },
        secondary: { value: 0, max: 0, sr: false, lr: false, label: '' },
        tertiary: { value: 0, max: 0, sr: false, lr: false, label: '' },
      },
      favorites: [],
    },
    items: buildItems(canonicalBuild),
    effects: [],
    flags: {
      'bertinis-vault': {
        sourceProfile: canonicalBuild?.meta?.sourceProfile || 'vault-v1',
        rulesVersion: canonicalBuild?.meta?.rulesVersion || '5e-2014',
      },
    },
  };
}
