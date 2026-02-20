import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getEventById } from "@/lib/data/events";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { RsvpActions } from "@/components/rsvp-actions";
import { InviteManager } from "@/components/invite-manager";
import { ConflictChecker } from "@/components/conflict-checker";
import type { AttendanceStatus } from "@/lib/types";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  const user = await getCurrentUser();

  if (!event) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();

  const { data: attendanceRows } = await supabase
    .from("event_attendance")
    .select("user_id,status")
    .eq("event_id", event.id)
    .returns<{ user_id: string; status: AttendanceStatus }[]>();

  const counts = {
    attending: attendanceRows?.filter((row) => row.status === "attending").length ?? 0,
    maybe: attendanceRows?.filter((row) => row.status === "maybe").length ?? 0,
    declined: attendanceRows?.filter((row) => row.status === "declined").length ?? 0,
  };

  let myStatus: AttendanceStatus | undefined;
  if (user) {
    myStatus = attendanceRows?.find((row) => row.user_id === user.id)?.status;
  }

  const isCreator = user?.id === event.creator_id;

  return (
    <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
      <Card className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{event.title}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {formatDateTime(event.starts_at)} to {formatDateTime(event.ends_at)}
            </p>
          </div>
          {isCreator ? (
            <Link href={`/events/${event.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
          ) : null}
        </div>

        <p className="text-slate-700">{event.description || "No description available."}</p>
        <p className="text-sm text-slate-600">Location: {event.location || "Not specified"}</p>
        <div className="flex flex-wrap gap-2 text-sm text-slate-700">
          <span className="rounded-full bg-emerald-100 px-3 py-1">Attending: {counts.attending}</span>
          <span className="rounded-full bg-amber-100 px-3 py-1">Maybe: {counts.maybe}</span>
          <span className="rounded-full bg-rose-100 px-3 py-1">Declined: {counts.declined}</span>
        </div>

        {user ? (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">Your RSVP</h2>
            <RsvpActions eventId={event.id} initialStatus={myStatus} />
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            Log in to RSVP and receive updates for this event.
          </p>
        )}
      </Card>

      <div className="space-y-4">
        <ConflictChecker startsAt={event.starts_at} endsAt={event.ends_at} />
        {isCreator ? (
          <InviteManager
            eventId={event.id}
            eventTitle={event.title}
            startsAt={event.starts_at}
            location={event.location}
          />
        ) : null}
      </div>
    </div>
  );
}
