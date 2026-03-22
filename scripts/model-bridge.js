// ============================================================
// Bertini's Vault - Canonical Model Bridge
// Temporary bridge between the legacy Foundry form and the new
// CharacterBuild canonical model.
// ============================================================

function normalizeLabel(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s()-]/g, '')
    .replace(/\s+/g, ' ');
}

function slugifyId(value) {
  return normalizeLabel(value)
    .replace(/[()\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const CLASS_ID_MAP = {
  barbaro: 'barbarian',
  bardo: 'bard',
  clerigo: 'cleric',
  druida: 'druid',
  explorador: 'ranger',
  guerrero: 'fighter',
  hechicero: 'sorcerer',
  mago: 'wizard',
  monje: 'monk',
  paladin: 'paladin',
  picaro: 'rogue',
  brujo: 'warlock',
  artifice: 'artificer',
  artificer: 'artificer',
  artificee: 'artificer',
};

const RACE_ID_MAP = {
  humano: 'human',
  elfo: 'elf',
  'semi-elfo': 'half-elf',
  enano: 'dwarf',
  mediano: 'halfling',
  semiorco: 'half-orc',
  gnomo: 'gnome',
  tiefling: 'tiefling',
  draconido: 'dragonborn',
  aasimar: 'aasimar',
  tortle: 'tortle',
  firbolg: 'firbolg',
  harengon: 'harengon',
  tabaxi: 'tabaxi',
  genasi: 'genasi',
  goliath: 'goliath',
  kenku: 'kenku',
  githyanki: 'githyanki',
  githzerai: 'githzerai',
  leonin: 'leonin',
  satyr: 'satyr',
  fairy: 'fairy',
  owlfolk: 'owlfolk',
  rabbitfolk: 'rabbitfolk',
};

const BACKGROUND_ID_MAP = {
  acolito: 'acolyte',
  charlatan: 'charlatan',
  criminal: 'criminal',
  entretenido: 'entertainer',
  'heroe del pueblo': 'folk-hero',
  'artesano de gremio': 'guild-artisan',
  ermitano: 'hermit',
  noble: 'noble',
  forastero: 'outlander',
  erudito: 'sage',
  marinero: 'sailor',
  soldado: 'soldier',
  urchin: 'urchin',
  'lorehold student': 'lorehold-student',
  'prismari student': 'prismari-student',
  'quandrix student': 'quandrix-student',
  'silverquill student': 'silverquill-student',
  'witherbloom student': 'witherbloom-student',
  'knight of solamnia': 'knight-of-solamnia',
  'mage of high sorcery': 'mage-of-high-sorcery',
  wildspacer: 'wildspacer',
  'gate crasher': 'gate-crasher',
  'gate warden': 'gate-warden',
  'planar philosopher': 'planar-philosopher',
  'giant foundling': 'giant-foundling',
  runecrafter: 'runecrafter',
  'otro personalizado': 'custom',
  'otro personalizad': 'custom',
};

function resolveClassId(label) {
  const normalized = normalizeLabel(label);
  return CLASS_ID_MAP[normalized] || slugifyId(label);
}

function resolveRaceId(label) {
  const normalized = normalizeLabel(label);
  return RACE_ID_MAP[normalized] || slugifyId(label);
}

function resolveBackgroundId(label) {
  const normalized = normalizeLabel(label);
  return BACKGROUND_ID_MAP[normalized] || slugifyId(label);
}

function toAbilityMap(formData) {
  return {
    str: parseInt(formData.str, 10) || 10,
    dex: parseInt(formData.dex, 10) || 10,
    con: parseInt(formData.con, 10) || 10,
    int: parseInt(formData.int, 10) || 10,
    wis: parseInt(formData.wis, 10) || 10,
    cha: parseInt(formData.cha, 10) || 10,
  };
}

function parseCommaList(text) {
  return String(text || '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
}

function parseLineList(text) {
  return String(text || '')
    .split('\n')
    .map(part => part.trim())
    .filter(Boolean);
}

function parseSpellEntry(raw) {
  const match = String(raw || '').trim().match(/^Nv(\d+):\s*(.+)$/i);
  if (!match) {
    return { label: String(raw || '').trim(), level: 1 };
  }

  return {
    label: match[2].trim(),
    level: parseInt(match[1], 10) || 1,
  };
}

export function createCanonicalCharacterBuild(formData, derived = {}) {
  const now = new Date().toISOString();
  const baseAbilities = toAbilityMap(formData);
  const backgroundFeatIds = formData.bgFeat ? [slugifyId(formData.bgFeat)] : [];
  const selectedFeatIds = [];
  const cantripNames = parseLineList(formData.cantrips);
  const spellLines = parseLineList(formData.spells);
  const featureLines = parseLineList(formData.features);
  const equipmentLines = [formData.armor, formData.weaponCustom || formData.weapon, formData.shield]
    .filter(Boolean)
    .map(item => String(item).trim());

  if (formData.dmFeat && formData.dmFeat !== 'Ninguna') {
    selectedFeatIds.push(slugifyId(formData.dmFeat));
  }

  parseCommaList(formData.levelFeats).forEach(entry => {
    const featName = entry.replace(/Nivel \d+:\s*/i, '').trim();
    if (featName && !featName.includes('ASI')) selectedFeatIds.push(slugifyId(featName));
  });

  return {
    meta: {
      rulesVersion: '5e-2014',
      sourceProfile: 'vault-v1',
      createdAt: now,
      updatedAt: now,
    },
    identity: {
      characterName: formData.charName || 'New Character',
      playerName: formData.playerName || undefined,
      alignment: formData.alignment || undefined,
      biography: {
        trait: formData.trait || undefined,
        ideal: formData.ideal || undefined,
        bond: formData.bond || undefined,
        flaw: formData.flaw || undefined,
        notes: formData.notes || undefined,
      },
    },
    ancestry: {
      raceId: resolveRaceId(formData.race),
      subraceId: formData.subrace ? slugifyId(formData.subrace) : undefined,
    },
    classing: {
      classes: [{
        classId: resolveClassId(formData.cls),
        subclassId: formData.subclass && formData.subclass !== 'Sin subclase aún'
          ? slugifyId(formData.subclass)
          : undefined,
        level: parseInt(formData.level, 10) || 1,
      }],
    },
    background: {
      backgroundId: resolveBackgroundId(formData.background),
      grantedFeatIds: backgroundFeatIds,
    },
    abilities: {
      generationMethod: 'manual',
      base: baseAbilities,
      final: baseAbilities,
    },
    choices: {
      feats: selectedFeatIds,
      proficiencies: [],
      spells: [
        ...cantripNames.map(name => `Nv0: ${name}`),
        ...spellLines,
      ],
      equipment: equipmentLines,
      features: featureLines,
      normalized: {
        feats: selectedFeatIds,
        proficiencies: [],
        spells: [
          ...cantripNames.map(label => ({ label, level: 0 })),
          ...spellLines.map(parseSpellEntry),
        ],
        equipment: equipmentLines.map(label => ({ label, category: 'other' })),
        features: featureLines.map(label => ({ label, source: 'other' })),
      },
    },
    derived: {
      proficiencyBonus: derived.pb || 2,
      hp: derived.hpMax || 1,
      ac: derived.ac || 10,
      ...(derived.spellStat ? {
        spellcasting: {
          ability: derived.spellStat,
          attackBonus: derived.spellAtk || 0,
          saveDC: derived.spellDC || 0,
          slots: derived.spellSlots || {},
        },
      } : {}),
    },
  };
}
