import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type InviteRow = {
  id: string;
  event_id: string;
  invitee_email: string;
  status: string;
  created_at: string;
  events: { title: string } | null;
};

export default async function InvitationsPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("event_invites")
    .select("id,event_id,invitee_email,status,created_at,events(title)")
    .or(`invitee_user_id.eq.${user.id},invitee_email.eq.${user.email ?? ""}`)
    .order("created_at", { ascending: false })
    .returns<InviteRow[]>();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Invitations</h1>
      {data?.length ? (
        <div className="grid gap-3">
          {data.map((invite) => (
            <Card key={invite.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{invite.events?.title ?? "Event unavailable"}</p>
                <p className="text-sm text-slate-600">Status: {invite.status}</p>
              </div>
              <Link href={`/events/${invite.event_id}`}>
                <Button variant="secondary">Open</Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
          No invitations right now.
        </p>
      )}
    </div>
  );
}
