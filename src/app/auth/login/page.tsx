import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md py-10">
      <Card className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Log in to PulsePlanner</h1>
          <p className="mt-1 text-sm text-slate-600">Welcome back. Continue planning with your team.</p>
        </div>
        <AuthForm mode="login" />
        <p className="text-sm text-slate-600">
          Need an account?{" "}
          <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
