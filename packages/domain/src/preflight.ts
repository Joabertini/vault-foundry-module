import {
  type CharacterBuild,
  type CharacterBuildInput,
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

  for (const [index, entry] of character.classing.classes.entries()) {
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
    const catalogEntry = spell.spellId
      ? getSpellCatalogEntry(spell.spellId)
      : getSpellCatalogEntry(spell.label);

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
    const catalogEntry =
      getArmorCatalogEntry(lookupValue)
      ?? getWeaponCatalogEntry(lookupValue)
      ?? getGearCatalogEntry(lookupValue);

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
    }
  }

  return issues;
}

export function buildPreflightResult(
  input: CharacterBuildInput | CharacterBuild | unknown,
  options: PreflightOptions = {},
): PreflightResult {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const parsed = characterBuildInputSchema.safeParse(input);

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
