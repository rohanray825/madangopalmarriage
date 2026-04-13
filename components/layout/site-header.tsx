import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Flower2, HeartHandshake, ShieldCheck } from "lucide-react";
import { getCurrentUserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { MobileHeaderControls } from "@/components/layout/mobile-header-controls";

export async function SiteHeader() {
  const role = await getCurrentUserRole();
  const dashboardHref = role === "admin" ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-white/30 bg-[#f8f0e4]/80 backdrop-blur-xl">
      <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:hidden">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg">
              <Flower2 className="h-6 w-6" />
            </div>
            <div className="min-w-0 max-w-[12rem] sm:max-w-none">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] sm:text-xs sm:tracking-[0.3em]">
                Hare Krishna
              </p>
              <p className="text-sm leading-tight font-semibold sm:text-lg">
                Madangopal Matrimony
              </p>
            </div>
          </Link>
          <MobileHeaderControls isAdmin={role === "admin"} />
        </div>

        <div className="hidden items-center justify-between gap-4 md:flex">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg">
              <Flower2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Hare Krishna
              </p>
              <p className="text-lg font-semibold">Madangopal Matrimony</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/#safety">Safety</Link>
            {role !== "admin" ? <Link href="/contact">Contact us</Link> : null}
            <SignedOut>
              <SignInButton mode="modal">
                <button type="button" className="text-sm text-[var(--muted)]">
                  Dashboard
                </button>
              </SignInButton>
            </SignedOut>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="secondary">
                    <HeartHandshake className="mr-2 h-4 w-4" />
                    Sign in
                  </Button>
                </SignInButton>
                <Link href="/sign-up">
                  <Button>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Join now
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href={dashboardHref}>
                  <Button variant="secondary">Dashboard</Button>
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-11 w-11",
                    },
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
