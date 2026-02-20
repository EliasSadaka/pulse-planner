import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { jsonError } from "@/lib/http";
import { createInviteSchema } from "@/lib/schemas/invites";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createInviteToken, hashInviteToken } from "@/lib/invites";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { zodErrorMessage } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return jsonError("Unauthorized", 401);

  const { data: event } = await supabase
    .from("events")
    .select("creator_id")
    .eq("id", id)
    .single<{ creator_id: string }>();

  if (!event || event.creator_id !== userData.user.id) {
    return jsonError("Only event creator can send invites.", 403);
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = createInviteSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error), 400);

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("event_invites")
    .select("*", { count: "exact", head: true })
    .eq("inviter_id", userData.user.id)
    .gte("created_at", oneHourAgo);
  if ((count ?? 0) > 40) {
    return jsonError("Invite limit reached. Please wait and try again.", 429);
  }

  const token = createInviteToken();
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date(
    Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  let inviteeUserId: string | null = null;
  if (parsed.data.inviteeEmail) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", parsed.data.inviteeEmail)
      .single<{ id: string }>();
    inviteeUserId = profile?.id ?? null;
  }

  const { error } = await supabase.from("event_invites").insert({
    event_id: id,
    inviter_id: userData.user.id,
    invitee_email: parsed.data.inviteeEmail ?? userData.user.email ?? "unknown@example.com",
    invitee_user_id: inviteeUserId,
    token_hash: tokenHash,
    status: "pending",
    expires_at: expiresAt,
  });

  if (error) return jsonError(error.message, 400);

  const inviteUrl = `${env.APP_URL}/invite/${token}`;
  return NextResponse.json({ inviteUrl });
}
