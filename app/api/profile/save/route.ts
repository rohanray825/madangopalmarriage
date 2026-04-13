import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profilePhotos } from "@/db/schema";
import { questionnaireSchema } from "@/lib/validations/profile";
import { requireSignedInUser, upsertQuestionnaireSummary } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const dbUser = await requireSignedInUser();
    const body = await request.json();
    const values = questionnaireSchema.parse(body);

    await upsertQuestionnaireSummary(dbUser.id, values);

    if (values.photoKey && values.photoUrl) {
      await db
        .insert(profilePhotos)
        .values({
          userId: dbUser.id,
          storageKey: values.photoKey,
          publicUrl: values.photoUrl,
          mimeType: "image/*",
          isPrimary: true,
        })
        .onConflictDoUpdate({
          target: profilePhotos.userId,
          set: {
            storageKey: values.photoKey,
            publicUrl: values.photoUrl,
          },
        });
    } else {
      await db.delete(profilePhotos).where(eq(profilePhotos.userId, dbUser.id));
    }

    return NextResponse.json({
      message: "Profile submitted successfully and marked ready for admin review.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to save profile." }, { status: 400 });
  }
}
