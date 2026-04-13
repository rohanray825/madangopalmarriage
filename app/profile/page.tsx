import { redirect } from "next/navigation";
import { ensureUserRecord } from "@/lib/auth";
import { getProfileWorkspace } from "@/lib/queries";
import { PageShell } from "@/components/layout/page-shell";
import { ProfileForm } from "@/components/forms/profile-form";

export default async function ProfilePage() {
  const dbUser = await ensureUserRecord();
  if (!dbUser) {
    redirect("/sign-in");
  }

  if (dbUser.role === "admin") {
    redirect("/admin");
  }

  const workspace = await getProfileWorkspace(dbUser.id);
  const answers = (workspace?.questionnaire?.answers as Record<string, unknown> | undefined) ?? undefined;

  return (
    <PageShell>
      <ProfileForm
        initialValues={{
          ...(answers ?? {}),
          email: dbUser.email,
          name: (answers?.name as string | undefined) ?? dbUser.fullName ?? "",
          photoUrl: workspace?.photo?.publicUrl ?? (answers?.photoUrl as string | undefined) ?? "",
          photoKey: workspace?.photo?.storageKey ?? (answers?.photoKey as string | undefined) ?? "",
        }}
      />
    </PageShell>
  );
}
