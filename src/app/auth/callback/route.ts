import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", env.APP_URL));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/auth/login", env.APP_URL));
  }

  const user = data.user;
  await supabaseAdmin.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name ?? null,
  });

  if (user.email) {
    await supabaseAdmin
      .from("event_invites")
      .update({ invitee_user_id: user.id })
      .eq("invitee_email", user.email)
      .is("invitee_user_id", null);
  }

  return NextResponse.redirect(new URL(next, env.APP_URL));
}
