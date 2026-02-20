import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getEvents } from "@/lib/data/events";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await requireUser();
  const myEvents = await getEvents({ scope: "my", sort: "nearest" });
  const invited = await getEvents({ scope: "invited", sort: "nearest" });

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Signed in as {user.email}</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Your scheduling hub</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage events, RSVPs, and invites from one place.
        </p>
        <div className="mt-4 flex gap-2">
          <Link href="/events/new">
            <Button>Create event</Button>
          </Link>
          <Link href="/search">
            <Button variant="secondary">Explore events</Button>
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">My upcoming events</h2>
        {myEvents.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {myEvents.slice(0, 6).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
            No events yet. Create your first event to get started.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Invited to</h2>
        {invited.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {invited.slice(0, 6).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
            You have no pending invitations yet.
          </p>
        )}
      </section>
    </div>
  );
}
