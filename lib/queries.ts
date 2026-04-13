import "server-only";

import { and, desc, eq, ilike, ne, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  devoteeProfiles,
  devoteeQuestionnaires,
  emailNotifications,
  matchRecommendations,
  profilePhotos,
  users,
} from "@/db/schema";

export async function getProfileWorkspace(userId: string) {
  const [profile] = await db
    .select({
      user: users,
      devoteeProfile: devoteeProfiles,
      questionnaire: devoteeQuestionnaires,
      photo: profilePhotos,
    })
    .from(users)
    .leftJoin(devoteeProfiles, eq(devoteeProfiles.userId, users.id))
    .leftJoin(devoteeQuestionnaires, eq(devoteeQuestionnaires.userId, users.id))
    .leftJoin(profilePhotos, eq(profilePhotos.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  return profile ?? null;
}

export async function getRecommendationsForUser(userId: string) {
  const rows = await db
    .select({
      recommendation: matchRecommendations,
      candidate: users,
      candidateProfile: devoteeProfiles,
      candidatePhoto: profilePhotos,
    })
    .from(matchRecommendations)
    .innerJoin(users, eq(users.id, matchRecommendations.candidateUserId))
    .leftJoin(devoteeProfiles, eq(devoteeProfiles.userId, users.id))
    .leftJoin(profilePhotos, eq(profilePhotos.userId, users.id))
    .where(eq(matchRecommendations.recipientUserId, userId))
    .orderBy(desc(matchRecommendations.createdAt));

  return rows;
}

export async function getAdminProfiles(search?: string) {
  if (!search) {
    return db
      .select({
        user: users,
        devoteeProfile: devoteeProfiles,
        questionnaire: devoteeQuestionnaires,
        photo: profilePhotos,
      })
      .from(users)
      .leftJoin(devoteeProfiles, eq(devoteeProfiles.userId, users.id))
      .leftJoin(devoteeQuestionnaires, eq(devoteeQuestionnaires.userId, users.id))
      .leftJoin(profilePhotos, eq(profilePhotos.userId, users.id))
      .where(eq(users.role, "user"))
      .orderBy(desc(users.createdAt));
  }

  return db
    .select({
      user: users,
      devoteeProfile: devoteeProfiles,
      questionnaire: devoteeQuestionnaires,
      photo: profilePhotos,
    })
    .from(users)
    .leftJoin(devoteeProfiles, eq(devoteeProfiles.userId, users.id))
    .leftJoin(devoteeQuestionnaires, eq(devoteeQuestionnaires.userId, users.id))
    .leftJoin(profilePhotos, eq(profilePhotos.userId, users.id))
    .where(
      and(
        eq(users.role, "user"),
        or(
          ilike(users.fullName, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(devoteeProfiles.city, `%${search}%`),
          ilike(devoteeProfiles.state, `%${search}%`)
        )
      )
    )
    .orderBy(desc(users.createdAt));
}

export async function getAdminRecommendationFeed() {
  return db
    .select({
      recommendation: matchRecommendations,
      recipient: users,
      notification: emailNotifications,
    })
    .from(matchRecommendations)
    .innerJoin(users, eq(users.id, matchRecommendations.recipientUserId))
    .leftJoin(emailNotifications, eq(emailNotifications.recommendationId, matchRecommendations.id))
    .orderBy(desc(matchRecommendations.createdAt));
}

export async function getRecommendationCandidates(recipientUserId: string) {
  return db
    .select({
      user: users,
      devoteeProfile: devoteeProfiles,
    })
    .from(users)
    .leftJoin(devoteeProfiles, eq(devoteeProfiles.userId, users.id))
    .where(ne(users.id, recipientUserId))
    .orderBy(desc(users.createdAt));
}

export async function getCompletedProfilesForExport() {
  return db
    .select({
      user: users,
      devoteeProfile: devoteeProfiles,
      questionnaire: devoteeQuestionnaires,
      photo: profilePhotos,
    })
    .from(users)
    .leftJoin(devoteeProfiles, eq(devoteeProfiles.userId, users.id))
    .leftJoin(devoteeQuestionnaires, eq(devoteeQuestionnaires.userId, users.id))
    .leftJoin(profilePhotos, eq(profilePhotos.userId, users.id))
    .where(and(eq(users.role, "user"), eq(users.onboardingStatus, "completed")))
    .orderBy(desc(users.updatedAt));
}
