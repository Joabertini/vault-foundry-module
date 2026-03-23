// ============================================================
// Bertini's Vault — Character Builder
// Converts form data into a complete Foundry VTT dnd5e 5.x actor
// ============================================================

import {
  SPELL_ABILITY, SPELL_PROGRESSION, SPELL_SLOTS_FULL,
  HIT_DICE, PB_BY_LEVEL, ARMOR_OPTIONS, WEAPON_OPTIONS
} from './data.js';
import { createCanonicalCharacterBuild } from './model-bridge.js';
import { buildFoundryActorPreview } from './foundry-export-bridge.js';
import { buildFoundryPreflightPreview } from './preflight-bridge.js';

/**
 * Calculates ability modifier
 */
export function abilityMod(score) {
  return Math.floor((parseInt(score) - 10) / 2);
}

/**
 * Calculates AC from armor selection and stats
 */
export function calculateAC(armorName, dexMod, hasShield, classKey) {
  const armor = ARMOR_OPTIONS.find(a => a.name === armorName);
  if (!armor) return 10 + dexMod + (hasShield ? 2 : 0);

  let base = 10;
  const formula = armor.formula;

  if (formula === '17') base = 17; // Tortle natural
  else if (formula === '18') base = 18;
  else if (formula === '17') base = 17;
  else if (formula === '16') base = 16;
  else if (formula === '13+DEX2') base = 13 + Math.min(dexMod, 2);
  else if (formula === '14+DEX2') base = 14 + Math.min(dexMod, 2);
  else if (formula === '15+DEX2') base = 15 + Math.min(dexMod, 2);
  else if (formula === '11+DEX') base = 11 + dexMod;
  else if (formula === '12+DEX') base = 12 + dexMod;
  else if (formula === '13+DEX') base = 13 + dexMod;
  else if (formula === '10+DEX') base = 10 + dexMod;
  else if (formula === 'special') {
    // Unarmored Defense — Barbarian: 10+DEX+CON, Monk: 10+DEX+WIS
    base = 10 + dexMod; // fallback
  }

  return base + (hasShield ? 2 : 0);
}

/**
 * Returns spell slots for a class+level combo
 */
function getSpellSlots(className, level) {
  const prog = SPELL_PROGRESSION[className] || 'none';
  const slots = {};
  for (let i = 1; i <= 9; i++) {
    slots[`spell${i}`] = { value: 0 };
  }
  if (prog === 'none') return slots;

  const effectiveLevel = prog === 'half' ? Math.floor(level / 2) : level;
  const table = SPELL_SLOTS_FULL[effectiveLevel] || SPELL_SLOTS_FULL[1];

  table.forEach((count, idx) => {
    slots[`spell${idx + 1}`] = { value: count };
  });

  if (prog === 'pact') {
    // Warlock pact slots
    const pactSlots = Math.min(2 + Math.floor((level - 1) / 4), 4);
    const pactLevel = Math.min(Math.ceil(level / 2), 5);
    for (let i = 1; i <= 9; i++) slots[`spell${i}`] = { value: 0 };
    slots[`spell${pactLevel}`] = { value: pactSlots };
  }

  return slots;
}

/**
 * Foundry _stats template for dnd5e 5.x
 */
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

/**
 * Builds a dnd5e 5.x ability object
 */
function makeAbility(value, proficient = 0) {
  return {
    value: parseInt(value) || 10,
    proficient,
    max: null,
    bonuses: { check: '', save: '' },
    check: { roll: { min: null, max: null, mode: 0 } },
    save:  { roll: { min: null, max: null, mode: 0 } },
  };
}

/**
 * Builds a skill object
 */
function makeSkill(ability, profValue = 0) {
  return {
    ability,
    roll: { min: null, max: null, mode: 0 },
    value: profValue,
    bonuses: { check: '', passive: '' },
  };
}

/**
 * Generates a random 16-char Foundry-style ID
 */
function makeId() {
  return Array.from({ length: 16 }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
      Math.floor(Math.random() * 62)
    ]
  ).join('');
}

/**
 * Main builder — converts form data into a complete Foundry actor object
 * @param {Object} formData - data collected from the Vault form
 * @returns {Object} - Foundry-compatible actor data
 */
