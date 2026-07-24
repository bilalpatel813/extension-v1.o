import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";

// Self-hosted fonts (no runtime Google Fonts fetch): regular + italic weights
// used across the display face, and two weights of the mono face.
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "./globals.css";

const SITE_URL = "https://pursuit-app.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pursuit — Automatic Job Application Tracker",
    template: "%s · Pursuit",
  },
  description:
    "Pursuit automatically tracks every job you apply to on LinkedIn, Indeed, and Naukri, so you always know where you stand. Free browser extension, one dashboard.",
  keywords: [
    "job application tracker",
    "job tracker extension",
    "track job applications",
    "LinkedIn application tracker",
    "Indeed application tracker",
    "Naukri application tracker",
    "job search organizer",
    "job hunt dashboard",
    "chrome extension job tracker",
  ],
  authors: [{ name: "Bilal Patel", url: "https://github.com/bilalpatel813" }],
  creator: "Bilal Patel",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Pursuit",
    title: "Pursuit — Automatic Job Application Tracker",
    description:
      "Every job you apply to on LinkedIn, Indeed, and Naukri — tracked automatically in one dashboard.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pursuit — Automatic Job Application Tracker",
    description:
      "Every job you apply to on LinkedIn, Indeed, and Naukri — tracked automatically in one dashboard.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" data-theme="dark">
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('pursuit-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
