import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import { MobileNoticeBadge } from "@/components/common/MobileNoticeBadge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Sinefes Demo - Canlı Film & Dizi Takip Deneyimi",
  description: "Minimalist, %90 mobil öncelikli, koyu temalı kişisel film ve dizi takip platformu (Canlı Demo Sürümü)",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sinefes Demo",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased bg-[#09090b] text-zinc-100 selection:bg-amber-500 selection:text-black`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-100 overflow-x-hidden">
        {/* Masaüstü Rozeti (Sağ Altta, Daha Net & Çarpı ile Kapatılabilir) */}
        <MobileNoticeBadge />

        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
