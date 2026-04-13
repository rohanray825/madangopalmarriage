import Link from "next/link";
import { redirect } from "next/navigation";
import { BellRing, FilePenLine, LayoutDashboard, PhoneCall, Settings, Sparkles } from "lucide-react";
import { DatabaseSetupError, ensureUserRecord } from "@/lib/auth";
import { getProfileWorkspace, getRecommendationsForUser } from "@/lib/queries";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatabaseSetupNotice } from "@/components/setup/database-setup-notice";

export default async function DashboardPage() {
  let dbUser;

  try {
    dbUser = await ensureUserRecord();
  } catch (error) {
    if (error instanceof DatabaseSetupError) {
      return <DatabaseSetupNotice />;
    }

    throw error;
  }

  if (!dbUser) {
    redirect("/sign-in");
  }

  if (dbUser.role === "admin") {
    redirect("/admin");
  }

  const [workspace, recommendations] = await Promise.all([
    getProfileWorkspace(dbUser.id),
    getRecommendationsForUser(dbUser.id),
  ]);

  const completion = workspace?.devoteeProfile?.completionPercent ?? 0;

  return (
    <PageShell className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Badge>Devotee dashboard</Badge>
            <h1 className="text-3xl font-semibold sm:text-4xl">Welcome back, {dbUser.fullName ?? "devotee"}.</h1>
            <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Complete your questionnaire, keep your profile current, and review any private
              recommendations the admin team has shared with you.
            </p>
          </div>
          <div className="rounded-[2rem] bg-[#fff7eb] p-5 text-right">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">Profile completion</p>
            <p className="text-4xl font-semibold text-[var(--primary)]">{completion}%</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/profile" className="glass-panel rounded-[2rem] p-6 transition hover:-translate-y-1">
          <FilePenLine className="mb-4 h-8 w-8 text-[var(--primary)]" />
          <h2 className="text-xl font-semibold">Edit questionnaire</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Save drafts progressively or submit a full profile for admin review.
          </p>
        </Link>
        <Link href="/recommendations" className="glass-panel rounded-[2rem] p-6 transition hover:-translate-y-1">
          <BellRing className="mb-4 h-8 w-8 text-[var(--primary)]" />
          <h2 className="text-xl font-semibold">View recommendations</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Recommendations sent by admin appear here and are also delivered by email.
          </p>
        </Link>
        <Link href="/account" className="glass-panel rounded-[2rem] p-6 transition hover:-translate-y-1">
          <Settings className="mb-4 h-8 w-8 text-[var(--primary)]" />
          <h2 className="text-xl font-semibold">Account settings</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Review your role, email verification state, and sign-in identity details.
          </p>
        </Link>
        <Link href="/contact" className="glass-panel rounded-[2rem] p-6 transition hover:-translate-y-1">
          <PhoneCall className="mb-4 h-8 w-8 text-[var(--primary)]" />
          <h2 className="text-xl font-semibold">Contact support</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Reach the admin team quickly, with a phone-first support option and message form.
          </p>
        </Link>
      </section>

      <section className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">Recent activity</p>
            <h2 className="text-2xl font-semibold">Recommendation summary</h2>
          </div>
          <Link href="/recommendations">
            <Button variant="secondary">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Open inbox
            </Button>
          </Link>
        </div>
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.slice(0, 2).map((row) => (
              <div
                key={row.recommendation.id}
                className="rounded-[1.5rem] border border-[var(--border)] bg-white/60 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{row.candidate.fullName ?? row.candidate.email}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {row.candidateProfile?.city ?? "City pending"}, {row.candidateProfile?.state ?? "State pending"}
                    </p>
                  </div>
                  <Badge>{row.recommendation.status}</Badge>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{row.recommendation.messageForRecipient}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] bg-[#fff8ee] p-6 text-sm leading-7 text-[var(--muted)]">
            No recommendations have been shared yet. Keep your questionnaire complete so the admin
            team has the full context when matching devotees.
          </div>
        )}
        <div className="mt-5 inline-flex items-center gap-2 text-sm text-[var(--primary)]">
          <Sparkles className="h-4 w-4" />
          Recommendations are private and manually curated.
        </div>
      </section>
    </PageShell>
  );
}
