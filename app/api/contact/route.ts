import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { requireSignedInUser } from "@/lib/auth";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const dbUser = await requireSignedInUser();
    if (dbUser.role === "admin") {
      return NextResponse.json({ message: "Admins do not use the contact form." }, { status: 403 });
    }

    const clerkUser = await currentUser();
    const body = (await request.json()) as { message?: string };
    const message = body.message?.trim() ?? "";

    if (!message) {
      return NextResponse.json({ message: "Please enter your query." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_QUERY_TO_EMAIL;
    const fromEmail = process.env.RECOMMENDATION_FROM_EMAIL;

    if (!apiKey || !toEmail || !fromEmail) {
      return NextResponse.json(
        { message: "Contact email is not configured yet. Please call the support number instead." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Marriage portal query from ${dbUser.fullName ?? dbUser.email}`,
      text: [
        `User: ${dbUser.fullName ?? "Not provided"}`,
        `Email: ${dbUser.email}`,
        `Clerk ID: ${dbUser.clerkUserId}`,
        `Verified: ${clerkUser?.primaryEmailAddress?.verification?.status ?? "unknown"}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    return NextResponse.json({ message: "Your query has been sent to the admin team." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to send your query right now." }, { status: 500 });
  }
}
