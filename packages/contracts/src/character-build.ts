import { z } from "zod";

export const rulesVersionSchema = z.literal("5e-2014");
export const sourceProfileSchema = z.literal("vault-v1");

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
  trait: z.string().trim().min(1).optional(),
  ideal: z.string().trim().min(1).optional(),
  bond: z.string().trim().min(1).optional(),
  flaw: z.string().trim().min(1).optional(),
  notes: z.string().trim().min(1).optional(),
});

export const classEntrySchema = z.object({
  classId: z.string().trim().min(1),
  subclassId: z.string().trim().min(1).optional(),
  level: z.number().int().min(1).max(20),
});

export const spellcastingSchema = z.object({
  ability: abilityIdSchema,
  attackBonus: z.number().int(),
  saveDC: z.number().int(),
  slots: z.record(z.string(), z.number().int().min(0)),
});

export const characterBuildSchema = z.object({
  meta: z.object({
    rulesVersion: rulesVersionSchema,
    sourceProfile: sourceProfileSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
  identity: z.object({
    characterName: z.string().trim().min(1),
    playerName: z.string().trim().min(1).optional(),
    alignment: z.string().trim().min(1).optional(),
    biography: biographySchema.optional(),
  }),
  ancestry: z.object({
    raceId: z.string().trim().min(1),
    subraceId: z.string().trim().min(1).optional(),
  }),
  classing: z.object({
    classes: z.array(classEntrySchema).min(1),
  }),
  background: z.object({
    backgroundId: z.string().trim().min(1),
    grantedFeatIds: z.array(z.string().trim().min(1)).default([]),
  }),
  abilities: z.object({
    generationMethod: generationMethodSchema,
    rolledSets: z.array(z.array(z.number().int().min(1).max(30)).length(6)).optional(),
    base: abilityScoreMapSchema,
    final: abilityScoreMapSchema,
  }),
  choices: z.object({
    feats: z.array(z.string().trim().min(1)).default([]),
    proficiencies: z.array(z.string().trim().min(1)).default([]),
    spells: z.array(z.string().trim().min(1)).default([]),
    equipment: z.array(z.string().trim().min(1)).default([]),
    features: z.array(z.string().trim().min(1)).default([]),
  }),
  derived: z.object({
    proficiencyBonus: z.number().int().min(2).max(6),
    hp: z.number().int().min(1),
    ac: z.number().int().min(1),
    spellcasting: spellcastingSchema.optional(),
  }),
});

export type AbilityScoreMap = z.infer<typeof abilityScoreMapSchema>;
export type Biography = z.infer<typeof biographySchema>;
export type CharacterBuild = z.infer<typeof characterBuildSchema>;
