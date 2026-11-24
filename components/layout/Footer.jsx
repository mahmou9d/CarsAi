import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const FacebookIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const COLUMNS = [
  {
    title: "Buy",
    links: [
      { href: "/cars", label: "Browse cars" },
      { href: "/compare", label: "Compare vehicles" },
      { href: "/finance", label: "Finance calculator" },
    ],
  },
  {
    title: "Sell & service",
    links: [
      { href: "/sell-or-trade", label: "Sell or trade" },
      { href: "/services", label: "Service center" },
    ],
  },
  {
    title: "My account",
    links: [
      { href: "/saved-cars", label: "Saved cars" },
      { href: "/reservations", label: "My reservations" },
    ],
  },
];

const SOCIALS = [
  { label: "Facebook", Icon: FacebookIcon },
  { label: "Instagram", Icon: InstagramIcon },
  { label: "Twitter", Icon: TwitterIcon },
];

const linkCls =
  "text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white focus-visible:underline underline-offset-4";

/*
  Footer = the back of the car.
  A red LED tail-light strip runs along the top edge; hover "Browse cars"
  and it brightens like a brake light. The copyright sits on a number plate.
*/
const Footer = () => {
  return (
    <footer className="mt-20 px-3 pb-3 sm:px-6">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-[#161213] text-white">
        {/* Glow cast down from the tail light */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(228,20,27,0.28),transparent)]"
        />

        <div className="relative px-8 pb-8 pt-10 md:px-16">
          {/* CTA + tail light strip (group so the button can trigger the brake light) */}
          <div className="group/cta">
            <div
              aria-hidden
              className="h-2 rounded-full bg-gradient-to-r from-[#E4141B]/30 via-[#E4141B] to-[#E4141B]/30 shadow-[0_0_30px_6px_rgba(228,20,27,0.5)] transition-all duration-300 group-hover/cta:shadow-[0_0_60px_16px_rgba(228,20,27,0.75)] group-focus-within/cta:shadow-[0_0_60px_16px_rgba(228,20,27,0.75)] motion-reduce:transition-none"
            />

            <div className="flex flex-col gap-8 py-14 md:flex-row md:items-end md:justify-between">
              <h2 className="max-w-lg font-montserrat text-4xl font-[800] leading-[1.05] tracking-tighter sm:text-5xl md:text-6xl">
                Your next car is a few clicks away.
              </h2>
              <Link
                href="/cars"
                className="group inline-flex h-12 w-fit items-center gap-2 rounded-full bg-[#E4141B] px-7 font-semibold text-white transition-colors hover:bg-[#c81219] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#161213]"
              >
                Browse cars
                <ArrowUpRight
                  size={18}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>

          {/* Link grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-white/10 py-12 md:grid-cols-12">
            {/* Brand + contact */}
            <div className="col-span-2 md:col-span-5">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60"
              >
                <span
                  aria-hidden
                  className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[#E4141B]"
                >
                  <span className="absolute h-10 w-1.5 -translate-x-1 -skew-x-[20deg] bg-white/95" />
                  <span className="absolute h-10 w-1 translate-x-1.5 -skew-x-[20deg] bg-white/60" />
                </span>
                <span className="font-montserrat text-xl font-[800] leading-none tracking-tight text-white">
                  Cars<span className="text-[#E4141B]">Ai</span>
                </span>
              </Link>

              <ul className="mt-6 space-y-3 text-sm">
                <li>
                  <a
                    href="mailto:mohnud0987@gmail.com"
                    className={`${linkCls} flex items-center gap-2.5`}
                  >
                    <Mail size={15} className="shrink-0 text-[#E4141B]" />
                    mohnud0987@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+201009014597"
                    className={`${linkCls} flex items-center gap-2.5`}
                  >
                    <Phone size={15} className="shrink-0 text-[#E4141B]" />
                    +20 100 901 4597
                  </a>
                </li>
                <li className="flex items-center gap-2.5 text-white/60">
                  <MapPin size={15} className="shrink-0 text-[#E4141B]" />
                  Cairo, Egypt
                </li>
              </ul>
            </div>

            {COLUMNS.map((col) => (
              <nav
                key={col.title}
                aria-label={col.title}
                className="md:col-span-2"
              >
                <h3 className="mb-4 text-sm font-semibold text-white">
                  {col.title}
                </h3>
                <ul className="space-y-3 text-sm">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={linkCls}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* Bottom bar: number plate + socials */}
          <div className="flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-6 sm:flex-row">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
              {/* Number plate */}
              <p className="rounded-md border-2 border-[#161213] bg-white px-3 py-1 font-montserrat text-sm font-[800] tracking-widest text-[#161213] shadow-[0_0_0_2px_rgba(255,255,255,0.15)]">
                © {new Date().getFullYear()} Cars
                <span className="text-[#E4141B]">Ai</span>
              </p>
              <span className="text-xs text-white/50">
                All rights reserved.
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {SOCIALS.map(({ label, Icon }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#E4141B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
              <Link
                href="https://mahmou9d.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/50 transition-colors hover:text-white"
              >
                Built by Mahmoud Mohammed
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
