import { NextResponse } from "next/server";
import { conflictCheckSchema } from "@/lib/schemas/ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runAi } from "@/lib/ai/provider";
import { jsonError } from "@/lib/http";
import { zodErrorMessage } from "@/lib/validation";

function fallbackConflict(startsAt: string, endsAt: string, conflicts: number) {
  if (!conflicts) {
    return "No direct overlaps found in your current schedule.";
  }
  return `${conflicts} overlapping event(s) detected between ${new Date(startsAt).toLocaleString()} and ${new Date(endsAt).toLocaleString()}. Try moving the event 30-60 minutes later.`;
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return jsonError("Unauthorized", 401);

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = conflictCheckSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error), 400);

  const { data: attendance } = await supabase
    .from("event_attendance")
    .select("event_id,status")
    .eq("user_id", userData.user.id)
    .in("status", ["attending", "maybe"])
    .returns<{ event_id: string; status: string }[]>();

  const eventIds = (attendance ?? []).map((item) => item.event_id);
  let conflicts = 0;
  if (eventIds.length) {
    const { data: events } = await supabase
      .from("events")
      .select("id,title,starts_at,ends_at")
      .in("id", eventIds)
      .returns<{ id: string; title: string; starts_at: string; ends_at: string }[]>();

    conflicts = (events ?? []).filter(
      (event) =>
        new Date(event.starts_at) < new Date(parsed.data.endsAt) &&
        new Date(event.ends_at) > new Date(parsed.data.startsAt),
    ).length;
  }

  const fallback = fallbackConflict(parsed.data.startsAt, parsed.data.endsAt, conflicts);
  const aiText = await runAi([
    {
      role: "system",
      content: "You detect schedule conflicts and propose concise alternatives.",
    },
    {
      role: "user",
      content: `Candidate event: ${parsed.data.startsAt} to ${parsed.data.endsAt}. Conflicts detected: ${conflicts}. Suggest practical alternatives.`,
    },
  ]);

  await supabase.from("ai_history").insert({
    user_id: userData.user.id,
    feature: "conflict_check",
    input: parsed.data,
    output: { analysis: aiText ?? fallback, conflicts },
    success: Boolean(aiText),
  });

  return NextResponse.json(
    aiText ? { analysis: aiText, source: "ai" } : { fallback, source: "fallback" },
  );
}
