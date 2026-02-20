import { NextResponse } from "next/server";
import { inviteMessageSchema } from "@/lib/schemas/ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runAi } from "@/lib/ai/provider";
import { jsonError } from "@/lib/http";
import { zodErrorMessage } from "@/lib/validation";

function fallbackMessage(input: {
  title: string;
  startsAt: string;
  location?: string | null;
  inviteLink: string;
}) {
  return `You're invited to ${input.title} on ${new Date(input.startsAt).toLocaleString()}${input.location ? ` at ${input.location}` : ""}.\n\nJoin us here: ${input.inviteLink}`;
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return jsonError("Unauthorized", 401);

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = inviteMessageSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error), 400);

  const fallback = fallbackMessage(parsed.data);
  const aiText = await runAi([
    {
      role: "system",
      content: "You write short event invitation messages tailored by tone.",
    },
    {
      role: "user",
      content: `Write a ${parsed.data.tone} invite message for ${parsed.data.title} at ${parsed.data.startsAt}${parsed.data.location ? ` in ${parsed.data.location}` : ""}. Include this link exactly: ${parsed.data.inviteLink}`,
    },
  ]);

  await supabase.from("ai_history").insert({
    user_id: userData.user.id,
    feature: "invite_message",
    input: parsed.data,
    output: { message: aiText ?? fallback },
    success: Boolean(aiText),
  });

  return NextResponse.json(
    aiText ? { message: aiText, source: "ai" } : { fallback, source: "fallback" },
  );
}
