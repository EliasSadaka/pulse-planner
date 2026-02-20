import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { eventFilterSchema, eventSchema } from "@/lib/schemas/events";
import { jsonError } from "@/lib/http";
import { zodErrorMessage } from "@/lib/validation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = eventFilterSchema.parse({
    q: url.searchParams.get("q") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    location: url.searchParams.get("location") ?? undefined,
    scope: url.searchParams.get("scope") ?? undefined,
    sort: url.searchParams.get("sort") ?? undefined,
  });

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  let query = supabase
    .from("events")
    .select("id,creator_id,title,description,location,starts_at,ends_at,timezone,is_public,created_at,updated_at")
    .order("starts_at", { ascending: parsed.sort !== "latest" });

  if (parsed.q) {
    query = query.or(
      `title.ilike.%${parsed.q}%,description.ilike.%${parsed.q}%,location.ilike.%${parsed.q}%`,
    );
  }
  if (parsed.from) query = query.gte("starts_at", parsed.from);
  if (parsed.to) query = query.lte("starts_at", parsed.to);
  if (parsed.location) query = query.ilike("location", `%${parsed.location}%`);
  if (parsed.scope === "my" && userData.user) query = query.eq("creator_id", userData.user.id);

  const { data, error } = await query;
  if (error) return jsonError(error.message, 400);

  return NextResponse.json({ events: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return jsonError("Unauthorized", 401);

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error), 400);

  const payload = parsed.data;
  const { data, error } = await supabase
    .from("events")
    .insert({
      creator_id: userData.user.id,
      title: payload.title,
      description: payload.description ?? null,
      location: payload.location ?? null,
      starts_at: payload.startsAt,
      ends_at: payload.endsAt,
      timezone: payload.timezone,
      is_public: payload.isPublic,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) return jsonError(error?.message ?? "Unable to create event.");
  return NextResponse.json({ eventId: data.id });
}
