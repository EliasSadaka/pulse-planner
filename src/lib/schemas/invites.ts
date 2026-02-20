import { z } from "zod";

export const createInviteSchema = z.object({
  inviteeEmail: z.string().email().optional(),
  expiresInDays: z.number().int().min(1).max(30).default(7),
});

export const claimInviteSchema = z.object({
  token: z.string().min(20),
});
