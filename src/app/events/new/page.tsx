import { requireUser } from "@/lib/auth";
import { EventForm } from "@/components/event-form";
import { Card } from "@/components/ui/card";

export default async function NewEventPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-3xl py-4">
      <Card>
        <h1 className="text-2xl font-semibold text-slate-900">Create event</h1>
        <p className="mt-1 text-sm text-slate-600">Set the details and invite participants in seconds.</p>
        <div className="mt-5">
          <EventForm />
        </div>
      </Card>
    </div>
  );
}
