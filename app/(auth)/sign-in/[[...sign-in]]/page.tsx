import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6 py-16">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            card: "shadow-xl border border-[var(--border)]",
          },
        }}
      />
    </main>
  );
}