export function buildActor(formData) {
  const {
    charName, playerName, level, alignment,
    cls, subclass, race, subrace,
    background, bgFeat,
    str, dex, con, int, wis, cha,
    levelFeats, dmFeat,
    cantrips, spells, features,
    armor, shield, weapon, weaponCustom, notes,
    trait, ideal, bond, flaw,
  } = formData;

  const lvl = parseInt(level) || 1;
  const pb  = PB_BY_LEVEL[lvl] ?? 2;
  const hd  = HIT_DICE[cls] || 8;

  // Mods
  const mods = {
    str: abilityMod(str), dex: abilityMod(dex), con: abilityMod(con),
    int: abilityMod(int), wis: abilityMod(wis), cha: abilityMod(cha),
  };

  // Estimated HP: max at level 1, average thereafter
  const hpMax = hd + mods.con + (lvl - 1) * (Math.floor(hd / 2) + 1 + mods.con);

  // AC
  const hasShield = shield === 'Sí (+2 CA)';
  const ac = calculateAC(armor, mods.dex, hasShield, cls);

  // Spell ability & DC
  const spellStat = SPELL_ABILITY[cls] || null;
  const spellMod  = spellStat ? mods[spellStat] : 0;
  const spellDC   = spellStat ? 8 + pb + spellMod : 0;
  const spellAtk  = spellStat ? pb + spellMod : 0;

  // ── Abilities ──
  const abilities = {
    str: makeAbility(str, 0),
    dex: makeAbility(dex, 0),
    con: makeAbility(con, 0),
    int: makeAbility(int, 0),
    wis: makeAbility(wis, 0),
    cha: makeAbility(cha, 0),
  };

  // Class-specific saving throw proficiencies
  const savingThrowProfs = {
    'Bárbaro':    ['str','con'], 'Bardo':   ['dex','cha'], 'Clérigo': ['wis','cha'],
    'Druida':     ['int','wis'], 'Explorador':['str','dex'],'Guerrero':['str','con'],
    'Hechicero':  ['con','cha'], 'Mago':    ['int','wis'], 'Monje':   ['str','dex'],
    'Paladín':    ['wis','cha'], 'Pícaro':  ['dex','int'], 'Brujo':   ['wis','cha'],
    'Artífice':   ['con','int'],
  };
  const saveProfs = savingThrowProfs[cls] || [];
  saveProfs.forEach(s => { if (abilities[s]) abilities[s].proficient = 1; });

  // ── Skills ──
  const skills = {
    acr: makeSkill('dex'), ani: makeSkill('wis'), arc: makeSkill('int'),
    ath: makeSkill('str'), dec: makeSkill('cha'), his: makeSkill('int'),
    ins: makeSkill('wis'), itm: makeSkill('cha'), inv: makeSkill('int'),
    med: makeSkill('wis'), nat: makeSkill('int'), prc: makeSkill('wis'),
    prf: makeSkill('cha'), per: makeSkill('cha'), rel: makeSkill('int'),
    slt: makeSkill('dex'), ste: makeSkill('dex'), sur: makeSkill('wis'),
  };

  // ── Spell slots ──
  const spellSlots = getSpellSlots(cls, lvl);
  const canonicalBuild = createCanonicalCharacterBuild(formData, {
    pb,
    hpMax,
    ac,
    spellStat,
    spellDC,
    spellAtk,
    spellSlots: Object.fromEntries(
      Object.entries(spellSlots).map(([slotKey, slotValue]) => [slotKey, slotValue.value])
    ),
  });
  const canonicalFoundryPreview = buildFoundryActorPreview(canonicalBuild);
  const canonicalPreflight = buildFoundryPreflightPreview(canonicalBuild);
  const previewSystem = canonicalFoundryPreview?.system || {};
  const previewAttributes = previewSystem.attributes || {};
  const previewDetails = previewSystem.details || {};
  const previewTraits = previewSystem.traits || {};
  const previewSkills = previewSystem.skills || {};
  const previewResources = previewSystem.resources || {};
  const previewFavorites = previewSystem.favorites || [];

  // ── Items ──
  const previewItems = Array.isArray(canonicalFoundryPreview?.items)
    ? canonicalFoundryPreview.items
    : [];
  const items = previewItems.length
    ? previewItems
    : (() => {
        const fallbackItems = [];
        const weaponName = weaponCustom || weapon;

        if (weaponName) {
          fallbackItems.push(buildWeaponItem(weaponName, cls, mods, pb, spellStat));
        }

        return fallbackItems;
      })();

  // ── System data ──
  const system = {
    currency: previewSystem.currency || { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
    abilities: canonicalFoundryPreview?.system?.abilities || abilities,
    bonuses: previewSystem?.bonuses || {
      mwak: { attack: '', damage: '' }, rwak: { attack: '', damage: '' },
      msak: { attack: '', damage: '' }, rsak: { attack: '', damage: '' },
      abilities: { check: '', save: '', skill: '' },
      spell: { dc: '' },
    },
    skills: Object.keys(previewSkills).length ? previewSkills : skills,
    tools: previewSystem?.tools || {},
    spells: canonicalFoundryPreview?.system?.spells || spellSlots,
    attributes: {
      ...previewAttributes,
      ac: {
        calc: 'flat',
        flat: previewAttributes?.ac?.flat ?? ac,
      },
      init: previewAttributes?.init || { ability: '', roll: { min: null, max: null, mode: 0 }, bonus: '' },
      movement: previewAttributes?.movement || { units: null, hover: false, ignoredDifficultTerrain: [] },
      attunement: previewAttributes?.attunement || { max: 3 },
      senses: previewAttributes?.senses || { darkvision: null, blindsight: null, tremorsense: null, truesight: null, units: null, special: '' },
      spellcasting: previewAttributes?.spellcasting ?? spellStat ?? '',
      exhaustion: previewAttributes?.exhaustion ?? 0,
      concentration: previewAttributes?.concentration || {
        ability: '', roll: { min: null, max: null, mode: 0 },
        bonuses: { save: '' }, limit: 1,
      },
      loyalty: previewAttributes?.loyalty || {},
      hp: {
        ...(previewAttributes?.hp || {}),
        max: previewAttributes?.hp?.max ?? null,
        temp: null,
        tempmax: 0,
        value: previewAttributes?.hp?.value ?? hpMax,
        bonuses: {},
      },
      death: previewAttributes?.death || { roll: { min: null, max: null, mode: 0 }, success: 0, failure: 0, bonuses: { save: '' } },
      inspiration: previewAttributes?.inspiration ?? false,
    },
    bastion: previewSystem.bastion || { name: '', description: '' },
    details: {
      ...previewDetails,
      biography: previewDetails?.biography || { value: buildBiography(formData, { pb, ac, hpMax, spellDC, spellAtk }), public: '' },
      alignment: previewDetails?.alignment ?? alignment || '',
      trait: previewDetails?.trait ?? trait || '',
      ideal: previewDetails?.ideal ?? ideal || '',
      bond: previewDetails?.bond ?? bond || '',
      flaw: previewDetails?.flaw ?? flaw || '',
      race: previewDetails?.race ?? null,
      background: previewDetails?.background ?? null,
      originalClass: previewDetails?.originalClass ?? '',
      xp: { value: 0 },
      appearance: previewDetails?.appearance ?? '',
      eyes: '', height: '', faith: '', hair: '', weight: '', gender: '', skin: '', age: '',
    },
    traits: {
      ...previewTraits,
      size: previewTraits?.size ?? 'med',
      di: previewTraits?.di ?? { value: [], custom: '', bypasses: [] },
      dr: previewTraits?.dr ?? { value: [], custom: '', bypasses: [] },
      dv: previewTraits?.dv ?? { value: [], custom: '', bypasses: [] },
      dm: previewTraits?.dm ?? { amount: {}, bypasses: [] },
      ci: previewTraits?.ci ?? { value: [], custom: '' },
      languages: previewTraits?.languages ?? { value: [], custom: '', communication: {} },
      weaponProf: previewTraits?.weaponProf ?? { value: [], custom: '', mastery: { value: [], bonus: [] } },
      armorProf:  previewTraits?.armorProf ?? { value: [], custom: '' },
    },
    resources: Object.keys(previewResources).length ? previewResources : {
      primary:   { value: 0, max: 0, sr: false, lr: false, label: '' },
      secondary: { value: 0, max: 0, sr: false, lr: false, label: '' },
      tertiary:  { value: 0, max: 0, sr: false, lr: false, label: '' },
    },
    favorites: previewFavorites,
  };

  return {
    name: charName || 'New Character',
    type: 'character',
    img: 'systems/dnd5e/icons/svg/actors/character.svg',
    system,
    prototypeToken: buildToken(charName),
    items,
    effects: [],
    folder: null,
    flags: {
      'bertinis-vault': {
        createdBy: playerName,
        version: '0.1.0',
        canonicalBuild,
        canonicalFoundryPreview,
        canonicalPreflight,
      },
    },
    _stats: makeStats(),
    ownership: { default: 0 },
  };
}

// ── Item builders ──────────────────────────────────────────────────

function buildClassItem(cls, subclass, level, hd, spellStat, pb) {
  const prog = SPELL_PROGRESSION[cls] || 'none';
  return {
    _id: makeId(), name: cls, type: 'class',
    img: 'systems/dnd5e/icons/svg/items/class.svg',
    system: {
      identifier: cls.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-'),
      description: { value: `<p>${cls}${subclass && subclass !== 'Sin subclase aún' ? ' — ' + subclass : ''}</p>`, chat: '' },
      source: { custom: '', book: "PHB'14", page: '', license: '', rules: '2014', revision: 1 },
      levels: level,
      hd: { denomination: `d${hd}`, spent: 0, additional: '' },
      spellcasting: { progression: prog, ability: spellStat || '', preparation: {} },
      primaryAbility: { value: [spellStat || 'str'], all: false },
      wealth: '', advancement: [], startingEquipment: [], properties: [],
    },
    flags: {}, effects: [], _stats: makeStats(), folder: null, sort: 0, ownership: { default: 0 },
  };
}

function buildFeatItem(name, featType = 'class') {
  return {
    _id: makeId(), name, type: 'feat',
    img: 'icons/svg/item-bag.svg',
    system: {
      source: { custom: '', book: '', page: '', license: '', rules: '2014', revision: 1 },
      description: { value: '', chat: '' },
      requirements: '',
      uses: { max: '', recovery: [], spent: 0 },
      type: { value: featType, subtype: '' },
      properties: [], advancement: [], activities: {},
      identifier: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s/]/g, '-'),
      crewed: false, enchant: {}, prerequisites: { items: [], repeatable: false },
    },
    flags: {}, effects: [], _stats: makeStats(), folder: null, sort: 0, ownership: { default: 0 },
  };
}

