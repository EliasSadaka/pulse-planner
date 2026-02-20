import Link from "next/link";
import type { EventRecord } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

export function EventCard({ event }: { event: EventRecord }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
          <p className="text-sm text-slate-600">{formatDateTime(event.starts_at)}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          {new Date(event.starts_at) > new Date() ? "upcoming" : "past"}
        </span>
      </div>
      <p className="line-clamp-2 text-sm text-slate-600">{event.description ?? "No description provided yet."}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{event.location || "No location set"}</span>
        <Link href={`/events/${event.id}`} className="font-medium text-indigo-600 hover:text-indigo-500">
          View event
        </Link>
      </div>
    </Card>
  );
}
