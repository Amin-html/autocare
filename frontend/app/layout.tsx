import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AutoCare — Precision in every service",
    template: "%s · AutoCare",
  },
  description: "Professional automotive service management for your vehicle.",
  openGraph: {
    title: "AutoCare — Precision in every service",
    description: "Professional automotive service management for your vehicle.",
    url: SITE_URL,
    siteName: "AutoCare",
    images: ["/hero-car-placeholder.jpg"],
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-sans antialiased bg-warm-white text-black">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}