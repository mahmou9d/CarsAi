import Header from "@/components/Header";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function MainLayout({ children }) {
  return (
    <>
      <Header />

      {/* pt-16 offsets the fixed header (h-16) so content doesn't start hidden behind it */}
      <main className="pt-16 min-h-screen max-w-7xl mx-auto">{children}</main>

      <Footer />
    </>
  );
}
