"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileForm({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) {
  const [name, setName] = useState(fullName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: name }),
    });
    setMessage(response.ok ? "Profile updated." : "Could not update profile.");
    setSaving(false);
  }

  return (
    <form onSubmit={onSave} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <Input readOnly value={email} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Display name</label>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
