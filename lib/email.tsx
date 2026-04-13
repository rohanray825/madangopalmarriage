import "server-only";

import * as React from "react";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendRecommendationEmail({
  to,
  recipientName,
  candidateName,
  adminName,
  message,
}: {
  to: string;
  recipientName: string;
  candidateName: string;
  adminName: string;
  message: string;
}) {
  if (!resend) {
    return {
      id: null,
      skipped: true,
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const fromEmail = process.env.RECOMMENDATION_FROM_EMAIL ?? "recommendations@example.com";

  const result = await resend.emails.send({
    from: fromEmail,
    to,
    subject: `A new devotional match recommendation is waiting for you`,
    react: (
      <div style={{ fontFamily: "Georgia, serif", color: "#2f2518", lineHeight: 1.6 }}>
        <h1 style={{ color: "#7c4d17" }}>Hare Krishna</h1>
        <p>Dear {recipientName},</p>
        <p>
          {adminName} has shared a new marriage recommendation for you. The suggested devotee is{" "}
          <strong>{candidateName}</strong>.
        </p>
        <p>{message}</p>
        <p>
          Please sign in to your portal to review the recommendation and continue the process with
          prayerful discernment.
        </p>
        <p>
          <a href={`${appUrl}/recommendations`} style={{ color: "#a44e20" }}>
            View recommendation
          </a>
        </p>
        <p>With blessings,<br />Madangopal Matrimony</p>
      </div>
    ),
  });

  return {
    id: result.data?.id ?? null,
    skipped: false,
  };
}