function buildWeaponItem(weaponName, cls, mods, pb, spellStat) {
  const weaponData = WEAPON_OPTIONS.find(w => weaponName.toLowerCase().includes(w.name.toLowerCase()));
  const atkMod = spellStat && weaponName.toLowerCase().includes('shillelagh')
    ? pb + mods[spellStat]
    : pb + Math.max(mods.str, mods.dex);

  const dmgParts = weaponData
    ? [{ number: weaponData.dmg.split('d')[0] ? parseInt(weaponData.dmg.split('d')[0]) : 1,
         denomination: parseInt(weaponData.dmg.split('d')[1]) || 6,
         bonus: '', types: [weaponData.dmgType || 'slashing'],
         custom: { enabled: false, formula: '' },
         scaling: { mode: 'whole', number: 1, formula: '' } }]
    : [];

  const activityId = 'dnd5eactivity000';
  return {
    _id: makeId(), name: weaponName, type: 'weapon',
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
      damage: { base: { number: dmgParts[0]?.number || 1, denomination: dmgParts[0]?.denomination || 6, bonus: '', types: dmgParts[0]?.types || [], custom: { enabled: false }, scaling: { mode: 'whole', number: 1, formula: '' } } },
      type: { value: 'simpleM', baseItem: '' },
      properties: [],
      proficient: null,
      activities: {
        [activityId]: {
          _id: activityId, type: 'attack',
          activation: { type: 'action', value: null, override: false },
          consumption: { targets: [], scaling: { allowed: false, max: '' }, spellSlot: false },
          description: { chatFlavor: '' },
          duration: { units: 'inst', concentration: false, override: false },
          effects: [],
          range: { override: false, units: 'ft' },
          target: { prompt: true, template: { contiguous: false, units: 'ft' }, affects: { choice: false }, override: false },
          attack: {
            ability: '', bonus: '', critical: { threshold: null }, flat: false,
            type: { value: 'melee', classification: 'weapon' },
          },
          damage: {
            critical: { bonus: '' }, includeBase: true,
            parts: dmgParts.length ? [{ ...dmgParts[0] }] : [],
          },
          uses: { spent: 0, recovery: [] },
          sort: 0, flags: {},
        },
      },
      identifier: weaponName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    },
    flags: {}, effects: [], _stats: makeStats(), folder: null, sort: 0, ownership: { default: 0 },
  };
}

