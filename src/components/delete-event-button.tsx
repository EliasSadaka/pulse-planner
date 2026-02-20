"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();

  async function onDelete() {
    const confirmed = window.confirm("Delete this event? This cannot be undone.");
    if (!confirmed) return;
    const response = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <Button variant="danger" type="button" onClick={onDelete}>
      Delete event
    </Button>
  );
}
