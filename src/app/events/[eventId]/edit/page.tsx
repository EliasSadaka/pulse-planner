import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getEventById } from "@/lib/data/events";
import { EventForm } from "@/components/event-form";
import { Card } from "@/components/ui/card";
import { DeleteEventButton } from "@/components/delete-event-button";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const user = await requireUser();
  const { eventId } = await params;
  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  if (event.creator_id !== user.id) {
    redirect(`/events/${event.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl py-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Edit event</h1>
            <p className="mt-1 text-sm text-slate-600">Update details and save changes.</p>
          </div>
          <DeleteEventButton eventId={event.id} />
        </div>
        <div className="mt-5">
          <EventForm event={event} />
        </div>
      </Card>
    </div>
  );
}
