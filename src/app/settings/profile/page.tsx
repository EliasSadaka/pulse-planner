import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfileSettingsPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single<{ full_name: string | null }>();

  return (
    <div className="mx-auto max-w-xl">
      <Card className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Profile settings</h1>
          <p className="mt-1 text-sm text-slate-600">Keep your account details up to date.</p>
        </div>
        <ProfileForm fullName={profile?.full_name ?? ""} email={user.email ?? ""} />
      </Card>
    </div>
  );
}