function buildSpellItem(name, level, cls) {
  const actId = 'dnd5eactivity000';
  const spellAb = SPELL_ABILITY[cls] || 'int';
  return {
    _id: makeId(), name, type: 'spell',
    img: 'icons/svg/book.svg',
    system: {
      source: { custom: '', book: '', page: '', license: '', rules: '2014', revision: 1 },
      description: { value: '', chat: '' },
      level,
      school: 'evo',
      properties: level === 0 ? ['vocal','somatic'] : ['vocal','somatic'],
      ability: spellAb,
      materials: { value: '', consumed: false, cost: 0, supply: 0 },
      target: { template: { contiguous: false, units: 'ft' }, affects: { count: '1', type: 'creature', choice: false } },
      range: { value: null, units: 'ft' },
      activation: { type: 'action', value: 1, condition: '' },
      duration: { value: '', units: 'inst' },
      uses: { max: '', recovery: [], spent: 0 },
      method: 'spell',
      prepared: level === 0 ? 2 : 1,
      sourceClass: cls.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      activities: {
        [actId]: {
          _id: actId, type: 'utility',
          activation: { type: 'action', value: null, override: false },
          consumption: { targets: [], scaling: { allowed: false, max: '' }, spellSlot: true },
          description: { chatFlavor: '' },
          duration: { units: 'inst', concentration: false, override: false },
          effects: [],
          range: { override: false, units: 'ft' },
          target: { prompt: true, template: { contiguous: false, units: 'ft' }, affects: { choice: false }, override: false },
          uses: { spent: 0, recovery: [] },
          sort: 0, flags: {},
        },
      },
      identifier: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s/]/g, '-'),
    },
    flags: {}, effects: [], _stats: makeStats(), folder: null, sort: 0, ownership: { default: 0 },
  };
}

