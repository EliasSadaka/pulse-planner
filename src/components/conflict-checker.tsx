"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ConflictChecker({
  startsAt,
  endsAt,
}: {
  startsAt: string;
  endsAt: string;
}) {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function checkConflicts() {
    setLoading(true);
    const response = await fetch("/api/ai/conflict-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startsAt, endsAt }),
    });
    const data = (await response.json()) as { analysis?: string; fallback?: string };
    setResult(data.analysis ?? data.fallback ?? "No analysis available.");
    setLoading(false);
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Schedule conflict checker</h3>
      <Button type="button" variant="secondary" onClick={checkConflicts} disabled={loading}>
        {loading ? "Checking..." : "Check with AI"}
      </Button>
      {result ? <p className="text-sm text-slate-700">{result}</p> : null}
    </div>
  );
}
