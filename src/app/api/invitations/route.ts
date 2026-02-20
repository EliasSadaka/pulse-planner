import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/http";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return jsonError("Unauthorized", 401);

  const { data, error } = await supabase
    .from("event_invites")
    .select("id,event_id,invitee_email,status,created_at,expires_at")
    .or(`invitee_user_id.eq.${userData.user.id},invitee_email.eq.${userData.user.email ?? ""}`)
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 400);
  return NextResponse.json({ invitations: data ?? [] });
}
