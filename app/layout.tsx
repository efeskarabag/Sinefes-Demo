import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";

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
        {/* Masaüstü Rozeti (Mobile-First / PWA Uyarısı) - Mobilde Kesinlikle Gizli */}
        <aside
          aria-label="Cihaz Deneyimi Bilgisi"
          className="hidden md:flex fixed top-3 right-5 z-40 items-center gap-2 rounded-full border border-amber-500/25 bg-zinc-950/85 px-3.5 py-1.5 text-[11px] font-medium text-zinc-300 backdrop-blur-xl shadow-xl ring-1 ring-white/5 pointer-events-none select-none"
        >
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>📱 Mobil (PWA) deneyimi için tasarlanmıştır</span>
        </aside>

        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
