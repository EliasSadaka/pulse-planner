import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/schemas/events";
import { jsonError } from "@/lib/http";
import { zodErrorMessage } from "@/lib/validation";

async function ensureCreator(eventId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("events")
    .select("creator_id")
    .eq("id", eventId)
    .single<{ creator_id: string }>();
  return data?.creator_id === userId;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return jsonError("Unauthorized", 401);
  if (!(await ensureCreator(id, userData.user.id))) return jsonError("Forbidden", 403);

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error), 400);
  const payload = parsed.data;

  const { error } = await supabase
    .from("events")
    .update({
      title: payload.title,
      description: payload.description ?? null,
      location: payload.location ?? null,
      starts_at: payload.startsAt,
      ends_at: payload.endsAt,
      timezone: payload.timezone,
      is_public: payload.isPublic,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return jsonError(error.message, 400);
  return NextResponse.json({ eventId: id });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return jsonError("Unauthorized", 401);
  if (!(await ensureCreator(id, userData.user.id))) return jsonError("Forbidden", 403);

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return jsonError(error.message, 400);
  return NextResponse.json({ success: true });
}
