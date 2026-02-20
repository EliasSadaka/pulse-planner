import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClaimInviteButton } from "@/components/claim-invite-button";

export default async function InviteTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const user = await getCurrentUser();
  const { token } = await params;

  return (
    <div className="mx-auto max-w-lg py-8">
      <Card className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">You were invited to an event</h1>
        <p className="text-sm text-slate-600">
          Accept this invite to add the event to your dashboard and RSVP quickly.
        </p>
        {user ? (
          <ClaimInviteButton token={token} />
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Log in first to claim your invite.</p>
            <Link href={`/auth/login?next=/invite/${token}`}>
              <Button>Log in to continue</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
