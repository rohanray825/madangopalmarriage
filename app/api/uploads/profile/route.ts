import { NextResponse } from "next/server";
import { requireSignedInUser } from "@/lib/auth";
import { uploadProfileImage } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const user = await requireSignedInUser();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      return NextResponse.json({ error: "Only JPG and PNG images are allowed" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadProfileImage({
      userId: user.id,
      fileName: file.name,
      contentType: file.type,
      body: buffer,
    });

    return NextResponse.json(uploaded);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to upload image" }, { status: 500 });
  }
}
