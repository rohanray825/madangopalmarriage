import "server-only";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { devoteeProfiles, devoteeQuestionnaires, users, type Role } from "@/db/schema";
import { calculateAge } from "@/lib/utils";
import type { QuestionnaireValues } from "@/lib/validations/profile";

export class DatabaseSetupError extends Error {
  constructor(message = "Database schema is not initialized. Run `npm run db:push`.") {
    super(message);
    this.name = "DatabaseSetupError";
  }
}

function isMissingRelationError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "42P01"
  );
}

function rethrowSetupError(error: unknown): never {
  if (isMissingRelationError(error)) {
    throw new DatabaseSetupError();
  }

  throw error;
}

export async function getCurrentDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const [record] = await db.select().from(users).where(eq(users.clerkUserId, userId)).limit(1);
    return record ?? null;
  } catch (error) {
    rethrowSetupError(error);
  }
}

export async function ensureUserRecord() {
  const [session, clerkUser] = await Promise.all([auth(), currentUser()]);

  if (!session.userId || !clerkUser) {
    return null;
  }

  const client = await clerkClient();
  const userRole = (clerkUser.publicMetadata?.role as Role | undefined) ?? "user";
  const emailAddress = clerkUser.primaryEmailAddress?.emailAddress ?? "";
  const emailVerified =
    clerkUser.primaryEmailAddress?.verification?.status === "verified";

  try {
    const existing = await getCurrentDbUser();
    if (existing) {
      const nextFullName =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || existing.fullName;
      const nextEmail = emailAddress || existing.email;
      const shouldUpdateExisting =
        existing.role !== userRole ||
        existing.email !== nextEmail ||
        existing.fullName !== nextFullName ||
        existing.emailVerified !== emailVerified;

      if (shouldUpdateExisting) {
        const [updated] = await db
          .update(users)
          .set({
            role: userRole,
            email: nextEmail,
            fullName: nextFullName,
            emailVerified,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existing.id))
          .returning();

        return updated;
      }

      return existing;
    }

    const [created] = await db
      .insert(users)
      .values({
        clerkUserId: session.userId,
        email: emailAddress,
        fullName: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
        role: userRole,
        emailVerified,
      })
      .onConflictDoUpdate({
        target: users.clerkUserId,
        set: {
          email: emailAddress,
          fullName: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
          role: userRole,
          emailVerified,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!clerkUser.publicMetadata?.role) {
      await client.users.updateUserMetadata(session.userId, {
        publicMetadata: {
          role: userRole,
        },
      });
    }

    return created;
  } catch (error) {
    rethrowSetupError(error);
  }
}

export async function requireSignedInUser() {
  const dbUser = await ensureUserRecord();
  if (!dbUser) {
    throw new Error("Unauthorized");
  }

  return dbUser;
}

export async function requireAdminUser() {
  const dbUser = await requireSignedInUser();

  if (dbUser.role !== "admin") {
    throw new Error("Forbidden");
  }

  return dbUser;
}

export async function upsertQuestionnaireSummary(userId: string, answers: QuestionnaireValues) {
  const age = calculateAge(answers.birthDate);

  await db
    .insert(devoteeProfiles)
    .values({
      userId,
      profileHeadline: `${answers.name} from ${answers.city}`,
      city: answers.city,
      state: answers.state,
      gender: answers.gender,
      age,
      rounds: answers.rounds,
      isInitiated: answers.isInitiated === "yes",
      completionPercent: 100,
    })
    .onConflictDoUpdate({
      target: devoteeProfiles.userId,
      set: {
        profileHeadline: `${answers.name} from ${answers.city}`,
        city: answers.city,
        state: answers.state,
        gender: answers.gender,
        age,
        rounds: answers.rounds,
        isInitiated: answers.isInitiated === "yes",
        completionPercent: 100,
        updatedAt: new Date(),
      },
    });

  await db
    .update(users)
    .set({
      fullName: answers.name,
      onboardingStatus: "completed",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  const existing = await db
    .select()
    .from(devoteeQuestionnaires)
    .where(eq(devoteeQuestionnaires.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(devoteeQuestionnaires)
      .set({
        answers,
        isDraft: false,
        revision: existing[0].revision + 1,
        updatedAt: new Date(),
      })
      .where(eq(devoteeQuestionnaires.userId, userId));
  } else {
    await db.insert(devoteeQuestionnaires).values({
      userId,
      answers,
      isDraft: false,
    });
  }
}

export async function saveDraftQuestionnaire(
  userId: string,
  answers: Partial<QuestionnaireValues>,
) {
  const existing = await db
    .select()
    .from(devoteeQuestionnaires)
    .where(eq(devoteeQuestionnaires.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(devoteeQuestionnaires)
      .set({
        answers: {
          ...(existing[0].answers as Record<string, unknown>),
          ...answers,
        },
        isDraft: true,
        revision: existing[0].revision + 1,
        updatedAt: new Date(),
      })
      .where(eq(devoteeQuestionnaires.userId, userId));
  } else {
    await db.insert(devoteeQuestionnaires).values({
      userId,
      answers,
      isDraft: true,
    });
  }

  await db
    .update(users)
    .set({
      onboardingStatus: "draft",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function getQuestionnaireForUser(userId: string) {
  const [row] = await db
    .select({
      questionnaireId: devoteeQuestionnaires.id,
      answers: devoteeQuestionnaires.answers,
      isDraft: devoteeQuestionnaires.isDraft,
    })
    .from(devoteeQuestionnaires)
    .where(eq(devoteeQuestionnaires.userId, userId))
    .limit(1);

  return row ?? null;
}

export async function getUserById(id: string) {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row ?? null;
}

export async function getUserByClerkId(clerkUserId: string) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);
  return row ?? null;
}

export async function getCurrentUserRole() {
  const dbUser = await ensureUserRecord();
  return dbUser?.role ?? null;
}
