import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const onboardingStatusEnum = pgEnum("onboarding_status", [
  "not_started",
  "draft",
  "completed",
]);
export const recommendationStatusEnum = pgEnum("recommendation_status", [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "declined",
  "archived",
]);
export const notificationStatusEnum = pgEnum("notification_status", [
  "queued",
  "sent",
  "failed",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 255 }),
    role: roleEnum("role").notNull().default("user"),
    emailVerified: boolean("email_verified").notNull().default(false),
    onboardingStatus: onboardingStatusEnum("onboarding_status")
      .notNull()
      .default("not_started"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    clerkUserIdIdx: uniqueIndex("users_clerk_user_id_idx").on(table.clerkUserId),
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  })
);

export const devoteeProfiles = pgTable(
  "devotee_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    profileHeadline: varchar("profile_headline", { length: 180 }),
    city: varchar("city", { length: 120 }),
    state: varchar("state", { length: 120 }),
    gender: varchar("gender", { length: 20 }),
    age: integer("age"),
    rounds: varchar("rounds", { length: 16 }),
    isInitiated: boolean("is_initiated").default(false),
    completionPercent: integer("completion_percent").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: uniqueIndex("devotee_profiles_user_id_idx").on(table.userId),
  })
);

export const devoteeQuestionnaires = pgTable(
  "devotee_questionnaires",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    answers: jsonb("answers").notNull(),
    isDraft: boolean("is_draft").notNull().default(true),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    questionnaireUserIdx: uniqueIndex("devotee_questionnaires_user_id_idx").on(table.userId),
  })
);

export const profilePhotos = pgTable(
  "profile_photos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    publicUrl: text("public_url").notNull(),
    mimeType: varchar("mime_type", { length: 100 }),
    sizeBytes: integer("size_bytes"),
    isPrimary: boolean("is_primary").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    profilePhotoUserIdx: uniqueIndex("profile_photos_user_id_idx").on(table.userId),
  })
);

export const matchRecommendations = pgTable("match_recommendations", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipientUserId: uuid("recipient_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  candidateUserId: uuid("candidate_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recommendedByUserId: uuid("recommended_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  messageForRecipient: text("message_for_recipient").notNull(),
  status: recommendationStatusEnum("status").notNull().default("draft"),
  emailedAt: timestamp("emailed_at", { withTimezone: true }),
  viewedAt: timestamp("viewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const emailNotifications = pgTable("email_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  recommendationId: uuid("recommendation_id")
    .notNull()
    .references(() => matchRecommendations.id, { onDelete: "cascade" }),
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  notificationType: varchar("notification_type", { length: 50 }).notNull().default("recommendation"),
  status: notificationStatusEnum("status").notNull().default("queued"),
  providerMessageId: varchar("provider_message_id", { length: 255 }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

export type Role = (typeof roleEnum.enumValues)[number];
