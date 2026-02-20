import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/http";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return jsonError("Unauthorized", 401);

  const { data: invite } = await supabase
    .from("event_invites")
    .select("id,inviter_id")
    .eq("id", id)
    .single<{ id: string; inviter_id: string }>();

  if (!invite || invite.inviter_id !== userData.user.id) {
    return jsonError("Forbidden", 403);
  }

  const { error } = await supabase
    .from("event_invites")
    .update({ status: "revoked" })
    .eq("id", id);
  if (error) return jsonError(error.message, 400);

  return NextResponse.json({ success: true });
}
