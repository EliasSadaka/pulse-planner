import { z } from "zod";

export const descriptionEnhanceSchema = z.object({
  notes: z.string().min(5).max(2000),
  tone: z.enum(["professional", "friendly", "concise"]).default("friendly"),
});

export const conflictCheckSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});

export const inviteMessageSchema = z.object({
  title: z.string().min(3).max(120),
  startsAt: z.string().datetime(),
  location: z.string().optional().nullable(),
  tone: z.enum(["casual", "warm", "formal"]).default("casual"),
  inviteLink: z.string().url(),
});
