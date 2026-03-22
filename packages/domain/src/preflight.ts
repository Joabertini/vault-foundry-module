import {
  type CharacterBuild,
  type CharacterBuildInput,
  characterBuildSchema,
  characterBuildInputSchema,
  preflightResultSchema,
  type PreflightIssue,
  type PreflightResult,
} from "@bertinis-vault/contracts";
import {
  getBackgroundCatalogEntry,
  getClassCatalogEntry,
  getFeatCatalogEntry,
  getArmorCatalogEntry,
  getGearCatalogEntry,
  getRaceCatalogEntry,
  getSpellCatalogEntry,
  getWeaponCatalogEntry,
} from "@bertinis-vault/data-engine";
import { abilityModifierMap } from "./abilities.js";
import { getSpellAbilityForClass, getSpellSlotsForClassLevel } from "./dnd5e-2014.js";
import {
  normalizeProficiencyLabel,
  resolveLanguageId,
  resolveSkillId,
  resolveToolEntry,
} from "./proficiencies.js";
import { getCharacterLevel, getProficiencyBonus } from "./progression.js";

type PreflightOptions = {
  generatedAt?: string;
  target?: PreflightResult["target"];
};

function buildPath(path: Array<string | number>) {
  if (!path.length) {
    return undefined;
  }

  return path.reduce<string>((accumulator, segment) => {
    if (typeof segment === "number") {
      return `${accumulator}[${segment}]`;
    }

    return accumulator ? `${accumulator}.${segment}` : segment;
  }, "");
}

function summarizeIssues(issues: PreflightIssue[]) {
  const blockers = issues.filter((issue) => issue.severity === "blocker").length;
  const warnings = issues.filter((issue) => issue.severity === "warning").length;
  const info = issues.filter((issue) => issue.severity === "info").length;

  return {
    blockers,
    warnings,
    info,
    total: issues.length,
  };
}

function makeIssue(issue: PreflightIssue): PreflightIssue {
  return issue;
}

function validateCanonicalCatalogs(character: CharacterBuild) {
  const issues: PreflightIssue[] = [];
  const totalLevels = character.classing.classes.reduce((sum, entry) => sum + entry.level, 0);
  const seenClassIds = new Set<string>();

  if (totalLevels > 20) {
    issues.push(makeIssue({
      code: "TOTAL_LEVEL_EXCEEDS_20",
      message: `Total class levels add up to ${totalLevels}, which exceeds the 5e maximum of 20.`,
      severity: "blocker",
      scope: "canonical-build",
      path: "classing.classes",
      source: "domain",
      details: {
        totalLevels,
      },
    }));
  }

  for (const [index, entry] of character.classing.classes.entries()) {
    if (seenClassIds.has(entry.classId)) {
      issues.push(makeIssue({
        code: "DUPLICATE_CLASS_ID",
        message: `Class id "${entry.classId}" appears more than once in classing.classes; multiclass entries should be unique per class.` ,
        severity: "warning",
        scope: "canonical-build",
        path: `classing.classes[${index}].classId`,
        source: "domain",
        canonicalId: entry.classId,
      }));
    } else {
      seenClassIds.add(entry.classId);
    }

    if (!getClassCatalogEntry(entry.classId)) {
      issues.push(makeIssue({
        code: "UNKNOWN_CLASS_ID",
        message: `Class id "${entry.classId}" is not present in the shared catalog.`,
        severity: "blocker",
        scope: "canonical-build",
        path: `classing.classes[${index}].classId`,
        source: "domain",
        canonicalId: entry.classId,
      }));
    }
  }

  if (!getRaceCatalogEntry(character.ancestry.raceId)) {
    issues.push(makeIssue({
      code: "UNKNOWN_RACE_ID",
      message: `Race id "${character.ancestry.raceId}" is not present in the shared catalog.`,
      severity: "blocker",
      scope: "canonical-build",
      path: "ancestry.raceId",
      source: "domain",
      canonicalId: character.ancestry.raceId,
    }));
  }

  if (!getBackgroundCatalogEntry(character.background.backgroundId)) {
    issues.push(makeIssue({
      code: "UNKNOWN_BACKGROUND_ID",
      message: `Background id "${character.background.backgroundId}" is not present in the shared catalog.`,
      severity: "blocker",
      scope: "canonical-build",
      path: "background.backgroundId",
      source: "domain",
      canonicalId: character.background.backgroundId,
    }));
  }

  for (const [index, featId] of character.background.grantedFeatIds.entries()) {
    if (!getFeatCatalogEntry(featId)) {
      issues.push(makeIssue({
        code: "UNKNOWN_GRANTED_FEAT_ID",
        message: `Granted feat id "${featId}" is not present in the shared catalog.`,
        severity: "warning",
        scope: "dataset",
        path: `background.grantedFeatIds[${index}]`,
        source: "domain",
        canonicalId: featId,
      }));
    }
  }

  for (const [index, featId] of character.choices.feats.entries()) {
    if (!getFeatCatalogEntry(featId)) {
      issues.push(makeIssue({
        code: "UNKNOWN_CHOSEN_FEAT_ID",
        message: `Chosen feat id "${featId}" is not present in the shared catalog.`,
        severity: "warning",
        scope: "canonical-build",
        path: `choices.feats[${index}]`,
        source: "domain",
        canonicalId: featId,
      }));
    }
  }

  return issues;
}

