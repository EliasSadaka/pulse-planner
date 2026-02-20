import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rsvpSchema } from "@/lib/schemas/events";
import { jsonError } from "@/lib/http";
import { zodErrorMessage } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return jsonError("Unauthorized", 401);

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error), 400);

  const { error } = await supabase.from("event_attendance").upsert(
    {
      event_id: id,
      user_id: userData.user.id,
      status: parsed.data.status,
      responded_at: new Date().toISOString(),
    },
    { onConflict: "event_id,user_id" },
  );

  if (error) return jsonError(error.message, 400);
  return NextResponse.json({ status: parsed.data.status });
}
