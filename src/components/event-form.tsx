"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EventRecord } from "@/lib/types";
import { toIsoDateTimeLocal } from "@/lib/utils";

export function EventForm({ event }: { event?: EventRecord }) {
  const router = useRouter();
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [startsAt, setStartsAt] = useState(
    event ? toIsoDateTimeLocal(event.starts_at) : "",
  );
  const [endsAt, setEndsAt] = useState(event ? toIsoDateTimeLocal(event.ends_at) : "");
  const [isPublic, setIsPublic] = useState(event?.is_public ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    [],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title,
      description,
      location,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      timezone,
      isPublic,
    };

    const url = event ? `/api/events/${event.id}` : "/api/events";
    const method = event ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not save event.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as { eventId?: string };
    router.push(`/events/${data.eventId ?? event?.id}`);
    router.refresh();
  }

  async function enhanceDescription() {
    if (!description.trim()) {
      return;
    }

    setEnhancing(true);
    const response = await fetch("/api/ai/description-enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: description, tone: "friendly" }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      description?: string;
      fallback?: string;
    };
    if (data.description || data.fallback) {
      setDescription(data.description ?? data.fallback ?? description);
    }
    setEnhancing(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium text-slate-700">
          Title
        </label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="description" className="text-sm font-medium text-slate-700">
            Description
          </label>
          <Button type="button" variant="ghost" onClick={enhanceDescription} disabled={enhancing}>
            {enhancing ? "Enhancing..." : "Enhance with AI"}
          </Button>
        </div>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="startsAt" className="text-sm font-medium text-slate-700">
            Start
          </label>
          <Input
            id="startsAt"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="endsAt" className="text-sm font-medium text-slate-700">
            End
          </label>
          <Input
            id="endsAt"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="location" className="text-sm font-medium text-slate-700">
          Location
        </label>
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Publicly discoverable event
      </label>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : event ? "Save changes" : "Create event"}
      </Button>
    </form>
  );
}
