import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
