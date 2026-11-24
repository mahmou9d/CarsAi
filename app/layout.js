import { Inter } from "next/font/google";
import "./globals.css";
import { CustomAuthProvider } from "@/components/layout/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { CompareFloatingBar } from "@/components/cars/compare-bar";
import { AiAssistantWidget } from "@/components/ai/ai-assistant-widget";
import { BackToTopButton } from "@/components/layout/back-to-top";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CarsAi",
  description: "Find your Dream Car",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <CustomAuthProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          <Toaster richColors />
          <main className="min-h-screen">{children}</main>
          <CompareFloatingBar />
          <AiAssistantWidget />
          <BackToTopButton />
        </body>
      </html>
    </CustomAuthProvider>
  );
}
