"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { RouteTransitionLoader } from "@/components/branding/route-transition-loader";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#9b5c17",
          colorBackground: "#fffaf2",
          colorText: "#2e2417",
          borderRadius: "1rem",
        },
      }}
    >
      <RouteTransitionLoader />
      {children}
    </ClerkProvider>
  );
}
