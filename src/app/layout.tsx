import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aquasmart-frontend-sovt.vercel.app";
const socialTitle = "AquaSmart AI | Real-Time Smart Fish Farm Management";
const socialDescription =
  "Monitor fish ponds in real time, receive AI-powered alerts, analyze water quality, and manage aquaculture operations through one premium dashboard.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: socialTitle,
  description: socialDescription,
  keywords: [
    "aquaculture",
    "fish farming",
    "AI",
    "IoT",
    "smart aquaculture",
    "fish pond monitoring",
    "water quality analytics",
  ],
  manifest: "/manifest.json",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "AquaSmart" },
  openGraph: {
    title: socialTitle,
    description: socialDescription,
    type: "website",
    url: siteUrl,
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: socialDescription,
    images: ["/twitter-image"],
  },
};

export const viewport: Viewport = {
  themeColor: "#00d4aa",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-cairo" suppressHydrationWarning>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
