"use client";

import Link from "next/link";
import { useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { HeartHandshake, LayoutDashboard, Menu, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type MobileHeaderControlsProps = {
  isAdmin: boolean;
};

export function MobileHeaderControls({ isAdmin }: MobileHeaderControlsProps) {
  const [open, setOpen] = useState(false);
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2 self-center">
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-10 w-10",
              },
            }}
          />
        </SignedIn>
        <button
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white/75 text-[var(--foreground)] shadow-sm"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="col-span-2 mt-3 w-full rounded-[1.5rem] border border-[var(--border)] bg-[#fffaf2]/95 p-4 shadow-xl backdrop-blur-xl">
          <nav className="flex flex-col gap-2">
            <Link
              href="/#how-it-works"
              onClick={closeMenu}
              className="rounded-2xl px-4 py-3 text-sm text-[var(--muted)] transition hover:bg-white/80"
            >
              How it works
            </Link>
            <Link
              href="/#safety"
              onClick={closeMenu}
              className="rounded-2xl px-4 py-3 text-sm text-[var(--muted)] transition hover:bg-white/80"
            >
              Safety
            </Link>
            {!isAdmin ? (
              <Link
                href="/contact"
                onClick={closeMenu}
                className="rounded-2xl px-4 py-3 text-sm text-[var(--muted)] transition hover:bg-white/80"
              >
                Contact us
              </Link>
            ) : null}
            <SignedIn>
              <Link
                href={dashboardHref}
                onClick={closeMenu}
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-[var(--muted)] transition hover:bg-white/80"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  onClick={closeMenu}
                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm text-[var(--muted)] transition hover:bg-white/80"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </button>
              </SignInButton>
            </SignedOut>
            <SignedOut>
              <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border)] pt-4">
                <SignInButton mode="modal">
                  <Button variant="secondary" className="w-full justify-center" onClick={closeMenu}>
                    <HeartHandshake className="mr-2 h-4 w-4" />
                    Sign in
                  </Button>
                </SignInButton>
                <Link href="/sign-up" onClick={closeMenu}>
                  <Button className="w-full justify-center">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Join now
                  </Button>
                </Link>
              </div>
            </SignedOut>
          </nav>
        </div>
      ) : null}
    </>
  );
}
