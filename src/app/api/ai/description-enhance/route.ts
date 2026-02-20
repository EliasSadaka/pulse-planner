import { NextResponse } from "next/server";
import { descriptionEnhanceSchema } from "@/lib/schemas/ai";
import { runAi } from "@/lib/ai/provider";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/http";
import { zodErrorMessage } from "@/lib/validation";

function fallbackEnhance(notes: string) {
  return `Event Overview\n\n${notes.trim()}\n\nWhat to expect:\n- Clear goals\n- Agenda with timing\n- Key outcomes and follow-up`;
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return jsonError("Unauthorized", 401);

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = descriptionEnhanceSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error), 400);

  const prompt = `Rewrite the following event notes into a polished ${parsed.data.tone} event description.\n\nNotes:\n${parsed.data.notes}`;
  const aiText = await runAi([
    {
      role: "system",
      content:
        "You are an event planning assistant. Return concise, high-quality copy without markdown fences.",
    },
    { role: "user", content: prompt },
  ]);

  const fallback = fallbackEnhance(parsed.data.notes);
  await supabase.from("ai_history").insert({
    user_id: userData.user.id,
    feature: "description_enhance",
    input: parsed.data,
    output: { description: aiText ?? fallback },
    success: Boolean(aiText),
  });

  return NextResponse.json(
    aiText ? { description: aiText, source: "ai" } : { fallback, source: "fallback" },
  );
}
