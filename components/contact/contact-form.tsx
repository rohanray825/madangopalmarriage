"use client";

import { useState, useTransition } from "react";
import { Check, LoaderCircle, PhoneCall, SendHorizonal } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ContactForm({ phoneNumber }: { phoneNumber: string }) {
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCopyPhoneNumber = async () => {
    await navigator.clipboard.writeText(phoneNumber);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] bg-[#fff8ee] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Best way to reach us</p>
        <h2 className="mt-3 text-2xl font-semibold">Please call first for faster support.</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          For urgent questions, profile clarifications, or help with the matchmaking process, calling
          us is the quickest and most personal option. Use the message box only when a phone call is
          not convenient.
        </p>
        <button
          type="button"
          onClick={handleCopyPhoneNumber}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
        >
          {isCopied ? <Check className="h-4 w-4" /> : <PhoneCall className="h-4 w-4" />}
          {isCopied ? `Copied ${phoneNumber}` : `Call ${phoneNumber}`}
        </button>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setFeedback("");

          startTransition(async () => {
            const response = await fetch("/api/contact", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ message }),
            });

            const payload = await response.json();
            setFeedback(payload.message ?? "Message sent.");

            if (response.ok) {
              setMessage("");
            }
          });
        }}
      >
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Still want to send a message?</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Write your query below and it will be emailed to the admin team.
          </p>
        </div>
        <Textarea
          rows={8}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write your question here..."
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">{feedback}</p>
          <Button type="submit" disabled={isPending || !message.trim()}>
            {isPending ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="mr-2 h-4 w-4" />
            )}
            Submit query
          </Button>
        </div>
      </form>
    </div>
  );
}
