import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Search } from "lucide-react";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { RecommendationForm } from "@/components/admin/recommendation-form";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdminUser } from "@/lib/auth";
import { getAdminProfiles, getAdminRecommendationFeed } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  const { q } = await searchParams;
  const [profiles, recommendationFeed] = await Promise.all([
    getAdminProfiles(q),
    getAdminRecommendationFeed(),
  ]);

  const users = profiles.map((row) => ({
    id: row.user.id,
    name: row.user.fullName ?? "",
    email: row.user.email,
  }));

  return (
    <PageShell className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge>Admin dashboard</Badge>
            <h1 className="text-3xl font-semibold sm:text-4xl">Manual matchmaking workspace</h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
              Filter profiles, inspect devotional and family context, and share recommendations by
              email plus in-app inbox delivery.
            </p>
          </div>
          <div className="flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <form className="w-full sm:max-w-md" action="/admin">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <Input
                  name="q"
                  defaultValue={q}
                  className="pl-10"
                  placeholder="Search by name, email, city, or state"
                />
              </label>
            </form>
            <a href="/api/admin/export-completed-profiles">
              <Button variant="secondary" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export completed users
              </Button>
            </a>
          </div>
        </div>
      </section>

      <RecommendationForm users={users} />

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          {profiles.map((row) => (
            <article key={row.user.id} className="glass-panel rounded-[2rem] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold">{row.user.fullName ?? row.user.email}</h2>
                    <Badge>{row.user.onboardingStatus}</Badge>
                  </div>
                  <p className="text-sm text-[var(--muted)]">{row.user.email}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {row.devoteeProfile?.city ?? "City pending"},{" "}
                    {row.devoteeProfile?.state ?? "State pending"} |{" "}
                    {row.devoteeProfile?.gender ?? "Gender pending"} |{" "}
                    {row.devoteeProfile?.rounds ?? "Rounds pending"} rounds
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <Link
                    href={`/admin/profiles/${row.user.id}`}
                    className="rounded-full bg-[var(--primary)] px-4 py-2 text-center text-sm font-semibold text-white"
                  >
                    View details
                  </Link>
                  <DeleteUserButton
                    userId={row.user.id}
                    userLabel={row.user.fullName ?? row.user.email}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="glass-panel rounded-[2rem] p-5 sm:p-6">
          <h3 className="text-2xl font-semibold">Recent recommendation activity</h3>
          <div className="mt-5 space-y-4">
            {recommendationFeed.length > 0 ? (
              recommendationFeed.slice(0, 6).map((row) => (
                <div key={row.recommendation.id} className="rounded-[1.5rem] bg-white/65 p-4">
                  <p className="font-semibold">{row.recipient.fullName ?? row.recipient.email}</p>
                  <p className="text-sm text-[var(--muted)]">{row.recommendation.status}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    {row.recommendation.messageForRecipient.slice(0, 140)}
                    {row.recommendation.messageForRecipient.length > 140 ? "..." : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--muted)]">No recommendations created yet.</p>
            )}
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
