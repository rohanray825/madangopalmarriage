"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Camera, LoaderCircle, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

type UploadResponse = {
  key: string;
  publicUrl: string;
};

export function ProfilePhotoUpload({
  value,
  onChange,
  fieldError,
  sectionRef,
}: {
  value?: { photoUrl?: string; photoKey?: string };
  onChange: (next: { photoUrl: string; photoKey: string }) => void;
  fieldError?: string;
  sectionRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const [preview, setPreview] = useState(value?.photoUrl ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSelectFile(file: File) {
    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPG or PNG image only.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo must be under 5MB.");
      return;
    }

    setError("");
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/uploads/profile", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Upload failed");
        }

        const uploaded: UploadResponse = await uploadRes.json();

        setPreview(uploaded.publicUrl);
        onChange({
          photoKey: uploaded.key,
          photoUrl: uploaded.publicUrl,
        });
      } catch (uploadError) {
        console.error(uploadError);
        setError("Unable to upload image right now. Please try again.");
      } finally {
        URL.revokeObjectURL(localPreview);
      }
    });
  }

  return (
    <div
      ref={sectionRef}
      tabIndex={-1}
      className="rounded-[2rem] border border-dashed border-[var(--border)] bg-white/55 p-6 outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)]/50"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[#f9f1e6]">
          {preview ? (
            <Image src={preview} alt="Profile preview" fill className="object-cover" />
          ) : (
            <Camera className="h-10 w-10 text-[var(--muted)]" />
          )}
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-lg font-semibold">Profile photograph</p>
            <p className="text-sm text-[var(--muted)]">
              Store the image in Cloudflare R2 and save only the object key and public URL in
              Neon. JPG/PNG only, maximum 5MB.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white">
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              Upload photo
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleSelectFile(file);
                  }
                }}
              />
            </label>
            {preview ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPreview("");
                  onChange({
                    photoKey: "",
                    photoUrl: "",
                  });
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            ) : null}
          </div>
          {error || fieldError ? <p className="text-sm text-[var(--danger)]">{error || fieldError}</p> : null}
        </div>
      </div>
    </div>
  );
}
