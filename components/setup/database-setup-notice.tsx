import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";

export function DatabaseSetupNotice() {
  return (
    <PageShell className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">Database setup required</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Your Neon tables have not been created yet.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          Authentication is working, but the app cannot create or load user records until the
          schema from `db/schema.ts` is pushed to Neon.
        </p>
        <div className="mt-6 rounded-[1.5rem] bg-[#fff8ee] p-5">
          <p className="mb-3 font-semibold">Run this once in `D:\\AI\\madangopalmarriage2`:</p>
          <pre className="overflow-x-auto rounded-2xl bg-[#2b2116] px-4 py-3 text-sm text-[#f7efe2]">
            <code>npm run db:push</code>
          </pre>
        </div>
        <p className="text-sm leading-7 text-[var(--muted)]">
          After that, restart the dev server and open the dashboard again.
        </p>
        <div className="pt-2">
          <Button type="button" disabled>
            Waiting for database setup
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
