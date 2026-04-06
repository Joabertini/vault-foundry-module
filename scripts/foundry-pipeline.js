// ============================================================
// Bertini's Vault - Foundry Export Pipeline
// Transitional shared pipeline for the legacy Foundry runtime.
// ============================================================

import {
  SPELL_ABILITY,
  SPELL_PROGRESSION,
  SPELL_SLOTS_FULL,
  HIT_DICE,
  PB_BY_LEVEL,
  ARMOR_OPTIONS,
} from './data.js';
import { createCanonicalCharacterBuild } from './model-bridge.js';
import { buildFoundryActorPreview } from './foundry-export-bridge.js';
import { buildFoundryPreflightPreview } from './preflight-bridge.js';

export function abilityMod(score) {
  return Math.floor((parseInt(score, 10) - 10) / 2);
}

export function calculateAC(armorName, dexMod, hasShield) {
  const armor = ARMOR_OPTIONS.find((entry) => entry.name === armorName);
  if (!armor) return 10 + dexMod + (hasShield ? 2 : 0);

  let base = 10;
  const formula = armor.formula;

  if (formula === '17') base = 17;
  else if (formula === '18') base = 18;
  else if (formula === '16') base = 16;
  else if (formula === '13+DEX2') base = 13 + Math.min(dexMod, 2);
  else if (formula === '14+DEX2') base = 14 + Math.min(dexMod, 2);
  else if (formula === '15+DEX2') base = 15 + Math.min(dexMod, 2);
  else if (formula === '11+DEX') base = 11 + dexMod;
  else if (formula === '12+DEX') base = 12 + dexMod;
  else if (formula === '13+DEX') base = 13 + dexMod;
  else if (formula === '10+DEX') base = 10 + dexMod;
  else if (formula === 'special') base = 10 + dexMod;

  return base + (hasShield ? 2 : 0);
}

function getSpellSlots(className, level) {
  const progression = SPELL_PROGRESSION[className] || 'none';
  const slots = {};

  for (let index = 1; index <= 9; index += 1) {
    slots[`spell${index}`] = { value: 0 };
  }

  if (progression === 'none') return slots;

  const effectiveLevel = progression === 'half' ? Math.floor(level / 2) : level;
  const table = SPELL_SLOTS_FULL[effectiveLevel] || SPELL_SLOTS_FULL[1];

  table.forEach((count, index) => {
    slots[`spell${index + 1}`] = { value: count };
  });

  if (progression === 'pact') {
    const pactSlots = Math.min(2 + Math.floor((level - 1) / 4), 4);
    const pactLevel = Math.min(Math.ceil(level / 2), 5);
    for (let index = 1; index <= 9; index += 1) {
      slots[`spell${index}`] = { value: 0 };
    }
    slots[`spell${pactLevel}`] = { value: pactSlots };
  }

  return slots;
}

export function deriveLegacyFormValues(formData) {
  const lvl = parseInt(formData.level, 10) || 1;
  const pb = PB_BY_LEVEL[lvl] ?? 2;
  const hd = HIT_DICE[formData.cls] || 8;
  const mods = {
    str: abilityMod(formData.str),
    dex: abilityMod(formData.dex),
    con: abilityMod(formData.con),
    int: abilityMod(formData.int),
    wis: abilityMod(formData.wis),
    cha: abilityMod(formData.cha),
  };
  const hpMax = hd + mods.con + (lvl - 1) * (Math.floor(hd / 2) + 1 + mods.con);
  const hasShield = formData.shield === 'SÃ­ (+2 CA)' || formData.shield === 'SÃƒÂ­ (+2 CA)';
  const ac = calculateAC(formData.armor, mods.dex, hasShield);
  const spellStat = SPELL_ABILITY[formData.cls] || null;
  const spellMod = spellStat ? mods[spellStat] : 0;
  const spellDC = spellStat ? 8 + pb + spellMod : 0;
  const spellAtk = spellStat ? pb + spellMod : 0;
  const spellSlots = getSpellSlots(formData.cls, lvl);

  return {
    lvl,
    pb,
    hd,
    mods,
    hpMax,
    ac,
    spellStat,
    spellDC,
    spellAtk,
    spellSlots,
  };
}

export function buildCanonicalExportArtifacts(formData) {
  const derived = deriveLegacyFormValues(formData);
  const canonicalBuild = createCanonicalCharacterBuild(formData, {
    pb: derived.pb,
    hpMax: derived.hpMax,
    ac: derived.ac,
    spellStat: derived.spellStat,
    spellDC: derived.spellDC,
    spellAtk: derived.spellAtk,
    spellSlots: Object.fromEntries(
      Object.entries(derived.spellSlots).map(([slotKey, slotValue]) => [slotKey, slotValue.value]),
    ),
  });
  const canonicalFoundryPreview = buildFoundryActorPreview(canonicalBuild);
  const canonicalPreflight = buildFoundryPreflightPreview(canonicalBuild);

  return {
    derived,
    canonicalBuild,
    canonicalFoundryPreview,
    canonicalPreflight,
  };
}

export function buildActorCreateData(formData) {
  const artifacts = buildCanonicalExportArtifacts(formData);

  return {
    ...artifacts.canonicalFoundryPreview,
    flags: {
      ...(artifacts.canonicalFoundryPreview?.flags || {}),
      'bertinis-vault': {
        ...(artifacts.canonicalFoundryPreview?.flags?.['bertinis-vault'] || {}),
        createdBy: formData.playerName,
        version: '0.1.0',
        canonicalBuild: artifacts.canonicalBuild,
        canonicalFoundryPreview: artifacts.canonicalFoundryPreview,
        canonicalPreflight: artifacts.canonicalPreflight,
      },
    },
    canonicalBuild: artifacts.canonicalBuild,
    canonicalFoundryPreview: artifacts.canonicalFoundryPreview,
    canonicalPreflight: artifacts.canonicalPreflight,
  };
}
