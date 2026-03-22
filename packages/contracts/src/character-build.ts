import { z } from "zod";

export const rulesVersionSchema = z.literal("5e-2014");
export const sourceProfileSchema = z.literal("vault-v1");
export const canonicalIdSchema = z.string().trim().min(1);
export const canonicalLabelSchema = z.string().trim().min(1);
export const isoDateTimeSchema = z.string().datetime();

export const abilityIdSchema = z.enum(["str", "dex", "con", "int", "wis", "cha"]);
export type AbilityId = z.infer<typeof abilityIdSchema>;

export const abilityScoreMapSchema = z.object({
  str: z.number().int().min(1).max(30),
  dex: z.number().int().min(1).max(30),
  con: z.number().int().min(1).max(30),
  int: z.number().int().min(1).max(30),
  wis: z.number().int().min(1).max(30),
  cha: z.number().int().min(1).max(30),
});

export const generationMethodSchema = z.enum([
  "roll",
  "standard-array",
  "point-buy",
  "manual",
]);

export const biographySchema = z.object({
  trait: canonicalLabelSchema.optional(),
  ideal: canonicalLabelSchema.optional(),
  bond: canonicalLabelSchema.optional(),
  flaw: canonicalLabelSchema.optional(),
  notes: canonicalLabelSchema.optional(),
});

export const characterMetaSchema = z.object({
  rulesVersion: rulesVersionSchema,
  sourceProfile: sourceProfileSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export const identitySchema = z.object({
  characterName: canonicalLabelSchema,
  playerName: canonicalLabelSchema.optional(),
  alignment: canonicalLabelSchema.optional(),
  biography: biographySchema.optional(),
});

export const ancestrySchema = z.object({
  raceId: canonicalIdSchema,
  subraceId: canonicalIdSchema.optional(),
});

export const classEntrySchema = z.object({
  classId: canonicalIdSchema,
  subclassId: canonicalIdSchema.optional(),
  level: z.number().int().min(1).max(20),
});

export const classingSchema = z.object({
  classes: z.array(classEntrySchema).min(1),
});

export const backgroundSchema = z.object({
  backgroundId: canonicalIdSchema,
  grantedFeatIds: z.array(canonicalIdSchema).default([]),
});

export const abilitiesSchema = z.object({
  generationMethod: generationMethodSchema,
  rolledSets: z.array(z.array(z.number().int().min(1).max(30)).length(6)).optional(),
  base: abilityScoreMapSchema,
  final: abilityScoreMapSchema,
});

export const normalizedProficiencyKindSchema = z.enum([
  "skill",
  "language",
  "tool",
  "weapon",
  "armor",
  "other",
]);

export const normalizedFeatureSourceSchema = z.enum([
  "class",
  "subclass",
  "background",
  "feat",
  "race",
  "other",
]);

export const normalizedEquipmentCategorySchema = z.enum([
  "weapon",
  "armor",
  "shield",
  "gear",
  "other",
]);

export const normalizedProficiencyEntrySchema = z.object({
  kind: normalizedProficiencyKindSchema,
  id: canonicalIdSchema.optional(),
  label: canonicalLabelSchema,
});

export const normalizedSpellEntrySchema = z.object({
  spellId: canonicalIdSchema.optional(),
  label: canonicalLabelSchema,
  level: z.number().int().min(0).max(9),
});

export const normalizedEquipmentEntrySchema = z.object({
  itemId: canonicalIdSchema.optional(),
  label: canonicalLabelSchema,
  quantity: z.number().int().min(1).default(1),
  category: normalizedEquipmentCategorySchema.default("other"),
});

export const normalizedFeatureEntrySchema = z.object({
  featureId: canonicalIdSchema.optional(),
  label: canonicalLabelSchema,
  source: normalizedFeatureSourceSchema.default("other"),
});

export const normalizedChoicesSchema = z.object({
  feats: z.array(canonicalIdSchema).default([]),
  proficiencies: z.array(normalizedProficiencyEntrySchema).default([]),
  spells: z.array(normalizedSpellEntrySchema).default([]),
  equipment: z.array(normalizedEquipmentEntrySchema).default([]),
  features: z.array(normalizedFeatureEntrySchema).default([]),
});

export const choicesSchema = z.object({
  feats: z.array(canonicalIdSchema).default([]),
  proficiencies: z.array(canonicalLabelSchema).default([]),
  spells: z.array(canonicalLabelSchema).default([]),
  equipment: z.array(canonicalLabelSchema).default([]),
  features: z.array(canonicalLabelSchema).default([]),
  normalized: normalizedChoicesSchema.optional(),
});

export const spellcastingSchema = z.object({
  ability: abilityIdSchema,
  attackBonus: z.number().int(),
  saveDC: z.number().int(),
  slots: z.record(z.string(), z.number().int().min(0)),
});

export const derivedSchema = z.object({
  proficiencyBonus: z.number().int().min(2).max(6),
  hp: z.number().int().min(1),
  ac: z.number().int().min(1),
  spellcasting: spellcastingSchema.optional(),
});

export const characterBuildInputSchema = z.object({
  meta: characterMetaSchema,
  identity: identitySchema,
  ancestry: ancestrySchema,
  classing: classingSchema,
  background: backgroundSchema,
  abilities: abilitiesSchema,
  choices: choicesSchema,
});

export const characterBuildSchema = characterBuildInputSchema.extend({
  derived: derivedSchema,
});

export type AbilityScoreMap = z.infer<typeof abilityScoreMapSchema>;
export type Biography = z.infer<typeof biographySchema>;
export type CharacterMeta = z.infer<typeof characterMetaSchema>;
export type Identity = z.infer<typeof identitySchema>;
export type Ancestry = z.infer<typeof ancestrySchema>;
export type ClassEntry = z.infer<typeof classEntrySchema>;
export type Classing = z.infer<typeof classingSchema>;
export type Background = z.infer<typeof backgroundSchema>;
export type Abilities = z.infer<typeof abilitiesSchema>;
export type NormalizedProficiencyEntry = z.infer<typeof normalizedProficiencyEntrySchema>;
export type NormalizedSpellEntry = z.infer<typeof normalizedSpellEntrySchema>;
export type NormalizedEquipmentEntry = z.infer<typeof normalizedEquipmentEntrySchema>;
export type NormalizedFeatureEntry = z.infer<typeof normalizedFeatureEntrySchema>;
export type NormalizedChoices = z.infer<typeof normalizedChoicesSchema>;
export type Choices = z.infer<typeof choicesSchema>;
export type Spellcasting = z.infer<typeof spellcastingSchema>;
export type Derived = z.infer<typeof derivedSchema>;
export type CharacterBuildInput = z.infer<typeof characterBuildInputSchema>;
export type CharacterBuild = z.infer<typeof characterBuildSchema>;
