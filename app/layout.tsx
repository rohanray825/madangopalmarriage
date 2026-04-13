import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const socialPreviewImage =
  "https://pub-f98348cedf694b51ad8fa2262c927a08.r2.dev/WhatsApp%20Image%202026-04-12%20at%2023.42.34.jpeg";

export const metadata: Metadata = {
  title: "Madangopal Matrimony",
  description: "A marriage portal for devotees.",
  metadataBase: new URL(appUrl),
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Madangopal Matrimony",
    description: "A marriage portal for devotees.",
    url: appUrl,
    siteName: "Madangopal Matrimony",
    type: "website",
    images: [
      {
        url: socialPreviewImage,
        width: 1200,
        height: 630,
        alt: "Madangopal Matrimony devotional marriage portal preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Madangopal Matrimony",
    description: "A devotional marriage portal for devotees.",
    images: [socialPreviewImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="app-shell">
        <Providers>
          <SiteHeader />
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
