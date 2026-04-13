import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { devoteeQuestionnaires, profilePhotos, users } from "@/db/schema";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { formatDateLabel } from "@/lib/utils";

const sections = [
  {
    title: "Personal and devotional details",
    fields: [
      ["name", "Full name"],
      ["email", "Email"],
      ["gender", "Gender"],
      ["isInitiated", "Initiated"],
      ["initiatedName", "Initiated name"],
      ["birthDate", "Birth date"],
      ["birthTime", "Birth time"],
      ["birthPlace", "Birth place"],
      ["caste", "Caste"],
      ["height", "Height"],
      ["weight", "Weight"],
      ["languages", "Languages"],
      ["education", "Education"],
      ["working", "Working currently"],
      ["profession", "Profession"],
      ["jobLocation", "Job location"],
      ["salary", "Salary"],
      ["widow", "Widow / widower"],
      ["divorced", "Divorced"],
      ["rounds", "Rounds chanted daily"],
      ["regs", "Regulative principles followed"],
    ],
  },
  {
    title: "Contact and location",
    fields: [
      ["phone", "Phone number"],
      ["familyPhone", "Family phone number"],
      ["city", "City"],
      ["state", "State"],
      ["address", "Current address"],
      ["relocate", "Open to relocation"],
      ["counsellor", "Counsellor name"],
      ["counsellorPhone", "Counsellor phone number"],
      ["homeAddress", "Original home address"],
      ["homeCategory", "Home category"],
    ],
  },
  {
    title: "Family details",
    fields: [
      ["familyMembers", "Number of family members"],
      ["father", "Father's name"],
      ["mother", "Mother's name"],
      ["sibling", "Sibling name(s)"],
      ["parentsChanting", "Are parents chanting"],
    ],
  },
  {
    title: "About and expectations",
    fields: [
      ["aboutYou", "About the devotee"],
      ["expectations", "Expectations from life partner"],
    ],
  },
] as const;

function formatAnswer(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value.trim() ? value : "Not provided";
  if (value === null || value === undefined) return "Not provided";
  return String(value);
}

export default async function AdminProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  const { id } = await params;
  const [row] = await db
    .select({
      user: users,
      questionnaire: devoteeQuestionnaires,
      photo: profilePhotos,
    })
    .from(users)
    .leftJoin(devoteeQuestionnaires, eq(devoteeQuestionnaires.userId, users.id))
    .leftJoin(profilePhotos, eq(profilePhotos.userId, users.id))
    .where(eq(users.id, id))
    .limit(1);

  if (!row) {
    notFound();
  }

  const answers = (row.questionnaire?.answers as Record<string, unknown> | undefined) ?? {};
  const profileImage = row.photo?.publicUrl || (typeof answers.photoUrl === "string" ? answers.photoUrl : "");

  return (
    <PageShell className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-[1.75rem] bg-[#f9f1e6]">
            {profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profileImage} alt={row.user.fullName ?? row.user.email} className="h-full w-full object-cover" />
            ) : (
              <div className="px-4 text-center text-sm text-[var(--muted)]">No profile photo uploaded</div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{row.user.onboardingStatus}</Badge>
              <Badge>{row.user.emailVerified ? "verified" : "unverified"}</Badge>
            </div>
            <h1 className="text-3xl font-semibold sm:text-4xl">{row.user.fullName ?? row.user.email}</h1>
            <p className="text-sm text-[var(--muted)]">{row.user.email}</p>
            <p className="text-sm text-[var(--muted)]">Joined {formatDateLabel(row.user.createdAt.toISOString())}</p>
          </div>
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="glass-panel rounded-[2rem] p-5 sm:p-8">
          <h2 className="mb-5 text-2xl font-semibold">{section.title}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {section.fields.map(([key, label]) => (
              <div key={key} className="rounded-[1.5rem] bg-white/65 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">
                  {formatAnswer(key === "email" ? row.user.email : answers[key])}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </PageShell>
  );
}
