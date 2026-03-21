import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aquasmart-ai.vercel.app";
const socialTitle = "AquaSmart AI | ذكاء اصطناعي لإدارة المزارع السمكية";
const socialDescription =
  "أول منصة ذكاء اصطناعي لمراقبة المزارع السمكية في مصر. مراقبة جودة المياه، تنبيهات ذكية، وتحليلات متقدمة لضمان أفضل إنتاجية.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: socialTitle,
    template: "%s | AquaSmart AI",
  },
  description: socialDescription,
  keywords: [
    "aquaculture",
    "fish farming Egypt",
    "AI fish farming",
    "smart aquaculture",
    "مزارع سمكية",
    "الاستزراع السمكي",
    "ذكاء اصطناعي للمزارع",
    "جودة المياه",
  ],
  manifest: "/manifest.json",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "AquaSmart" },
  openGraph: {
    title: socialTitle,
    description: socialDescription,
    type: "website",
    locale: "ar_EG",
    url: siteUrl,
    siteName: "AquaSmart AI",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "AquaSmart AI Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: socialDescription,
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
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-cairo" suppressHydrationWarning>
        <LayoutWrapper>{children}</LayoutWrapper>
        <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GA_ID || ""} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered');
                  }, function(err) {
                    console.log('SW fail', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
