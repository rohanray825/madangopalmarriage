import { redirect } from "next/navigation";
import { Headphones, Mail, Phone } from "lucide-react";
import { ensureUserRecord } from "@/lib/auth";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { ContactForm } from "@/components/contact/contact-form";

export default async function ContactPage() {
  const dbUser = await ensureUserRecord();
  if (!dbUser) {
    redirect("/sign-in");
  }

  if (dbUser.role === "admin") {
    redirect("/admin");
  }

  const phoneNumber = process.env.CONTACT_PHONE_NUMBER?.trim() || "Support number not configured";

  return (
    <PageShell className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <Badge>Contact us</Badge>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Need help? Calling us is the best first step.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          If you need help with profile submission, recommendations, or any portal-related guidance,
          please call us first. Phone support is quicker and helps us understand your situation more
          personally than email alone.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white/65 p-5">
            <Phone className="mb-3 h-5 w-5 text-[var(--primary)]" />
            <p className="font-semibold">Call support</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{phoneNumber}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/65 p-5">
            <Headphones className="mb-3 h-5 w-5 text-[var(--primary)]" />
            <p className="font-semibold">Best for urgent issues</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Calling gets you the fastest response.</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/65 p-5">
            <Mail className="mb-3 h-5 w-5 text-[var(--primary)]" />
            <p className="font-semibold">Message as backup</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Use the form below if calling is not possible.</p>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <ContactForm phoneNumber={phoneNumber} />
      </section>
    </PageShell>
  );
}
