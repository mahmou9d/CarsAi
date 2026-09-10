import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { DemoCredentialsModal } from "@/components/DemoCredentialsModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CarsAi",
  description: "Find your Dream Car",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/logo-white.png" sizes="any" />
        </head>
        <body className={`${inter.className}`}>
          <Toaster richColors />
          <main className="min-h-screen">{children}</main>
          <DemoCredentialsModal />
        </body>
      </html>
    </ClerkProvider>
  );
}
