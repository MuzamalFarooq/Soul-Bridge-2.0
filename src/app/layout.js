import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Soul Bridge | Premium AI-Powered Dating & Matchmaking",
  description: "Experience the next level of dating. Soul Bridge uses advanced Gemini AI to help you find deep, meaningful connections. Swipe, match, celebrate, and chat in real-time.",
  keywords: ["dating app", "AI matching", "relationships", "Soul Bridge", "find love", "chat real-time"],
  openGraph: {
    title: "Soul Bridge | Premium AI-Powered Dating",
    description: "Discover deep, meaningful connections with Gemini AI compatibility scoring, real-time messaging, and interactive matching.",
    url: "https://soulbridge.love",
    siteName: "Soul Bridge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Soul Bridge | Premium AI-Powered Dating",
    description: "Discover deep, meaningful connections with Gemini AI compatibility scoring.",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased dark" style={{ colorScheme: "dark" }}>
      <body className="min-h-full flex flex-col font-sans select-none overflow-x-hidden">
        {/* Floating backdrop glow effects */}
        <div className="floating-bubble w-[350px] h-[350px] top-[10%] left-[-5%] opacity-40"></div>
        <div className="floating-bubble w-[450px] h-[450px] bottom-[15%] right-[-10%] opacity-40 animation-delay-2000"></div>
        <div className="floating-bubble w-[300px] h-[300px] top-[50%] left-[40%] opacity-20 animation-delay-4000"></div>

        <Providers>
          <div className="flex-1 flex flex-col relative z-10">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
