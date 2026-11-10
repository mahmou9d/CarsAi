// @ts-nocheck
import {
  ArrowRight,
  Search,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Show } from "@clerk/nextjs";
import { getFeaturedCars } from "@/actions/home";
import { CarCard } from "@/components/car-card";
import { HomeSearch } from "@/components/home-search";
import Link from "next/link";
import Image from "next/image";
import { Archivo } from "next/font/google";
import { bodyTypes, carMakes, faqItems } from "@/lib/data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

const archivo = Archivo({
  subsets: ["latin"],
});

const steps = [
  {
    icon: Search,
    title: "Search the lot",
    text: "Filter by make, body type or budget until the list is short enough to actually look at.",
  },
  {
    icon: CalendarCheck,
    title: "Book a drive",
    text: "Pick a slot that fits your day and confirm it straight from the listing page.",
  },
  {
    icon: ShieldCheck,
    title: "Pay when you're sure",
    text: "Nothing is charged until you've driven the car and signed off on the condition report.",
  },
];

export default async function Home() {
  const featuredCars = await getFeaturedCars();
  const loopMakes = [...carMakes, ...carMakes];
  return (
    <>
      <Header />
      <div className={`${archivo.className} bg-white text-[#111111]`}>
        {/* Hero */}
        <section className="relative overflow-hidden mt-16 pt-28 pb-24 md:pt-28 md:pb-32">
          <div
            className="absolute top-0 right-0 w-[70%] h-[130%] bg-[#E4141B] rounded-bl-[120px] -translate-y-16 translate-x-24"
            aria-hidden="true"
          />
          <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-[800] leading-[1.02] tracking-tight mb-7 max-w-xl">
                Find the car you&aposll actually keep
              </h1>
              <p className="text-[#4A4A4A] text-lg leading-relaxed mb-10 max-w-md">
                Every car on the lot is driven, checked and signed off by our
                team before it&aposs listed. No surprises, no pressure.
              </p>
              <div className="max-w-xl bg-white rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] p-2">
                <HomeSearch />
              </div>
            </div>

            <div className="relative hidden lg:flex justify-center">
              <div className="bg-white rounded-3xl shadow-[0_25px_60px_-20px_rgba(0,0,0,0.35)] p-8 w-full max-w-sm rotate-2">
                <p className="text-sm text-[#9A9A9A] mb-6">
                  Right now on the lot
                </p>
                <div className="space-y-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-[#4A4A4A]">
                      Listings live
                    </span>
                    <span className="text-3xl font-[800]">12,400+</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-[#4A4A4A]">
                      First drive in
                    </span>
                    <span className="text-3xl font-[800]">48 hrs</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-[#4A4A4A]">
                      Checked by us
                    </span>
                    <span className="text-3xl font-[800] text-[#E4141B]">
                      100%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured cars */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex justify-between items-baseline mb-10">
              <h2 className="text-3xl md:text-5xl font-[700]">
                This week&aposs <span className="text-[#d6352b]">picks</span>
              </h2>
              <Link
                href="/cars"
                className="text-sm font-semibold inline-flex items-center gap-1 text-[#E4141B] hover:gap-2 transition-all"
              >
                View all cars <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car) => (
                <div
                  key={car.id}
                  className="rounded-2xl overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all"
                >
                  <CarCard car={car} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Browse by make */}
        <section className="py-8 bg-[#faf9f7] rounded-[48px] mx-4 md:mx-6 overflow-hidden">
          {/* no card, no border — the logos float directly on the page and do the talking */}
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#faf9f7] to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#faf9f7] to-transparent z-10" />

            <div className="flex w-max items-center gap-16 md:gap-28 animate-[brand-scroll_30s_linear_infinite] hover:[animation-play-state:paused]">
              {loopMakes.map((make, i) => (
                <Link
                  key={`${make.name}-${i}`}
                  href={`/cars?make=${make.name}`}
                  className="group shrink-0 flex items-center justify-center"
                >
                  <img
                    src={make.image}
                    alt={make.name}
                    className="h-14 md:h-24 w-auto object-contain grayscale opacity-50 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                  />
                </Link>
              ))}
            </div>
          </div>

          <style>{`
        @keyframes brand-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
        </section>

        {/* Browse by body type */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex justify-between items-baseline mb-10">
              <h2 className="text-3xl md:text-5xl font-[700]">
                Browse by <span className="text-[#d6352b]">body type</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 auto-rows-[170px] md:auto-rows-[210px]">
              {bodyTypes.map((type, i) => (
                <Link
                  key={type.name}
                  href={`/cars?bodyType=${type.name}`}
                  className={`relative overflow-hidden group rounded-2xl shadow-[0_10px_25px_-12px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-transform ${
                    i === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <Image
                    src={
                      type.imageUrl || `/body/${type.name.toLowerCase()}.webp`
                    }
                    alt={type.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                  <span className="absolute bottom-4 left-4 text-white text-lg font-[700]">
                    {type.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How it works + FAQ */}
        <section className="py-24 bg-[#F7F7F7] rounded-[48px] mx-4 md:mx-6">
          <div className="max-w-6xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl md:text-5xl font-[700] mb-10">
                How buying here works
              </h2>
              <div className="space-y-8">
                {steps.map(({ icon: Icon, title, text }) => (
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

            <div>
              <h2 className="text-3xl font-[700] mb-10">Common questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
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
                  Your next car is already listed
                </h2>
                <p className="text-white/85">
                  Start with a search or create an account to save cars, track
                  price drops and manage your test drives.
                </p>
              </div>
              <div className="relative flex gap-4 shrink-0">
                <Button
                  size="lg"
                  className="bg-white text-[#E4141B] hover:bg-white/90 rounded-full font-semibold"
                  asChild
                >
                  <Link href="/cars">View all cars</Link>
                </Button>
                <Show when="signed-out">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/40 text-white hover:bg-white/10 rounded-full"
                    asChild
                  >
                    <Link href="/sign-up">Create account</Link>
                  </Button>
                </Show>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
