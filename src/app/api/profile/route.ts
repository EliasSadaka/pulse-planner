import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/http";
import { zodErrorMessage } from "@/lib/validation";

const profileSchema = z.object({
  fullName: z.string().min(1).max(120),
});

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return jsonError("Unauthorized", 401);

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error), 400);

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, updated_at: new Date().toISOString() })
    .eq("id", userData.user.id);

  if (error) return jsonError(error.message, 400);
  return NextResponse.json({ success: true });
}
