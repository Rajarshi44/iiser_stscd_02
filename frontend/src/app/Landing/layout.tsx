import type { Metadata } from "next";
import { Roboto, Inter } from "next/font/google";
import "../globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CareerClimb - Gamified Career Development",
  description: "Advance through skill levels by solving AI-generated GitHub issues in a multiplayer career racing environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${inter.variable} font-roboto antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
