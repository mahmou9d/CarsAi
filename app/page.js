// @ts-nocheck
import {
  ArrowRight,
  Search,
  CalendarCheck,
  ShieldCheck,
  Heart,
  TrendingDown,
  Calculator,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getFeaturedCars } from "@/actions/home";
import { CarCard } from "@/components/cars/car-card";
import { HomeSearch } from "@/components/cars/home-search";
import Link from "next/link";
import Image from "next/image";
import { Archivo } from "next/font/google";
import { bodyTypes, carMakes, faqItems } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { checkUser } from "@/lib/checkUser";

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
  const [featuredCars, user] = await Promise.all([
    getFeaturedCars(),
    checkUser(),
  ]);
  const loopMakes = [...carMakes, ...carMakes];
  return (
    <>
      <Header />
      <div className={`${archivo.className} bg-white text-[#111111]`}>
        {/*
  Hero — "number plate". Huge stacked headline (last line outlined), and the
  search bar lives on a number plate with bolts. Lines slide in once on load.
  Uses your existing `HomeSearch`.
*/}
        {/*
  Hero — "the dashboard". A speedometer sweeps up to 100% (checked by us),
  and the search bar sits right on the dial's hub.
  Uses your existing `HomeSearch`. One animation on page load, then it rests.
*/}
        <section className="px-4 pb-24 pt-28 text-center md:px-6">
          <div className="mx-auto max-w-4xl">
            <h1 className="font-montserrat text-5xl font-[800] leading-[1] tracking-tighter text-black md:text-7xl">
              Find the car you&apos;ll actually keep
            </h1>
            <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-gray-600">
              Every car on the lot is driven, checked and signed off by our team
              before it&apos;s listed. No surprises, no pressure.
            </p>
          </div>

          {/* Gauge */}
          <div className="relative mx-auto mt-10 max-w-3xl">
            <svg
              viewBox="0 40 800 380"
              className="block h-auto w-full"
              role="img"
              aria-label="Gauge showing 100% of cars checked"
            >
              {/* Track */}
              <path
                d="M60 400A340 340 0 0 1 740 400"
                fill="none"
                stroke="#EDEBE6"
                strokeWidth="18"
                strokeLinecap="round"
              />
              {/* Red fill up to the needle */}
              <path
                className="gauge-fill"
                d="M60 400A340 340 0 0 1 688.4 219.8"
                fill="none"
                stroke="#E4141B"
                strokeWidth="18"
                strokeLinecap="round"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="0"
              />
              {/* Ticks */}
              {Array.from({ length: 25 }).map((_, i) => {
                const a = ((-90 + i * 7.5) * Math.PI) / 180;
                const major = i % 4 === 0;
                const r1 = 316;
                const r2 = major ? 286 : 300;
                return (
                  <line
                    key={i}
                    x1={(400 + r1 * Math.sin(a)).toFixed(1)}
                    y1={(400 - r1 * Math.cos(a)).toFixed(1)}
                    x2={(400 + r2 * Math.sin(a)).toFixed(1)}
                    y2={(400 - r2 * Math.cos(a)).toFixed(1)}
                    stroke={major ? "#161213" : "#CFCAC1"}
                    strokeWidth={major ? 3 : 2}
                    strokeLinecap="round"
                  />
                );
              })}
              {/* Needle */}
              <g
                className="gauge-needle"
                style={{ transformOrigin: "400px 400px" }}
              >
                <line
                  x1="400"
                  y1="400"
                  x2="400"
                  y2="126"
                  stroke="#161213"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <line
                  x1="400"
                  y1="150"
                  x2="400"
                  y2="126"
                  stroke="#E4141B"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </g>
              <circle cx="400" cy="400" r="16" fill="#161213" />
            </svg>

            {/* Digital readout in the dial */}
            <div className="pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2">
              <p className="font-montserrat text-6xl font-[800] leading-none tracking-tighter text-[#E4141B] md:text-8xl">
                100%
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-600 md:text-base">
                checked by us
              </p>
            </div>

            {/* Search sits on the hub */}
            <div className="absolute bottom-0 left-1/2 z-10 w-[min(100%,36rem)] -translate-x-1/2 translate-y-[105%] rounded-2xl bg-white p-2 text-left shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
              <HomeSearch />
            </div>
          </div>

          {/* Other two stats, below the search */}
          <dl className="mx-auto mt-48 flex max-w-md justify-center gap-12">
            <div>
              <dd className="font-montserrat text-3xl font-[800] tracking-tight text-black">
                12,400+
              </dd>
              <dt className="mt-1 text-sm text-gray-600">Listings live</dt>
            </div>
            <div>
              <dd className="font-montserrat text-3xl font-[800] tracking-tight text-black">
                48 hrs
              </dd>
              <dt className="mt-1 text-sm text-gray-600">
                To your first drive
              </dt>
            </div>
          </dl>

          <style>{`
    .gauge-needle { transform: rotate(58deg); animation: gauge-sweep 1.8s cubic-bezier(.2,.8,.2,1) .2s both; }
    .gauge-fill { animation: gauge-fill 1.8s cubic-bezier(.2,.8,.2,1) .2s both; }
    @keyframes gauge-sweep { from { transform: rotate(-90deg); } to { transform: rotate(58deg); } }
    @keyframes gauge-fill { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .gauge-needle, .gauge-fill { animation: none; }
    }
  `}</style>
        </section>

        {/*
  Featured cars — sticky intro + staggered grid.
  Uses your existing `featuredCars`, `CarCard`, `Link` and `ArrowRight`.
  CarCard itself is untouched, so any card styling still comes from that component.
*/}
        <section className="px-4 py-20 md:px-6">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Intro: stays in view while the cars scroll past (desktop) */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <h2 className="font-montserrat text-4xl font-[800] leading-[1.05] tracking-tight text-black md:text-6xl">
                  This week&apos;s picks
                </h2>
                <p className="mt-5 max-w-xs leading-relaxed text-gray-600">
                  {featuredCars.length} cars we&apos;re featuring right now.
                  Open one to see the details, or reserve it.
                </p>
                <Link
                  href="/cars"
                  className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#E4141B] px-6 font-semibold text-white transition-colors hover:bg-[#c81219] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40 focus-visible:ring-offset-2"
                >
                  View all cars
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Cars: two columns, the second one drops down for a staggered look */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 items-start gap-6 pb-12 sm:grid-cols-2">
                {featuredCars.map((car) => (
                  <div
                    key={car.id}
                    className="transition-transform duration-300 hover:-translate-y-1 sm:[&:nth-child(even)]:mt-12"
                  >
                    <CarCard car={car} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/*
  Browse by make — "giant type" version. Brand names are the design;
  hover/focus a name and its logo pops up above it. Pure CSS, no client state.
  `loopMakes` is your list repeated twice, so we take the first half.
  If you still have the original array (e.g. `makes`), use it and delete `uniqueMakes`.
*/}
        {(() => {
          const uniqueMakes = loopMakes.slice(
            0,
            Math.ceil(loopMakes.length / 2),
          );

          return (
            <section className="px-6 py-24 md:px-10">
              <div className="mx-auto max-w-6xl">
                <h2 className="mb-8 text-base font-semibold text-gray-500">
                  Shop by make
                </h2>

                <ul className="flex flex-wrap gap-x-5 gap-y-2 font-montserrat text-5xl font-[800] leading-[1.05] tracking-tighter sm:text-6xl md:gap-x-7 md:text-7xl lg:text-8xl">
                  {uniqueMakes.map((make) => (
                    <li key={make.name} className="group relative">
                      <Link
                        href={`/cars?make=${make.name}`}
                        className="block rounded-xl text-gray-300 transition-colors duration-200 hover:text-[#E4141B] focus-visible:text-[#E4141B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40"
                      >
                        {make.name}
                      </Link>

                      {/* Logo pop-up */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -top-5 left-1/2 z-10 grid h-16 w-30 -translate-x-1/2 translate-y-2 scale-75 place-items-center rounded-2xl border border-black/5 bg-white p-3 opacity-0 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.35)] transition-all duration-200 group-hover:-translate-y-3 group-hover:-rotate-6 group-hover:scale-100 group-hover:opacity-100 group-focus-within:-translate-y-3 group-focus-within:-rotate-6 group-focus-within:scale-100 group-focus-within:opacity-100 motion-reduce:transition-none md:h-20 md:w-28"
                      >
                        <img
                          src={make.image}
                          alt=""
                          className="max-h-full max-w-full object-contain w-44"
                        />
                      </span>
                    </li>
                  ))}

                  <li>
                    <Link
                      href="/cars"
                      className="inline-flex items-center gap-3 rounded-full bg-[#E4141B] px-6 text-white transition-colors hover:bg-[#c81219] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40 focus-visible:ring-offset-2 md:px-9"
                    >
                      All cars
                      <span aria-hidden className="text-[0.7em]">
                        ↗
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </section>
          );
        })()}

        {/*
  Browse by body type — expanding panels.
  Desktop: a row of tall photo strips; hover or focus one and it opens up.
  Mobile: a simple stack of wide photo rows. Pure CSS, works in a server component.
  Uses your existing `bodyTypes`, `Image` (next/image) and `Link`.
*/}
        {/*
  Browse by body type.
  Desktop (md and up): unchanged expanding strips.
  Phone: a swipeable row of cards instead of a long stack of strips.
*/}
        <section className="px-4 py-24 md:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex items-end justify-between gap-4">
              <h2 className="font-montserrat text-3xl font-[800] tracking-tight text-black md:text-5xl">
                Browse by body type
              </h2>
              <p className="hidden pb-1 text-sm text-gray-500 md:block">
                Hover a strip to open it
              </p>
              <p className="shrink-0 pb-1 text-sm text-gray-500 md:hidden">
                Swipe to see more
              </p>
            </div>

            <ul className="scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:h-[460px] md:snap-none md:gap-2 md:overflow-visible md:px-0 md:pb-0">
              {bodyTypes.map((type) => (
                <li
                  key={type.name}
                  className="group relative h-64 w-[72%] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-3xl bg-gray-200 transition-[flex-grow] duration-500 ease-out md:h-auto md:w-auto md:max-w-none md:flex-[1_1_0%] md:hover:flex-[5_1_0%] md:focus-within:flex-[5_1_0%] motion-reduce:transition-none"
                >
                  <Link
                    href={`/cars?bodyType=${type.name}`}
                    className="absolute inset-0 block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#E4141B]"
                  >
                    <Image
                      src={
                        type.imageUrl || `/body/${type.name.toLowerCase()}.webp`
                      }
                      alt=""
                      fill
                      sizes="(min-width: 768px) 45vw, 72vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10" />

                    {/* Collapsed label: vertical (desktop only) */}
                    <span
                      aria-hidden
                      className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-lg font-[700] text-white transition-opacity duration-200 [writing-mode:vertical-rl] rotate-180 md:block md:group-hover:opacity-0 md:group-focus-within:opacity-0"
                    >
                      {type.name}
                    </span>

                    {/* Open label: horizontal */}
                    <span className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 text-white md:bottom-6 md:left-7 md:right-7 md:opacity-0 md:transition-opacity md:duration-300 md:group-hover:opacity-100 md:group-hover:delay-200 md:group-focus-within:opacity-100 md:group-focus-within:delay-200">
                      <span className="whitespace-nowrap font-montserrat text-2xl font-[800] tracking-tight md:text-3xl">
                        {type.name}
                      </span>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E4141B] text-lg transition-transform group-hover:-translate-y-0.5">
                        <span aria-hidden>↗</span>
                        <span className="sr-only">Browse {type.name} cars</span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/*
  Sell / Trade + Finance — one split panel instead of two separate cards.
  Uses your existing `Link`, `RefreshCw`, `Calculator`, `ArrowRight`.
*/}
        <section className="px-4 py-12 md:px-6">
          <div className="mx-auto grid max-w-6xl grid-cols-1 overflow-hidden rounded-[40px] md:grid-cols-2">
            {/* Sell / trade */}
            <div className="relative flex flex-col justify-between bg-[#161213] p-8 text-white md:p-12">
              <div>
                <span className="grid size-12 place-items-center rounded-2xl bg-[#E4141B]">
                  <RefreshCw className="size-6 text-white" aria-hidden="true" />
                </span>
                <h3 className="mt-8 font-montserrat text-3xl font-[800] leading-tight tracking-tight md:text-4xl">
                  Sell or trade your car
                </h3>
                <p className="mt-4 max-w-sm leading-relaxed text-white/70">
                  Get a cash offer or trade-in credit towards your next car, in
                  minutes.
                </p>

                {/* Receipt-style facts */}
                <dl className="mt-8 max-w-sm space-y-3 text-sm">
                  {[
                    ["Offer", "In minutes"],
                    ["Inspection", "Free"],
                    ["Payout", "Instant"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-baseline gap-3">
                      <dt className="text-white/60">{label}</dt>
                      <span
                        aria-hidden
                        className="flex-1 border-b border-dotted border-white/25"
                      />
                      <dd className="font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <Link
                href="/sell-or-trade"
                className="group mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-[#E4141B] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#c81219] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#161213]"
              >
                Value your car
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Finance */}
            <div className="relative flex flex-col justify-between bg-[#F3F1EC] p-8 text-black md:p-12">
              <div>
                <span className="grid size-12 place-items-center rounded-2xl bg-white text-[#E4141B] shadow-sm">
                  <Calculator className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-8 font-montserrat text-3xl font-[800] leading-tight tracking-tight md:text-4xl">
                  Plan your monthly payment
                </h3>
                <p className="mt-4 max-w-sm leading-relaxed text-gray-600">
                  Set a down payment, APR and term, then find cars that fit your
                  budget.
                </p>

                {/* The three inputs you control */}
                <ul className="mt-8 flex flex-wrap gap-2">
                  {["Down payment", "APR", "Term"].map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-gray-800"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/finance"
                className="group mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-black/20 bg-white px-6 py-3 font-semibold text-black transition-colors hover:border-[#E4141B] hover:text-[#E4141B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40"
              >
                Calculate payments
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/*
  How it works + FAQ — route-style steps, then a big-type FAQ.
  Uses your existing `steps`, `faqItems`, and the Accordion components.
*/}
        <section className="px-4 py-24 md:px-6">
          <div className="mx-auto max-w-6xl">
            {/* Steps as a route: a dashed line runs through the stops (desktop) */}
            <h2 className="max-w-lg font-montserrat text-4xl font-[800] leading-[1.05] tracking-tighter text-black md:text-6xl">
              How buying here works
            </h2>

            <ol className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:flex lg:gap-8">
              <span
                aria-hidden
                className="absolute left-6 right-6 top-6 hidden border-t-2 border-dashed border-[#E4141B]/40 lg:block"
              />
              {steps.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="relative lg:flex-1">
                  <div className="relative z-10 grid h-12 w-12 place-items-center rounded-2xl bg-[#E4141B] shadow-[0_8px_20px_-8px_rgba(228,20,27,0.7)] ring-8 ring-white">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="mt-5 text-sm font-semibold text-[#E4141B]">
                    Step {i + 1}
                  </p>
                  <h3 className="mt-1 text-xl font-[700] text-black">
                    {title}
                  </h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-gray-600">
                    {text}
                  </p>
                </li>
              ))}
            </ol>

            {/* FAQ: heading on the left, large questions on the right */}
            <div className="mt-24 grid grid-cols-1 gap-10 border-t border-black/10 pt-16 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <h2 className="font-montserrat text-3xl font-[800] tracking-tight text-black md:text-4xl lg:sticky lg:top-28">
                  Common questions
                </h2>
              </div>

              <div className="lg:col-span-8">
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="border-black/10"
                    >
                      <AccordionTrigger className="py-6 text-left text-lg font-[700] text-black hover:text-[#E4141B] hover:no-underline md:text-xl">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="max-w-2xl pb-6 text-base leading-relaxed text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </section>
        {/*
  CTA — dark panel with a small car driving along the road at the bottom.
  Uses your existing `user`, `Button`, `Link`, `Heart`, `TrendingDown`, `CalendarCheck`.
*/}
        <section className="px-4 py-24 md:px-6">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-[#161213] text-white">
            <div className="relative px-8 pb-36 pt-14 md:px-16 md:pt-20">
              {/* Message + actions */}
              <h2 className="max-w-3xl font-montserrat text-5xl font-[800] leading-[1.02] tracking-tighter md:text-7xl">
                Your next car is already listed.
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
                Start with a search, or create an account to keep track of the
                cars you like.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-[#E4141B] px-7 font-semibold text-white hover:bg-[#c81219] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#161213]"
                  asChild
                >
                  <Link href="/cars">View all cars</Link>
                </Button>
                {!user && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-white/30 bg-transparent px-7 font-semibold text-white hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#161213]"
                    asChild
                  >
                    <Link href="/sign-up">Create account</Link>
                  </Button>
                )}
              </div>

              {/* What an account gives you (signed-out only) */}
              {!user && (
                <ul className="mt-14 grid grid-cols-1 gap-6 border-t border-white/10 pt-8 sm:grid-cols-3 sm:gap-8">
                  {[
                    {
                      icon: Heart,
                      title: "Save cars",
                      text: "Build a shortlist from any search.",
                    },
                    {
                      icon: TrendingDown,
                      title: "Price drop alerts",
                      text: "Know when a saved car gets cheaper.",
                    },
                    {
                      icon: CalendarCheck,
                      title: "Test drives",
                      text: "Book and manage them in one place.",
                    },
                  ].map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex items-start gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-[#E4141B]">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold leading-tight">{title}</p>
                        <p className="mt-1 text-sm text-white/60">{text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Road with a car driving along it */}
            <div
              className="absolute inset-x-0 bottom-0 h-16 bg-white/[0.06]"
              aria-hidden="true"
            >
              <div
                className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 opacity-40"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, #fff 0 36px, transparent 36px 72px)",
                }}
              />
              <svg
                viewBox="0 0 120 48"
                className="cta-car absolute bottom-3 h-12 w-[7.5rem] motion-reduce:animate-none motion-reduce:[left:12%]"
              >
                <path
                  d="M6 34c0-6 4-8 10-9l14-11c2-2 5-3 8-3h34c4 0 7 1 10 4l12 10c10 1 18 3 20 9v4H6z"
                  fill="#E4141B"
                />
                <path
                  d="M34 24l8-9h18v9zM65 24V15h7c2 0 3 1 5 3l7 6z"
                  fill="#fff"
                  fillOpacity="0.85"
                />
                <circle
                  cx="28"
                  cy="38"
                  r="8"
                  fill="#161213"
                  stroke="#fff"
                  strokeWidth="2.5"
                />
                <circle
                  cx="92"
                  cy="38"
                  r="8"
                  fill="#161213"
                  stroke="#fff"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>

          <style>{`
    @keyframes cta-drive {
      from { left: -10%; }
      to { left: 105%; }
    }
    .cta-car { animation: cta-drive 14s linear infinite; }
  `}</style>
        </section>
      </div>
      <Footer />
    </>
  );
}
