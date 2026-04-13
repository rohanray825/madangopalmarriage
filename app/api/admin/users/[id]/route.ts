import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { profilePhotos, users } from "@/db/schema";
import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteProfileImage } from "@/lib/storage";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser();

    const { id } = await context.params;
    const [target] = await db
      .select({
        id: users.id,
        role: users.role,
        clerkUserId: users.clerkUserId,
        email: users.email,
        photoKey: profilePhotos.storageKey,
      })
      .from(users)
      .leftJoin(profilePhotos, eq(profilePhotos.userId, users.id))
      .where(and(eq(users.id, id), eq(users.role, "user")))
      .limit(1);

    if (!target) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (target.photoKey) {
      try {
        await deleteProfileImage(target.photoKey);
      } catch (storageError) {
        console.error("Failed to delete profile image from R2", storageError);
      }
    }

    const client = await clerkClient();
    await client.users.deleteUser(target.clerkUserId);

    await db.delete(users).where(eq(users.id, target.id));

    return NextResponse.json({
      message: `${target.email} has been deleted successfully.`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Unable to delete this user right now." },
      { status: 500 }
    );
  }
}
