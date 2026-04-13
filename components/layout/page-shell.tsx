import { cn } from "@/lib/utils";

export function PageShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <main className={cn("mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10", className)}>{children}</main>;
}
