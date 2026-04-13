import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { ensureUserRecord } from "@/lib/auth";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";

export default async function AccountPage() {
  const dbUser = await ensureUserRecord();
  const clerkUser = await currentUser();

  if (!dbUser || !clerkUser) {
    redirect("/sign-in");
  }

  if (dbUser.role === "admin") {
    redirect("/admin");
  }

  const emailStatus = clerkUser.primaryEmailAddress?.verification?.status ?? "unknown";

  return (
    <PageShell className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{dbUser.role}</Badge>
          <Badge>{dbUser.onboardingStatus}</Badge>
          <Badge>{emailStatus}</Badge>
        </div>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Account settings</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-white/65 p-5">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">Primary email</p>
            <p className="mt-2 text-lg font-semibold">{dbUser.email}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/65 p-5">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">Clerk user id</p>
            <p className="mt-2 break-all text-sm font-semibold">{dbUser.clerkUserId}</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
