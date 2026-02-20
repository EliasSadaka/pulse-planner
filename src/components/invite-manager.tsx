"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function InviteManager({
  eventId,
  eventTitle,
  startsAt,
  location,
}: {
  eventId: string;
  eventTitle: string;
  startsAt: string;
  location: string | null;
}) {
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function createInvite() {
    setLoading(true);
    const response = await fetch(`/api/events/${eventId}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteeEmail: email || undefined, expiresInDays: 7 }),
    });
    const data = (await response.json()) as { inviteUrl?: string };
    setInviteLink(data.inviteUrl ?? "");
    setLoading(false);
  }

  async function generateMessage() {
    if (!inviteLink) {
      return;
    }

    const response = await fetch("/api/ai/invite-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: eventTitle,
        startsAt,
        location,
        tone: "warm",
        inviteLink,
      }),
    });
    const data = (await response.json()) as { message?: string; fallback?: string };
    setMessage(data.message ?? data.fallback ?? "");
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Invite people</h3>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="invitee@email.com (optional)"
      />
      <Button type="button" onClick={createInvite} disabled={loading}>
        {loading ? "Generating..." : "Generate invite link"}
      </Button>
      {inviteLink ? (
        <div className="space-y-2">
          <Input readOnly value={inviteLink} />
          <Button type="button" variant="secondary" onClick={() => navigator.clipboard.writeText(inviteLink)}>
            Copy link
          </Button>
          <Button type="button" variant="ghost" onClick={generateMessage}>
            Generate AI invite message
          </Button>
        </div>
      ) : null}
      {message ? <Textarea readOnly value={message} rows={5} /> : null}
    </div>
  );
}
