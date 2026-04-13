import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake, MailCheck, ShieldCheck, Sparkles } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const features = [
  "Secure authentication with email verification and Google login",
  "Comprehensive profile questionnaire designed for devotees",
  "Private admin review and manual matchmaking",
  "Match recommendations delivered in-app and by email",
];

export default function LandingPage() {
  return (
    <PageShell className="space-y-20 py-10 md:py-16">
      <section className="section-pattern glass-panel overflow-hidden rounded-[2rem] px-5 py-8 pb-20 sm:px-8 sm:pb-8 md:px-14 md:py-10">
        <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <Badge>Devotional. Modern. Carefully guided.</Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
                A marriage portal built for devotees.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                Create your verified profile, complete a thoughtful
                questionnaire, and receive prayerful recommendations from an
                admin-led matching process.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <SignedOut>
                <Link href="/sign-up">
                  <Button className="px-7">
                    Begin your profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button className="px-7">
                    Open dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </SignedIn>
              <a href="#how-it-works">
                <Button variant="secondary">See the process</Button>
              </a>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-white/50 bg-white/65 px-4 py-3 text-sm text-[var(--foreground)] shadow-sm"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="glass-panel rounded-[2rem] border-white/50 p-5 sm:p-8">
              <div className="space-y-6">
                <div className="rounded-[1.75rem] bg-white/80 px-4 py-6 shadow-sm sm:px-6">
                  <div className="mx-auto max-w-sm">
                    <Image
                      src="https://pub-f98348cedf694b51ad8fa2262c927a08.r2.dev/WhatsApp%20Image%202026-04-12%20at%2023.42.34.jpeg"
                      alt="Madangopal Matrimony logo"
                      width={1200}
                      height={900}
                      priority
                      className="h-auto w-full"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="font-semibold">Rooted in values</p>
                    <p className="text-sm text-[var(--muted)]">
                      Spiritual compatibility with a devotional-first process.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-3xl bg-[#fff8ef] p-5">
                    <MailCheck className="mb-3 h-5 w-5 text-[var(--primary)]" />
                    <p className="font-semibold">Verified accounts</p>
                    <p className="text-sm text-[var(--muted)]">
                      Email verification and Google sign-in supported.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-[#fff8ef] p-5">
                    <HeartHandshake className="mb-3 h-5 w-5 text-[var(--primary)]" />
                    <p className="font-semibold">Manual recommendations</p>
                    <p className="text-sm text-[var(--muted)]">
                      Admins privately review profiles and share suitable
                      matches.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-[#fff8ef] p-5">
                    <ShieldCheck className="mb-3 h-5 w-5 text-[var(--primary)]" />
                    <p className="font-semibold">Private by design</p>
                    <p className="text-sm text-[var(--muted)]">
                      No public browse experience, no demo users, no open
                      directory.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute left-1/2 top-full mt-4 w-[calc(100%-2.5rem)] max-w-[20rem] -translate-x-1/2 rounded-[1.75rem] bg-white/90 px-4 py-3 text-center shadow-lg sm:absolute sm:bottom-0 sm:top-auto sm:mt-0 sm:w-auto sm:max-w-none sm:translate-y-1/2 sm:rounded-full sm:px-5">
              <span className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[var(--primary)]">
                <Sparkles className="h-4 w-4" />
                Temple-inspired modern interface
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="grid gap-6 md:grid-cols-3">
        {[
          [
            "Create account",
            "Use email with verification or Google sign-in to enter the portal.",
          ],
          [
            "Complete profile",
            "Fill in your devotional, personal, family, and expectation details.",
          ],
          [
            "Receive guidance",
            "Admins manually recommend suitable devotees and email you when a match is shared.",
          ],
        ].map(([title, description], index) => (
          <div key={title} className="glass-panel rounded-[2rem] p-8">
            <p className="mb-4 text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
              Step 0{index + 1}
            </p>
            <h2 className="mb-3 text-2xl font-semibold">{title}</h2>
            <p className="leading-7 text-[var(--muted)]">{description}</p>
          </div>
        ))}
      </section>

      <section
        id="safety"
        className="glass-panel rounded-[2rem] px-5 py-8 sm:px-8 sm:py-10"
      >
        <div className="grid gap-8 md:grid-cols-[1fr_1.15fr]">
          <div>
            <Badge>Safety and process</Badge>
            <h2 className="mt-4 text-3xl font-semibold">
              Designed for thoughtful, admin-led introductions.
            </h2>
          </div>
          <div className="grid gap-4 text-[var(--muted)]">
            <p>
              Profiles are collected privately, and there is no self-service
              public matching feed. This keeps the process more reverent,
              careful, and easier to review.
            </p>
            <p>
              Admins can filter profiles by location, devotional practices,
              marital history, and completion status before sending a
              recommendation by email and inside the portal.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
