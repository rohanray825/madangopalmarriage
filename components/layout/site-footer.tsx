export function SiteFooter() {
  return (
    <footer className="border-t border-white/30 bg-[#f7eddc]/80">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 text-sm text-[var(--muted)] md:grid-cols-3">
        <div>
          <p className="mb-2 font-semibold text-[var(--foreground)]">Madan Gopal Marriage Portal</p>
          <p>
            A devotional, modern space to help devotees present themselves with dignity
            and receive carefully curated introductions.
          </p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-[var(--foreground)]">Process</p>
          <p>Accounts are verified thoroghly, profiles are reviewed privately, and matches are shared manually by admins.</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-[var(--foreground)]">Support</p>
          <p>Email recommendations are sent only after admin review, and users can also revisit recommendations from their dashboard.</p>
        </div>
      </div>
    </footer>
  );
}
