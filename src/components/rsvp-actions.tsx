"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AttendanceStatus } from "@/lib/types";

const options: AttendanceStatus[] = ["attending", "maybe", "declined"];

export function RsvpActions({
  eventId,
  initialStatus,
}: {
  eventId: string;
  initialStatus?: AttendanceStatus;
}) {
  const [status, setStatus] = useState<AttendanceStatus | undefined>(initialStatus);
  const [saving, setSaving] = useState(false);

  async function setRsvp(nextStatus: AttendanceStatus) {
    setSaving(true);
    await fetch(`/api/events/${eventId}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setStatus(nextStatus);
    setSaving(false);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((item) => (
        <Button
          key={item}
          type="button"
          variant={status === item ? "primary" : "secondary"}
          disabled={saving}
          onClick={() => setRsvp(item)}
        >
          {item}
        </Button>
      ))}
    </div>
  );
}
