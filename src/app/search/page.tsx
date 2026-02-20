import { getEvents } from "@/lib/data/events";
import { eventFilterSchema } from "@/lib/schemas/events";
import { SearchFilters } from "@/components/search-filters";
import { EventCard } from "@/components/event-card";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const normalized = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const filters = eventFilterSchema.parse(normalized);
  const events = await getEvents(filters);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Explore events</h1>
      <SearchFilters params={normalized} />
      {events.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
          No events match these filters.
        </p>
      )}
    </div>
  );
}