function parseAndBuildSpells(cantripText, spellText, cls) {
  const items = [];
  if (cantripText) {
    cantripText.split('\n').filter(Boolean).forEach(name => {
      items.push(buildSpellItem(name.trim(), 0, cls));
    });
  }
  if (spellText) {
    spellText.split('\n').filter(Boolean).forEach(line => {
      const match = line.match(/^(?:Nv(\d+):\s*)?(.+)$/i);
      if (!match) return;
      const lvl = match[1] ? parseInt(match[1]) : 1;
      const name = match[2].trim();
      items.push(buildSpellItem(name, lvl, cls));
    });
  }
  return items;
}

function buildToken(name) {
  return {
    name: name || 'New Character',
    displayName: 0, actorLink: true, width: 1, height: 1,
    texture: {
      src: 'systems/dnd5e/icons/svg/actors/character.svg',
      anchorX: 0.5, anchorY: 0.5, offsetX: 0, offsetY: 0,
      fit: 'contain', scaleX: 1, scaleY: 1, rotation: 0,
      tint: '#ffffff', alphaThreshold: 0.75,
    },
    lockRotation: false, rotation: 0, alpha: 1, disposition: 1, displayBars: 0,
    bar1: { attribute: 'attributes.hp' }, bar2: { attribute: null },
    light: {
      negative: false, priority: 0, alpha: 0.5, angle: 360,
      bright: 0, color: null, coloration: 1, dim: 0,
      attenuation: 0.5, luminosity: 0.5, saturation: 0, contrast: 0, shadows: 0,
      animation: { type: null, speed: 5, intensity: 5, reverse: false },
      darkness: { min: 0, max: 1 },
    },
    sight: { enabled: true, range: 0, angle: 360, visionMode: 'basic', color: null, attenuation: 0.1, brightness: 0, saturation: 0, contrast: 0 },
    detectionModes: [], occludable: { radius: 0 },
    ring: { enabled: false, colors: { ring: null, background: null }, effects: 1, subject: { scale: 1, texture: null } },
    turnMarker: { mode: 1, animation: null, src: null, disposition: false },
    movementAction: null, flags: {}, randomImg: false, appendNumber: false, prependAdjective: false,
  };
}

function buildBiography(data, stats) {
  return `
    <p><strong>Jugador:</strong> ${data.playerName || '—'}</p>
    <p><strong>Trasfondo:</strong> ${data.background || '—'} | <strong>Alineamiento:</strong> ${data.alignment || '—'}</p>
    <p><strong>Stats calculados:</strong> CA ${stats.ac} | HP ~${stats.hpMax} | PB +${stats.pb}${stats.spellDC ? ' | DC ' + stats.spellDC : ''}</p>
    ${data.trait ? `<p><em>Rasgo:</em> ${data.trait}</p>` : ''}
    ${data.ideal ? `<p><em>Ideal:</em> ${data.ideal}</p>` : ''}
    ${data.bond  ? `<p><em>Vínculo:</em> ${data.bond}</p>` : ''}
    ${data.flaw  ? `<p><em>Defecto:</em> ${data.flaw}</p>` : ''}
    ${data.notes ? `<p><em>Notas:</em> ${data.notes}</p>` : ''}
  `.trim();
}