function validateNormalizedChoices(character: CharacterBuild) {
  const issues: PreflightIssue[] = [];
  const normalizedChoices = character.choices.normalized;

  if (!normalizedChoices) {
    return issues;
  }

  for (const [index, spell] of normalizedChoices.spells.entries()) {
    const catalogById = spell.spellId ? getSpellCatalogEntry(spell.spellId) : undefined;
    const catalogByLabel = getSpellCatalogEntry(spell.label);
    const catalogEntry = catalogById ?? catalogByLabel;

    if (!catalogEntry) {
      issues.push(makeIssue({
        code: "UNRESOLVED_SPELL",
        message: `Spell "${spell.label}" could not be resolved against the shared catalog.`,
        severity: "warning",
        scope: "foundry-export",
        path: `choices.normalized.spells[${index}]`,
        source: "domain",
        canonicalId: spell.spellId,
      }));
      continue;
    }

    if (catalogById && catalogByLabel && catalogById.id !== catalogByLabel.id) {
      issues.push(makeIssue({
        code: "SPELL_ID_LABEL_MISMATCH",
        message: `Spell entry "${spell.label}" resolves to "${catalogByLabel.id}", but provided spellId was "${spell.spellId}".`,
        severity: "warning",
        scope: "canonical-build",
        path: `choices.normalized.spells[${index}]`,
        source: "domain",
        canonicalId: spell.spellId,
        details: {
          resolvedFromLabel: catalogByLabel.id,
          resolvedFromId: catalogById.id,
        },
      }));
    }

    if (catalogEntry.level !== spell.level) {
      issues.push(makeIssue({
        code: "SPELL_LEVEL_MISMATCH",
        message: `Spell "${spell.label}" has level ${spell.level}, but the shared catalog expects level ${catalogEntry.level}.`,
        severity: "warning",
        scope: "foundry-export",
        path: `choices.normalized.spells[${index}].level`,
        source: "domain",
        canonicalId: catalogEntry.id,
        details: {
          expectedLevel: catalogEntry.level,
          providedLevel: spell.level,
        },
      }));
    }
  }

  for (const [index, item] of normalizedChoices.equipment.entries()) {
    const lookupValue = item.itemId ?? item.label;
    const armorEntry = getArmorCatalogEntry(lookupValue);
    const weaponEntry = getWeaponCatalogEntry(lookupValue);
    const gearEntry = getGearCatalogEntry(lookupValue);
    const catalogEntry = armorEntry ?? weaponEntry ?? gearEntry;

    if (!catalogEntry) {
      issues.push(makeIssue({
        code: "UNRESOLVED_EQUIPMENT",
        message: `Equipment "${item.label}" could not be resolved against the shared catalog.`,
        severity: "warning",
        scope: "foundry-export",
        path: `choices.normalized.equipment[${index}]`,
        source: "domain",
        canonicalId: item.itemId,
      }));
      continue;
    }

    const expectedCategory = armorEntry
      ? (armorEntry.grantsShieldBonus ? "shield" : "armor")
      : weaponEntry
        ? "weapon"
        : gearEntry
          ? "gear"
          : "other";

    if (item.category !== expectedCategory && !(item.category === "other" && expectedCategory === "gear")) {
      issues.push(makeIssue({
        code: "EQUIPMENT_CATEGORY_MISMATCH",
        message: `Equipment "${item.label}" is categorized as "${item.category}", but the shared catalog expects "${expectedCategory}".`,
        severity: "warning",
        scope: "canonical-build",
        path: `choices.normalized.equipment[${index}].category`,
        source: "domain",
        canonicalId: item.itemId ?? ("id" in catalogEntry ? catalogEntry.id : undefined),
        details: {
          expectedCategory,
          providedCategory: item.category,
        },
      }));
    }
  }

  return issues;
}

