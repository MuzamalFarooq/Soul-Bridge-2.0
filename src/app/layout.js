import "./globals.css";
import Providers from "@/components/Providers";
import LenisProvider from "@/components/ui/LenisProvider";
import CursorGlow from "@/components/ui/CursorGlow";
import Loader from "@/components/ui/Loader";
import BottomNav from "@/components/ui/BottomNav";

export const metadata = {
  title: "Soul Bridge | Premium World-Class AI Matchmaking Platform",
  description: "Experience the ultimate luxury dating application. Soul Bridge combines Apple-level polish, 3D interactive graphics, and Gemini AI compatibility analysis.",
  keywords: ["dating app", "luxury dating", "AI matching", "Soul Bridge", "find love", "chat real-time"],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Soul Bridge | Premium World-Class Dating",
    description: "Discover deep, meaningful connections with Gemini AI compatibility scoring, interactive 3D matching, and real-time socket chat.",
    url: "https://soulbridge.muzamal.site",
    siteName: "Soul Bridge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Soul Bridge | Premium World-Class Dating",
    description: "Discover deep, meaningful connections with Gemini AI compatibility scoring.",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased dark" style={{ colorScheme: "dark" }}>
      <body className="min-h-full flex flex-col font-sans select-none overflow-x-hidden bg-dark-bg text-foreground">
        {/* Animated Aurora Backdrop Mesh */}
        <div className="aurora-backdrop">
          <div className="aurora-blob aurora-blob-1" />
          <div className="aurora-blob aurora-blob-2" />
          <div className="aurora-blob aurora-blob-3" />
        </div>

        <LenisProvider>
          <Loader />
          <CursorGlow />
          <Providers>
            <div className="flex-1 flex flex-col relative z-10 pb-16 md:pb-0">
              {children}
            </div>
            <BottomNav />
          </Providers>
        </LenisProvider>
      </body>
    </html>
  );
}
