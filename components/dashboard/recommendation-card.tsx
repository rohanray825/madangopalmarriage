import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDateLabel } from "@/lib/utils";

type RecommendationCardProps = {
  candidateName: string;
  photoUrl?: string | null;
  city?: string | null;
  state?: string | null;
  rounds?: string | null;
  status: string;
  message: string;
  createdAt: Date;
};

export function RecommendationCard({
  candidateName,
  photoUrl,
  city,
  state,
  rounds,
  status,
  message,
  createdAt,
}: RecommendationCardProps) {
  return (
    <article className="glass-panel grid gap-5 rounded-[2rem] p-6 md:grid-cols-[140px_1fr]">
      <div className="relative h-36 overflow-hidden rounded-[1.5rem] bg-[#f8efe1]">
        {photoUrl ? (
          <Image src={photoUrl} alt={candidateName} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
            Photo not uploaded
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold">{candidateName}</h3>
            <p className="text-sm text-[var(--muted)]">
              {[city, state].filter(Boolean).join(", ") || "Location not provided"} • {rounds || "Rounds not provided"} rounds
            </p>
          </div>
          <div className="space-y-2 text-right">
            <Badge>{status}</Badge>
            <p className="text-sm text-[var(--muted)]">{formatDateLabel(createdAt.toISOString())}</p>
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-white/65 p-4 text-sm leading-7 text-[var(--foreground)]">
          {message}
        </div>
      </div>
    </article>
  );
}
