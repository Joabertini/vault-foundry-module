import { z } from "zod";

export const foundryActorPayloadSchema = z.object({
  name: z.string().trim().min(1),
  type: z.literal("character"),
  img: z.string().trim().min(1),
  system: z.record(z.string(), z.unknown()),
  items: z.array(z.record(z.string(), z.unknown())).default([]),
  effects: z.array(z.record(z.string(), z.unknown())).default([]),
  flags: z.record(z.string(), z.unknown()).default({}),
  prototypeToken: z.record(z.string(), z.unknown()).optional(),
  folder: z.unknown().optional(),
  ownership: z.record(z.string(), z.unknown()).optional(),
  _stats: z.record(z.string(), z.unknown()).optional(),
});

export type FoundryActorPayload = z.infer<typeof foundryActorPayloadSchema>;
