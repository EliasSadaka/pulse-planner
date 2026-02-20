import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AttendanceStatus, EventRecord } from "@/lib/types";

type EventFilters = {
  q?: string;
  from?: string;
  to?: string;
  location?: string;
  scope?: "all" | "my" | "invited" | "going" | "maybe" | "declined";
  sort?: "nearest" | "latest";
};

export async function getEventById(eventId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      "id,creator_id,title,description,location,starts_at,ends_at,timezone,is_public,created_at,updated_at",
    )
    .eq("id", eventId)
    .single<EventRecord>();

  if (error) {
    return null;
  }

  return data;
}

export async function getEvents(filters: EventFilters) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  let query = supabase
    .from("events")
    .select("id,creator_id,title,description,location,starts_at,ends_at,timezone,is_public,created_at,updated_at")
    .order("starts_at", { ascending: filters.sort !== "latest" });

  if (filters.q) {
    query = query.or(
      `title.ilike.%${filters.q}%,description.ilike.%${filters.q}%,location.ilike.%${filters.q}%`,
    );
  }

  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  if (filters.from) {
    query = query.gte("starts_at", filters.from);
  }

  if (filters.to) {
    query = query.lte("starts_at", filters.to);
  }

  if (userId && filters.scope === "my") {
    query = query.eq("creator_id", userId);
  }

  const { data: events } = await query.returns<EventRecord[]>();

  if (!events || !userId) {
    return events ?? [];
  }

  if (!filters.scope || filters.scope === "all" || filters.scope === "my") {
    return events;
  }

  const { data: attendance } = await supabase
    .from("event_attendance")
    .select("event_id,status")
    .eq("user_id", userId)
    .returns<{ event_id: string; status: AttendanceStatus }[]>();

  const statusMap = new Map(
    (attendance ?? []).map((item) => [item.event_id, item.status]),
  );

  if (filters.scope === "invited") {
    const { data: invites } = await supabase
      .from("event_invites")
      .select("event_id")
      .or(`invitee_user_id.eq.${userId},invitee_email.eq.${userData.user?.email ?? ""}`);

    const invitedIds = new Set((invites ?? []).map((item) => item.event_id));
    return events.filter((event) => invitedIds.has(event.id));
  }

  const statusFilter =
    filters.scope === "going"
      ? "attending"
      : filters.scope === "maybe"
        ? "maybe"
        : filters.scope === "declined"
          ? "declined"
          : null;

  if (!statusFilter) {
    return events;
  }

  return events.filter((event) => statusMap.get(event.id) === statusFilter);
}
