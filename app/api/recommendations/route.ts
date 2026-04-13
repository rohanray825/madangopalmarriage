import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailNotifications, matchRecommendations } from "@/db/schema";
import { adminRecommendationSchema } from "@/lib/validations/profile";
import { getUserById, requireAdminUser } from "@/lib/auth";
import { sendRecommendationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const adminUser = await requireAdminUser();
    const body = (await request.json()) as {
      recipientUserId: string;
      candidateUserId: string;
      recommendedByAdminName: string;
      messageForRecipient: string;
      sendEmail: boolean;
    };

    const parsed = adminRecommendationSchema.parse({
      candidateUserId: body.candidateUserId,
      recommendedByAdminName: body.recommendedByAdminName,
      messageForRecipient: body.messageForRecipient,
      sendEmail: body.sendEmail,
    });

    const recipient = await getUserById(body.recipientUserId);
    const candidate = await getUserById(parsed.candidateUserId);

    if (!recipient || !candidate) {
      return NextResponse.json({ message: "Recipient or candidate not found." }, { status: 404 });
    }

    if (recipient.id === candidate.id) {
      return NextResponse.json(
        { message: "Recipient and suggested candidate must be different devotees." },
        { status: 400 }
      );
    }

    const [recommendation] = await db
      .insert(matchRecommendations)
      .values({
        recipientUserId: recipient.id,
        candidateUserId: candidate.id,
        recommendedByUserId: adminUser.id,
        messageForRecipient: parsed.messageForRecipient,
        status: parsed.sendEmail ? "sent" : "draft",
        emailedAt: parsed.sendEmail ? new Date() : null,
      })
      .returning();

    if (parsed.sendEmail) {
      const emailResult = await sendRecommendationEmail({
        to: recipient.email,
        recipientName: recipient.fullName ?? recipient.email,
        candidateName: candidate.fullName ?? candidate.email,
        adminName: parsed.recommendedByAdminName,
        message: parsed.messageForRecipient,
      });

      await db.insert(emailNotifications).values({
        recommendationId: recommendation.id,
        recipientEmail: recipient.email,
        status: emailResult.skipped ? "queued" : "sent",
        providerMessageId: emailResult.id,
        sentAt: emailResult.skipped ? null : new Date(),
      });
    }

    return NextResponse.json({
      message: "Recommendation created and delivered to the user dashboard.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to create recommendation." }, { status: 400 });
  }
}
