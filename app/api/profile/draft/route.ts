import { NextResponse } from "next/server";
import { saveDraftQuestionnaire, requireSignedInUser } from "@/lib/auth";
import type { QuestionnaireValues } from "@/lib/validations/profile";

export async function POST(request: Request) {
  try {
    const dbUser = await requireSignedInUser();
    const body = await request.json();
    const values = body as Partial<QuestionnaireValues>;
    await saveDraftQuestionnaire(dbUser.id, values);

    return NextResponse.json({
      message: "Draft saved in Neon successfully.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to save draft." }, { status: 400 });
  }
}
