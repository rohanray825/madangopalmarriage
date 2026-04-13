import { AppLoader } from "@/components/branding/app-loader";
import { PageShell } from "@/components/layout/page-shell";

export default function Loading() {
  return (
    <PageShell>
      <AppLoader />
    </PageShell>
  );
}
