// ============================================================
// Bertini's Vault - Preflight Bridge
// Temporary JS bridge that mirrors the shared preflight flow
// for the legacy Foundry runtime.
// ============================================================

const KNOWN_CLASS_IDS = new Set([
  'artificer',
  'barbarian',
  'bard',
  'cleric',
  'druid',
  'fighter',
  'monk',
  'paladin',
  'ranger',
  'rogue',
  'sorcerer',
  'warlock',
  'wizard',
]);

const KNOWN_RACE_IDS = new Set([
  'human',
  'elf',
  'half-elf',
  'dwarf',
  'halfling',
  'half-orc',
  'gnome',
  'tiefling',
  'dragonborn',
  'aasimar',
  'tortle',
  'firbolg',
  'harengon',
  'tabaxi',
  'genasi',
  'goliath',
  'kenku',
  'githyanki',
  'githzerai',
  'leonin',
  'satyr',
  'fairy',
  'owlfolk',
  'rabbitfolk',
]);

const KNOWN_BACKGROUND_IDS = new Set([
  'acolyte',
  'charlatan',
  'criminal',
  'entertainer',
  'folk-hero',
  'guild-artisan',
  'hermit',
  'noble',
  'outlander',
  'sage',
  'sailor',
  'soldier',
  'urchin',
  'lorehold-student',
  'prismari-student',
  'quandrix-student',
  'silverquill-student',
  'witherbloom-student',
  'knight-of-solamnia',
  'mage-of-high-sorcery',
  'wildspacer',
  'gate-crasher',
  'gate-warden',
  'planar-philosopher',
  'giant-foundling',
  'runecrafter',
  'custom',
]);

const KNOWN_FEAT_IDS = new Set([
  'alert',
  'magic-initiate',
  'resilient',
  'telekinetic',
  'war-caster',
  'tough',
  'tavern-brawler',
]);

const KNOWN_SPELL_IDS = new Set([
  'mage-hand',
  'prestidigitation',
  'ray-of-frost',
  'fire-bolt',
  'minor-illusion',
  'guidance',
  'eldritch-blast',
  'sacred-flame',
  'shield',
  'magic-missile',
  'cure-wounds',
  'guiding-bolt',
  'hex',
  'burning-hands',
  'misty-step',
  'mirror-image',
  'scorching-ray',
  'hold-person',
  'fireball',
  'counterspell',
  'fly',
  'revivify',
]);

const KNOWN_EQUIPMENT_IDS = new Set([
  'unarmored',
  'mage-armor',
  'leather',
  'chain-mail',
  'shield',
  'dagger',
  'mace',
  'quarterstaff',
  'longsword',
  'shortbow',
  'spellbook',
  'component-pouch',
  'arcane-focus',
  'holy-symbol',
  'thieves-tools',
  'explorers-pack',
  'dungeoneers-pack',
  'rope-hempen',
  'torch',
  'rations',
  'waterskin',
]);

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s/-]/g, '')
    .trim()
    .replace(/[\s/]+/g, '-');
}

function makeIssue(code, message, severity, path, extra = {}) {
  return {
    code,
    message,
    severity,
    path,
    ...extra,
  };
}

function summarize(issues) {
  const blockers = issues.filter(issue => issue.severity === 'blocker').length;
  const warnings = issues.filter(issue => issue.severity === 'warning').length;
  const info = issues.filter(issue => issue.severity === 'info').length;

  return {
    blockers,
    warnings,
    info,
    total: issues.length,
  };
}

export function buildFoundryPreflightPreview(canonicalBuild) {
  const issues = [];

  const classEntries = canonicalBuild?.classing?.classes || [];
  classEntries.forEach((entry, index) => {
    if (!KNOWN_CLASS_IDS.has(entry.classId)) {
      issues.push(makeIssue(
        'UNKNOWN_CLASS_ID',
        `Class id "${entry.classId}" is not supported by the shared catalog.`,
        'blocker',
        `classing.classes[${index}].classId`,
      ));
    }
  });

  if (!KNOWN_RACE_IDS.has(canonicalBuild?.ancestry?.raceId)) {
    issues.push(makeIssue(
      'UNKNOWN_RACE_ID',
      `Race id "${canonicalBuild?.ancestry?.raceId}" is not supported by the shared catalog.`,
      'blocker',
      'ancestry.raceId',
    ));
  }

  if (!KNOWN_BACKGROUND_IDS.has(canonicalBuild?.background?.backgroundId)) {
    issues.push(makeIssue(
      'UNKNOWN_BACKGROUND_ID',
      `Background id "${canonicalBuild?.background?.backgroundId}" is not supported by the shared catalog.`,
      'blocker',
      'background.backgroundId',
    ));
  }

  (canonicalBuild?.background?.grantedFeatIds || []).forEach((featId, index) => {
    if (!KNOWN_FEAT_IDS.has(featId)) {
      issues.push(makeIssue(
        'UNKNOWN_GRANTED_FEAT_ID',
        `Granted feat id "${featId}" is not currently recognized by the shared catalog.`,
        'warning',
        `background.grantedFeatIds[${index}]`,
      ));
    }
  });

  (canonicalBuild?.choices?.feats || []).forEach((featId, index) => {
    if (!KNOWN_FEAT_IDS.has(featId)) {
      issues.push(makeIssue(
        'UNKNOWN_CHOSEN_FEAT_ID',
        `Chosen feat id "${featId}" is not currently recognized by the shared catalog.`,
        'warning',
        `choices.feats[${index}]`,
      ));
    }
  });

  const normalizedSpells = canonicalBuild?.choices?.normalized?.spells || [];
  normalizedSpells.forEach((spell, index) => {
    const lookupId = spell.spellId || slugify(spell.label);
    if (!KNOWN_SPELL_IDS.has(lookupId)) {
      issues.push(makeIssue(
        'UNRESOLVED_SPELL',
        `Spell "${spell.label}" could not be resolved for Foundry export.`,
        'warning',
        `choices.normalized.spells[${index}]`,
      ));
    }
  });

  const normalizedEquipment = canonicalBuild?.choices?.normalized?.equipment || [];
  normalizedEquipment.forEach((item, index) => {
    const lookupId = item.itemId || slugify(item.label);
    if (!KNOWN_EQUIPMENT_IDS.has(lookupId)) {
      issues.push(makeIssue(
        'UNRESOLVED_EQUIPMENT',
        `Equipment "${item.label}" could not be resolved for Foundry export.`,
        'warning',
        `choices.normalized.equipment[${index}]`,
      ));
    }
  });

  const summary = summarize(issues);

  return {
    ok: summary.blockers === 0,
    generatedAt: new Date().toISOString(),
    target: {
      rulesVersion: canonicalBuild?.meta?.rulesVersion || '5e-2014',
      sourceProfile: canonicalBuild?.meta?.sourceProfile || 'vault-v1',
      foundryVersion: '13.351',
      systemId: 'dnd5e',
      systemVersion: '5.2.5',
      moduleVersion: '0.1.0',
    },
    issues,
    summary,
  };
}

export function formatPreflightIssues(preflight, limit = 3) {
  return (preflight?.issues || [])
    .slice(0, limit)
    .map(issue => issue.path ? `${issue.code} (${issue.path})` : issue.code)
    .join(', ');
}
