import { z } from "zod";

export const eventSchema = z
  .object({
    title: z.string().min(3).max(120),
    description: z.string().max(3000).optional().nullable(),
    location: z.string().max(240).optional().nullable(),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    timezone: z.string().min(2).max(100),
    isPublic: z.boolean().default(true),
  })
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    message: "End time must be after start time.",
    path: ["endsAt"],
  });

export const rsvpSchema = z.object({
  status: z.enum(["attending", "maybe", "declined"]),
});

export const eventFilterSchema = z.object({
  q: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  location: z.string().optional(),
  scope: z
    .enum(["all", "my", "invited", "going", "maybe", "declined"])
    .default("all"),
  sort: z.enum(["nearest", "latest"]).default("nearest"),
});
