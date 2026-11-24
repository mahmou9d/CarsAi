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
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <CustomAuthProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/logo-white.png" sizes="any" />
        </head>
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