function validateProficiencies(character: CharacterBuild) {
  const issues: PreflightIssue[] = [];
  const seenEntries = new Set<string>();
  const normalizedChoices = character.choices.normalized;

  if (normalizedChoices) {
    for (const [index, entry] of normalizedChoices.proficiencies.entries()) {
      let resolvedId: string | undefined;
      const explicitKind = /^language:\s*/i.test(entry.label)
        ? "language"
        : /^tool:\s*/i.test(entry.label)
          ? "tool"
          : undefined;
      const normalizedLabel = normalizeProficiencyLabel(entry.label);

      if (explicitKind && explicitKind !== entry.kind) {
        issues.push(makeIssue({
          code: "PROFICIENCY_KIND_LABEL_MISMATCH",
          message: `Proficiency "${entry.label}" is tagged as "${entry.kind}" but looks like "${explicitKind}".`,
          severity: "warning",
          scope: "canonical-build",
          path: `choices.normalized.proficiencies[${index}]`,
          source: "domain",
          canonicalId: entry.id,
          details: {
            expectedKind: explicitKind,
            providedKind: entry.kind,
          },
        }));
      }

      if (entry.kind === "skill") {
        resolvedId = resolveSkillId(entry.label);
      } else if (entry.kind === "language") {
        resolvedId = resolveLanguageId(entry.label);
      } else if (entry.kind === "tool") {
        const resolvedTool = resolveToolEntry(entry.label);
        resolvedId = resolvedTool?.id;
      } else if (explicitKind === "language") {
        resolvedId = resolveLanguageId(entry.label);
      } else if (explicitKind === "tool") {
        resolvedId = resolveToolEntry(entry.label)?.id;
      }

      if ((entry.kind === "skill" || entry.kind === "language" || entry.kind === "tool") && !resolvedId) {
        issues.push(makeIssue({
          code: "UNRESOLVED_PROFICIENCY",
          message: `Proficiency "${entry.label}" could not be resolved for kind "${entry.kind}".`,
          severity: "warning",
          scope: "canonical-build",
          path: `choices.normalized.proficiencies[${index}]`,
          source: "domain",
          canonicalId: entry.id,
        }));
        continue;
      }

      const duplicateKey = `${entry.kind}:${entry.id ?? resolvedId ?? normalizedLabel}`;
      if (seenEntries.has(duplicateKey)) {
        issues.push(makeIssue({
          code: "DUPLICATE_PROFICIENCY_ENTRY",
          message: `Proficiency "${entry.label}" appears more than once for kind "${entry.kind}".`,
          severity: "warning",
          scope: "canonical-build",
          path: `choices.normalized.proficiencies[${index}]`,
          source: "domain",
          canonicalId: entry.id ?? resolvedId,
        }));
      } else {
        seenEntries.add(duplicateKey);
      }
    }

    return issues;
  }

  for (const [index, entry] of character.choices.proficiencies.entries()) {
    const looksLikeLanguage = /^language:\s*/i.test(entry);
    const looksLikeTool = /^tool:\s*/i.test(entry);
    const resolvedId = looksLikeLanguage
      ? resolveLanguageId(entry)
      : looksLikeTool
        ? resolveToolEntry(entry)?.id
        : resolveSkillId(entry);

    if (!resolvedId) {
      issues.push(makeIssue({
        code: "UNRESOLVED_PROFICIENCY",
        message: `Legacy proficiency "${entry}" could not be resolved.`,
        severity: "warning",
        scope: "canonical-build",
        path: `choices.proficiencies[${index}]`,
        source: "domain",
      }));
      continue;
    }

    const duplicateKey = `${looksLikeLanguage ? "language" : looksLikeTool ? "tool" : "skill"}:${resolvedId}`;
    if (seenEntries.has(duplicateKey)) {
      issues.push(makeIssue({
        code: "DUPLICATE_PROFICIENCY_ENTRY",
        message: `Legacy proficiency "${entry}" appears more than once.`,
        severity: "warning",
        scope: "canonical-build",
        path: `choices.proficiencies[${index}]`,
        source: "domain",
      }));
    } else {
      seenEntries.add(duplicateKey);
    }
  }

  return issues;
}

