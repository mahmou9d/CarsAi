import { ShieldCheck, Users, Sparkles, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Archivo } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const stats = [
  { label: "Listings live", value: "12,400+" },
  { label: "Cities covered", value: "24" },
  { label: "Cars sold to date", value: "8,900+" },
  { label: "Avg. buyer rating", value: "4.8/5" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Every car, checked",
    text: "No listing goes live until our team has driven it and confirmed its condition, mileage and paperwork.",
  },
  {
    icon: Clock,
    title: "Built for speed",
    text: "Search, book a test drive and get an answer in minutes, not days of back-and-forth with a dealer.",
  },
  {
    icon: Users,
    title: "People, not just listings",
    text: "Real people answer your questions before and after you buy, from the first drive to the paperwork.",
  },
  {
    icon: Sparkles,
    title: "No pressure, ever",
    text: "You pay nothing until you've driven the car yourself and you're genuinely happy with it.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <Header />
      <div className={`${archivo.className} bg-white text-[#111111]`}>
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-24">
          <div
            className="absolute top-0 right-0 w-[60%] h-[120%] bg-[#E4141B] rounded-bl-[120px] -translate-y-16 translate-x-24"
            aria-hidden="true"
          />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <span className="inline-block text-sm font-semibold text-[#E4141B] bg-red-50 px-4 py-1.5 rounded-full mb-6">
              About CarsAi
            </span>
            <h1 className="text-4xl md:text-6xl font-[800] leading-[1.05] tracking-tight mb-6">
              We're changing how people buy used cars
            </h1>
            <p className="text-[#4A4A4A] text-lg leading-relaxed max-w-2xl mx-auto">
              CarsAi started with a simple frustration: buying a used car
              shouldn't feel like a gamble. So we built a place where every
              listing is verified, every price is upfront, and every test drive
              is a tap away.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-[#F7F7F7] p-6 text-center shadow-sm"
                >
                  <div className="text-3xl font-[800] text-[#E4141B] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#4A4A4A]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-[700] mb-6">Our story</h2>
            <div className="space-y-5 text-[#4A4A4A] text-base leading-relaxed">
              <p>
                We started CarsAi after one too many bad experiences buying a
                car off a listing that looked nothing like the car in person.
                Odometers that didn't add up, "minor" issues that weren't so
                minor, and dealers who disappeared the moment something went
                wrong.
              </p>
              <p>
                So we set out to build the marketplace we wished existed: one
                where every car is inspected before it's listed, every price is
                the real price, and you can book a test drive and pay only once
                you've actually driven the car yourself.
              </p>
              <p>
                Today thousands of buyers use CarsAi to find a car they actually
                trust, and we're just getting started.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-20 bg-[#F7F7F7] rounded-[48px] mx-4 md:mx-6">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <h2 className="text-3xl font-[700] mb-10">What we stand for</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-5">
                  <div className="w-12 h-12 rounded-full bg-[#E4141B] flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-[700] text-lg mb-1">{title}</h3>
                    <p className="text-[#4A4A4A] leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="relative overflow-hidden rounded-[40px] bg-[#E4141B] text-white px-10 py-16 md:px-16 flex flex-col md:flex-row items-center justify-between gap-10">
              <div
                className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-white/10"
                aria-hidden="true"
              />
              <div
                className="absolute -top-16 -left-10 w-40 h-40 rounded-full bg-white/10"
                aria-hidden="true"
              />
              <div className="relative max-w-lg">
                <h2 className="text-3xl md:text-4xl font-[800] mb-3">
                  Ready to find your next car?
                </h2>
                <p className="text-white/85">
                  Browse thousands of verified listings and book a test drive in
                  minutes.
                </p>
              </div>
              <div className="relative shrink-0">
                <Button
                  size="lg"
                  className="bg-white text-[#E4141B] hover:bg-white/90 rounded-full font-semibold gap-2"
                  asChild
                >
                  <Link href="/cars">
                    Browse cars <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
