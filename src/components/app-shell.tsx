import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/search", label: "Search" },
  { href: "/invitations", label: "Invitations" },
  { href: "/settings/profile", label: "Settings" },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  async function signOut() {
    "use server";
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link href={user ? "/dashboard" : "/"} className="font-semibold text-slate-900">
            PulsePlanner
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    {link.label}
                  </Link>
                ))}
                <form action={signOut}>
                  <Button variant="secondary" type="submit">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                  Log in
                </Link>
                <Link href="/auth/signup" className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