function validateDerivedState(character: CharacterBuild) {
  const issues: PreflightIssue[] = [];
  const totalLevels = getCharacterLevel(character.classing.classes.map((entry) => entry.level));
  const expectedProficiencyBonus = getProficiencyBonus(totalLevels);

  if (character.derived.proficiencyBonus !== expectedProficiencyBonus) {
    issues.push(makeIssue({
      code: "DERIVED_PROFICIENCY_BONUS_MISMATCH",
      message: `Derived proficiency bonus is ${character.derived.proficiencyBonus}, but level ${totalLevels} expects ${expectedProficiencyBonus}.`,
      severity: "warning",
      scope: "canonical-build",
      path: "derived.proficiencyBonus",
      source: "domain",
      details: {
        expectedProficiencyBonus,
        providedProficiencyBonus: character.derived.proficiencyBonus,
        totalLevels,
      },
    }));
  }

  const primaryClass = character.classing.classes[0];
  const expectedSpellAbility = primaryClass ? getSpellAbilityForClass(primaryClass.classId) : undefined;

  if (!expectedSpellAbility && character.derived.spellcasting) {
    issues.push(makeIssue({
      code: "UNEXPECTED_DERIVED_SPELLCASTING",
      message: `Primary class "${primaryClass?.classId ?? "unknown"}" does not normally derive spellcasting, but derived.spellcasting is present.`,
      severity: "warning",
      scope: "canonical-build",
      path: "derived.spellcasting",
      source: "domain",
    }));

    return issues;
  }

  if (!expectedSpellAbility || !character.derived.spellcasting || !primaryClass) {
    return issues;
  }

  const modifiers = abilityModifierMap(character.abilities.final);
  const expectedAttackBonus = expectedProficiencyBonus + modifiers[expectedSpellAbility];
  const expectedSaveDc = 8 + expectedProficiencyBonus + modifiers[expectedSpellAbility];
  const expectedSlots = getSpellSlotsForClassLevel(primaryClass.classId, primaryClass.level);

  if (character.derived.spellcasting.ability !== expectedSpellAbility) {
    issues.push(makeIssue({
      code: "DERIVED_SPELL_ABILITY_MISMATCH",
      message: `Derived spellcasting ability is "${character.derived.spellcasting.ability}", but primary class "${primaryClass.classId}" expects "${expectedSpellAbility}".`,
      severity: "warning",
      scope: "canonical-build",
      path: "derived.spellcasting.ability",
      source: "domain",
      details: {
        expectedAbility: expectedSpellAbility,
        providedAbility: character.derived.spellcasting.ability,
      },
    }));
  }

  if (character.derived.spellcasting.attackBonus !== expectedAttackBonus) {
    issues.push(makeIssue({
      code: "DERIVED_SPELL_ATTACK_BONUS_MISMATCH",
      message: `Derived spell attack bonus is ${character.derived.spellcasting.attackBonus}, but expected ${expectedAttackBonus}.`,
      severity: "warning",
      scope: "canonical-build",
      path: "derived.spellcasting.attackBonus",
      source: "domain",
      details: {
        expectedAttackBonus,
        providedAttackBonus: character.derived.spellcasting.attackBonus,
      },
    }));
  }

  if (character.derived.spellcasting.saveDC !== expectedSaveDc) {
    issues.push(makeIssue({
      code: "DERIVED_SPELL_SAVE_DC_MISMATCH",
      message: `Derived spell save DC is ${character.derived.spellcasting.saveDC}, but expected ${expectedSaveDc}.`,
      severity: "warning",
      scope: "canonical-build",
      path: "derived.spellcasting.saveDC",
      source: "domain",
      details: {
        expectedSaveDC: expectedSaveDc,
        providedSaveDC: character.derived.spellcasting.saveDC,
      },
    }));
  }

  if (JSON.stringify(character.derived.spellcasting.slots) !== JSON.stringify(expectedSlots)) {
    issues.push(makeIssue({
      code: "DERIVED_SPELL_SLOTS_MISMATCH",
      message: `Derived spell slots do not match the expected progression for ${primaryClass.classId} level ${primaryClass.level}.`,
      severity: "warning",
      scope: "canonical-build",
      path: "derived.spellcasting.slots",
      source: "domain",
      details: {
        expectedSlots,
        providedSlots: character.derived.spellcasting.slots,
      },
    }));
  }

  return issues;
}

export function buildPreflightResult(
  input: CharacterBuildInput | CharacterBuild | unknown,
  options: PreflightOptions = {},
): PreflightResult {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const parsed = characterBuildInputSchema.safeParse(input);
  const parsedWithDerived = characterBuildSchema.safeParse(input);

  if (!parsed.success) {
    const issues: PreflightIssue[] = parsed.error.issues.map((issue) => makeIssue({
      code: `INVALID_${issue.code.toUpperCase()}`,
      message: issue.message,
      severity: "blocker",
      scope: "canonical-build",
      path: buildPath(issue.path),
      source: "contracts",
      details: issue.code === "invalid_enum_value"
        ? { options: "options" in issue ? issue.options : undefined }
        : undefined,
    }));
    const summary = summarizeIssues(issues);

    return preflightResultSchema.parse({
      ok: false,
      generatedAt,
      target: options.target,
      issues,
      summary,
    });
  }

  const character = parsed.data as CharacterBuildInput;
  const issues = [
    ...validateCanonicalCatalogs(character as CharacterBuild),
    ...validateNormalizedChoices(character as CharacterBuild),
    ...validateProficiencies(character as CharacterBuild),
    ...(parsedWithDerived.success ? validateDerivedState(parsedWithDerived.data) : []),
  ];
  const summary = summarizeIssues(issues);

  return preflightResultSchema.parse({
    ok: summary.blockers === 0,
    generatedAt,
    target: options.target,
    issues,
    summary,
  });
}
