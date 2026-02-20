"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ClaimInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function claim() {
    setLoading(true);
    const response = await fetch("/api/invites/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = (await response.json()) as { eventId?: string; error?: string };
    if (!response.ok) {
      setStatus(data.error ?? "Unable to claim invite.");
      setLoading(false);
      return;
    }
    router.push(`/events/${data.eventId}`);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button onClick={claim} disabled={loading}>
        {loading ? "Claiming..." : "Claim invite"}
      </Button>
      {status ? <p className="text-sm text-rose-600">{status}</p> : null}
    </div>
  );
}
