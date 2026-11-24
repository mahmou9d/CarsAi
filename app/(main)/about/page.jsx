import { ShieldCheck, Users, Sparkles, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Archivo } from "next/font/google";

export const dynamic = "force-dynamic";

const archivo = Archivo({
  subsets: ["latin"],
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
    <div className={`${archivo.className} bg-white px-4 pb-8 pt-8 text-[#111111] md:px-6`}>
        <div className="mx-auto max-w-6xl">
          {/* Hero + stats in one dark panel */}
          <section className="relative overflow-hidden rounded-[40px] bg-[#161213] px-8 pb-16 pt-14 text-white md:px-14 md:pt-20">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
            >
              <span className="absolute -top-10 bottom-[-40px] right-[6%] w-24 -skew-x-[20deg] bg-white/[0.06] md:w-44" />
              <span className="absolute -top-10 bottom-[-40px] right-[22%] w-10 -skew-x-[20deg] bg-[#E4141B]/20 md:w-16" />
              <span className="absolute -top-10 bottom-[-40px] right-[31%] w-4 -skew-x-[20deg] bg-white/[0.06] md:w-6" />
            </div>

            <h1 className="relative max-w-4xl font-montserrat text-5xl font-[800] leading-[0.98] tracking-tighter md:text-7xl lg:text-[5.5rem]">
              We&apos;re changing how people buy used cars
            </h1>
            <p className="relative mt-8 max-w-xl text-lg leading-relaxed text-white/70">
              CarsAi started with a simple frustration: buying a used car
              shouldn&apos;t feel like a gamble. So we built a place where every
              listing is verified, every price is upfront, and every test drive
              is a tap away.
            </p>

            <dl className="relative mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="md:border-l md:border-white/15 md:pl-6 md:first:border-l-0 md:first:pl-0"
                >
                  <dd className="font-montserrat text-4xl font-[800] tracking-tight md:text-5xl">
                    {stat.value}
                  </dd>
                  <dt className="mt-1 text-sm text-white/60">{stat.label}</dt>
                </div>
              ))}
            </dl>

            <div
              aria-hidden="true"
              className="absolute inset-x-8 bottom-0 h-1.5 rounded-full bg-gradient-to-r from-[#E4141B]/30 via-[#E4141B] to-[#E4141B]/30 shadow-[0_0_30px_6px_rgba(228,20,27,0.5)] md:inset-x-14"
            />
          </section>

          {/* Story */}
          <section className="mt-24 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 className="font-montserrat text-3xl font-[800] tracking-tight md:text-4xl lg:sticky lg:top-28">
                Our story
              </h2>
            </div>

            <div className="lg:col-span-8">
              <blockquote className="border-l-4 border-[#E4141B] pl-6 font-montserrat text-2xl font-[800] leading-snug tracking-tight md:text-4xl">
                A marketplace where every car is inspected before it&apos;s
                listed and every price is the real price.
              </blockquote>

              <div className="mt-10 max-w-2xl space-y-6 text-lg leading-relaxed text-gray-600">
                <p>
                  We started CarsAi after one too many bad experiences buying a
                  car off a listing that looked nothing like the car in person.
                  Odometers that didn&apos;t add up, &quot;minor&quot; issues
                  that weren&apos;t so minor, and dealers who disappeared the
                  moment something went wrong.
                </p>
                <p>
                  So we set out to build the marketplace we wished existed: one
                  where every car is inspected before it&apos;s listed, every
                  price is the real price, and you can book a test drive and pay
                  only once you&apos;ve actually driven the car yourself.
                </p>
                <p>
                  Today thousands of buyers use CarsAi to find a car they
                  actually trust, and we&apos;re just getting started.
                </p>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="mt-24">
            <h2 className="font-montserrat text-3xl font-[800] tracking-tight md:text-5xl">
              What we stand for
            </h2>

            <ul className="mt-10 border-t border-black/10">
              {values.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="group grid grid-cols-1 gap-3 border-b border-black/10 py-8 md:grid-cols-12 md:gap-8 md:py-10"
                >
                  <div className="flex items-center gap-4 md:col-span-5">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#E4141B]/10 text-[#E4141B] transition-colors group-hover:bg-[#E4141B] group-hover:text-white">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-montserrat text-2xl font-[800] tracking-tight md:text-3xl">
                      {title}
                    </h3>
                  </div>
                  <p className="max-w-xl text-lg leading-relaxed text-gray-600 md:col-span-7">
                    {text}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* CTA: the whole card is the link, and it floods red on hover */}
          <section className="mt-24">
            <Link
              href="/cars"
              className="group flex flex-col items-start justify-between gap-8 rounded-[40px] border border-black/10 p-8 transition-colors duration-300 hover:border-[#E4141B] hover:bg-[#E4141B] focus-visible:border-[#E4141B] focus-visible:bg-[#E4141B] focus-visible:outline-none md:flex-row md:items-center md:p-14"
            >
              <div className="max-w-xl">
                <h2 className="font-montserrat text-4xl font-[800] leading-[1.02] tracking-tighter transition-colors group-hover:text-white group-focus-visible:text-white md:text-6xl">
                  Ready to find your next car?
                </h2>
                <p className="mt-4 text-lg text-gray-600 transition-colors group-hover:text-white/85 group-focus-visible:text-white/85">
                  Browse thousands of verified listings and book a test drive in
                  minutes.
                </p>
              </div>
              <span className="grid size-16 shrink-0 place-items-center rounded-full bg-[#E4141B] text-white transition-all duration-300 group-hover:bg-white group-hover:text-[#E4141B] group-focus-visible:bg-white group-focus-visible:text-[#E4141B] md:size-24">
                <ArrowRight
                  className="h-7 w-7 transition-transform group-hover:translate-x-1 md:h-10 md:w-10"
                  aria-hidden="true"
                />
                <span className="sr-only">Browse cars</span>
              </span>
            </Link>
          </section>
        </div>
      </div>
  );
}
