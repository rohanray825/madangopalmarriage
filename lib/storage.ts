import "server-only";

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function createR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing R2 configuration");
  }

  return new S3Client({
    region: process.env.R2_REGION ?? "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function createPublicUrl(key: string) {
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET;

  if (!accountId || !bucket) {
    throw new Error("Missing R2 configuration");
  }

  return process.env.R2_PUBLIC_BASE_URL
    ? `${process.env.R2_PUBLIC_BASE_URL}/${key}`
    : `https://${bucket}.${accountId}.r2.cloudflarestorage.com/${key}`;
}

export function createProfileImageKey(userId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  return `profiles/${userId}/${Date.now()}-${safeName}`;
}

export async function uploadProfileImage({
  userId,
  fileName,
  contentType,
  body,
}: {
  userId: string;
  fileName: string;
  contentType: string;
  body: Buffer;
}) {
  const bucket = process.env.R2_BUCKET;

  if (!bucket) {
    throw new Error("Missing R2 bucket configuration");
  }

  const client = createR2Client();
  const key = createProfileImageKey(userId, fileName);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    Body: body,
  });

  await client.send(command);

  return {
    key,
    publicUrl: createPublicUrl(key),
  };
}

export async function deleteProfileImage(key: string) {
  const bucket = process.env.R2_BUCKET;

  if (!bucket) {
    throw new Error("Missing R2 bucket configuration");
  }

  const client = createR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}
