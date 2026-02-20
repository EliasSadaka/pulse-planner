import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { claimInviteSchema } from "@/lib/schemas/invites";
import { jsonError } from "@/lib/http";
import { hashInviteToken } from "@/lib/invites";
import { zodErrorMessage } from "@/lib/validation";

type InviteRow = {
  id: string;
  event_id: string;
  invitee_email: string;
  expires_at: string | null;
  status: "pending" | "accepted" | "revoked" | "expired";
};

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return jsonError("Unauthorized", 401);

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = claimInviteSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error), 400);

  const tokenHash = hashInviteToken(parsed.data.token);
  const { data: invite } = await supabase
    .from("event_invites")
    .select("id,event_id,invitee_email,expires_at,status")
    .eq("token_hash", tokenHash)
    .single<InviteRow>();

  if (!invite) return jsonError("Invite not found.");
  if (invite.status !== "pending") return jsonError("Invite is no longer valid.");
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    await supabase.from("event_invites").update({ status: "expired" }).eq("id", invite.id);
    return jsonError("Invite expired.", 410);
  }
  if (invite.invitee_email && userData.user.email && invite.invitee_email !== userData.user.email) {
    return jsonError("Invite email does not match your account.", 403);
  }

  await supabase
    .from("event_invites")
    .update({
      invitee_user_id: userData.user.id,
      status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .eq("id", invite.id);

  await supabase.from("event_attendance").upsert(
    {
      event_id: invite.event_id,
      user_id: userData.user.id,
      status: "maybe",
      responded_at: new Date().toISOString(),
    },
    { onConflict: "event_id,user_id" },
  );

  return NextResponse.json({ eventId: invite.event_id });
}
