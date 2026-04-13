import { Sparkles } from "lucide-react";

export function AppLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 px-6 py-8 shadow-[0_24px_80px_rgba(92,57,17,0.14)] backdrop-blur-xl">
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <div className="loader-orbit relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(211,165,80,0.34),rgba(155,92,23,0.08))]">
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-full bg-[#fff9f1] shadow-lg">
              <Sparkles className="h-9 w-9 text-[var(--primary)]" />
            </div>
            <span className="loader-ring absolute inset-0 rounded-full border border-[var(--secondary)]/50" />
            <span className="loader-ring loader-ring-delayed absolute inset-2 rounded-full border border-[var(--accent)]/35" />
            <span className="loader-ring loader-ring-soft absolute inset-[10px] rounded-full border border-white/40" />
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--muted)]">Hare Krishna</p>
            <p className="text-xl font-semibold text-[var(--foreground)]">Preparing your next page</p>
            <p className="text-sm leading-7 text-[var(--muted)]">
              All glories to Srila Prabhupada!!
            </p>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="loader-dot h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
            <span className="loader-dot loader-dot-delayed h-2.5 w-2.5 rounded-full bg-[var(--secondary)]" />
            <span className="loader-dot loader-dot-more-delayed h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
