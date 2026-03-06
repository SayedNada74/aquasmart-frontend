import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "AquaSmart AI - إدارة المزارع السمكية",
  description: "نظام ذكاء اصطناعي متقدم لمراقبة وإدارة المزارع السمكية في مصر. متابعة لحظية للأحواض، تحليل بالذكاء الاصطناعي، تنبيهات فورية.",
  keywords: ["aquaculture", "fish farming", "AI", "IoT", "مزارع سمكية", "ذكاء اصطناعي", "استزراع سمكي"],
  manifest: "/manifest.json",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "AquaSmart" },
  openGraph: {
    title: "AquaSmart AI - Smart Fish Farm Management",
    description: "AI-powered aquaculture monitoring system with real-time sensor data, disease diagnosis, and smart alerts.",
    type: "website",
    images: ["/logo.png"],
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
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-cairo" suppressHydrationWarning>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
