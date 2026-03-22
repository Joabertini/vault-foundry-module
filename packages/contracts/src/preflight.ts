import { z } from "zod";

import {
  canonicalIdSchema,
  canonicalLabelSchema,
  isoDateTimeSchema,
  rulesVersionSchema,
  sourceProfileSchema,
} from "./character-build.js";

export const preflightSeveritySchema = z.enum(["blocker", "warning", "info"]);
export type PreflightSeverity = z.infer<typeof preflightSeveritySchema>;

export const preflightScopeSchema = z.enum([
  "canonical-build",
  "foundry-export",
  "foundry-import",
  "compatibility",
  "dataset",
]);
export type PreflightScope = z.infer<typeof preflightScopeSchema>;

export const preflightSourceSchema = z.enum([
  "contracts",
  "domain",
  "exporter",
  "foundry-module",
  "api",
  "other",
]);
export type PreflightSource = z.infer<typeof preflightSourceSchema>;

export const preflightIssuePathSchema = z.string().trim().min(1);
export const preflightIssueCodeSchema = z.string().trim().min(1);

export const preflightIssueSchema = z.object({
  code: preflightIssueCodeSchema,
  message: canonicalLabelSchema,
  severity: preflightSeveritySchema,
  scope: preflightScopeSchema,
  path: preflightIssuePathSchema.optional(),
  source: preflightSourceSchema.default("other"),
  canonicalId: canonicalIdSchema.optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});
export type PreflightIssue = z.infer<typeof preflightIssueSchema>;

export const preflightSummarySchema = z.object({
  blockers: z.number().int().min(0),
  warnings: z.number().int().min(0),
  info: z.number().int().min(0),
  total: z.number().int().min(0),
});
export type PreflightSummary = z.infer<typeof preflightSummarySchema>;

export const preflightTargetSchema = z.object({
  rulesVersion: rulesVersionSchema.default("5e-2014"),
  sourceProfile: sourceProfileSchema.default("vault-v1"),
  foundryVersion: canonicalLabelSchema.optional(),
  systemId: canonicalIdSchema.optional(),
  systemVersion: canonicalLabelSchema.optional(),
  moduleVersion: canonicalLabelSchema.optional(),
});
export type PreflightTarget = z.infer<typeof preflightTargetSchema>;

export const preflightResultSchema = z.object({
  ok: z.boolean(),
  generatedAt: isoDateTimeSchema,
  target: preflightTargetSchema.optional(),
  issues: z.array(preflightIssueSchema).default([]),
  summary: preflightSummarySchema,
});
export type PreflightResult = z.infer<typeof preflightResultSchema>;
