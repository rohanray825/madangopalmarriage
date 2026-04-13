import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell className="flex min-h-[60vh] items-center justify-center">
      <div className="glass-panel max-w-xl rounded-[2rem] p-10 text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Page not found</p>
        <h1 className="mt-4 text-4xl font-semibold">This route does not exist.</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          Please return to the main portal and continue from your dashboard or the homepage.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/">
            <Button>Go home</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary">Dashboard</Button>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
