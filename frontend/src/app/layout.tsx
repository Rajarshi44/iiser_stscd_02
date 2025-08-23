import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IISER Status Code 02",
    template: "%s | IISER Status Code 02",
  },
  description: "Collaborative projects platform for IISER students and researchers",
  keywords: [
    "IISER",
    "collaborative projects",
    "research",
    "students",
    "academic collaboration",
    "project management",
  ],
  authors: [
    {
      name: "IISER Status Code Team",
    },
  ],
  creator: "IISER Status Code Team",
  metadataBase: new URL("https://iiser-statuscode.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://iiser-statuscode.vercel.app",
    title: "IISER Status Code 02",
    description: "Collaborative projects platform for IISER students and researchers",
    siteName: "IISER Status Code 02",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IISER Status Code 02",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IISER Status Code 02",
    description: "Collaborative projects platform for IISER students and researchers",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="min-h-screen bg-background font-roboto antialiased">
        <div className="relative flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
