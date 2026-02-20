import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md py-10">
      <Card className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Create your PulsePlanner account</h1>
          <p className="mt-1 text-sm text-slate-600">Invite collaborators and track event attendance with ease.</p>
        </div>
        <AuthForm mode="signup" />
        <p className="text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
