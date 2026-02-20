import type { ZodError } from "zod";

export function zodErrorMessage(error: ZodError) {
  return error.issues.map((issue) => issue.message).join("; ");
}
