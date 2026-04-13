"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Mail, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Candidate = {
  id: string;
  name: string;
  email: string;
};

export function RecommendationForm({
  users,
}: {
  users: Candidate[];
}) {
  const [recipientUserId, setRecipientUserId] = useState(users[0]?.id ?? "");
  const [candidateUserId, setCandidateUserId] = useState(users[1]?.id ?? users[0]?.id ?? "");
  const [messageForRecipient, setMessageForRecipient] = useState(
    "We have reviewed your profile and would like to prayerfully suggest a devotee who appears aligned in spiritual priorities and life direction."
  );
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    startTransition(async () => {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientUserId,
          candidateUserId,
          recommendedByAdminName: "Admin",
          messageForRecipient,
          sendEmail: true,
        }),
      });

      const payload = await response.json();
      setFeedback(payload.message ?? "Recommendation created.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-[2rem] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-[#fff4e8] p-3 text-[var(--primary)]">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Create recommendation</h3>
          <p className="text-sm text-[var(--muted)]">Send it by email and store it in the recipient dashboard.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-semibold">Recipient devotee</span>
          <Select value={recipientUserId} onChange={(event) => setRecipientUserId(event.target.value)}>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-semibold">Suggested candidate</span>
          <Select value={candidateUserId} onChange={(event) => setCandidateUserId(event.target.value)}>
            {users
              .filter((user) => user.id !== recipientUserId)
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
          </Select>
        </label>
      </div>

      <label className="mt-4 block space-y-2 text-sm">
        <span className="font-semibold">Message for recipient</span>
        <Textarea
          rows={6}
          value={messageForRecipient}
          onChange={(event) => setMessageForRecipient(event.target.value)}
        />
      </label>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--success)]">{feedback}</p>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <SendHorizonal className="mr-2 h-4 w-4" />
          )}
          Save and email
        </Button>
      </div>
    </form>
  );
}
