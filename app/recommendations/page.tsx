import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ensureUserRecord } from "@/lib/auth";
import { db } from "@/lib/db";
import { matchRecommendations } from "@/db/schema";
import { getRecommendationsForUser } from "@/lib/queries";
import { PageShell } from "@/components/layout/page-shell";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";

export default async function RecommendationsPage() {
  const dbUser = await ensureUserRecord();
  if (!dbUser) {
    redirect("/sign-in");
  }

  if (dbUser.role === "admin") {
    redirect("/admin");
  }

  await db
    .update(matchRecommendations)
    .set({
      status: "viewed",
      viewedAt: new Date(),
    })
    .where(and(eq(matchRecommendations.recipientUserId, dbUser.id), eq(matchRecommendations.status, "sent")));

  const recommendations = await getRecommendationsForUser(dbUser.id);

  return (
    <PageShell className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <h1 className="text-3xl font-semibold sm:text-4xl">Your recommendations</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          These introductions were shared manually by the admin team and may also have been sent to
          your email. Review them prayerfully and continue offline as guided by your elders and counsellors.
        </p>
      </section>

      {recommendations.length > 0 ? (
        recommendations.map((row) => (
          <RecommendationCard
            key={row.recommendation.id}
            candidateName={row.candidate.fullName ?? row.candidate.email}
            photoUrl={row.candidatePhoto?.publicUrl}
            city={row.candidateProfile?.city}
            state={row.candidateProfile?.state}
            rounds={row.candidateProfile?.rounds}
            status={row.recommendation.status}
            message={row.recommendation.messageForRecipient}
            createdAt={row.recommendation.createdAt}
          />
        ))
      ) : (
        <div className="glass-panel rounded-[2rem] p-5 sm:p-8 text-sm leading-7 text-[var(--muted)]">
          No recommendations have been shared with you yet.
        </div>
      )}
    </PageShell>
  );
}
