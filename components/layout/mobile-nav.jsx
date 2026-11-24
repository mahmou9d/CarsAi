"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Home,
  CarFront,
  ArrowLeftRight,
  Calculator,
  RefreshCw,
  Info,
  Phone,
  Wrench,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCompare } from "@/hooks/use-compare";

export function MobileNav({ isAdmin = false }) {
  const [open, setOpen] = useState(false);
  const { compareCount } = useCompare();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/cars", label: "Browse Inventory", icon: CarFront },
    {
      href: "/compare",
      label: "Compare Vehicles",
      icon: ArrowLeftRight,
      badge: compareCount > 0 ? compareCount : null,
    },
    { href: "/finance", label: "Finance & Loan Calculator", icon: Calculator },
    { href: "/sell-or-trade", label: "Sell or Trade-In", icon: RefreshCw },
    { href: "/services", label: "Service Center", icon: Wrench },
    { href: "/track-request", label: "Track Request (تتبع الطلبات)", icon: Search },
    { href: "/about", label: "About Us", icon: Info },
  ];

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {/* Light icon: it sits on the dark header bar */}
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full text-white hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#E4141B]/60 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-[320px] flex-col justify-between border-r border-white/10 bg-[#161213] p-0 text-white sm:w-[360px] [&>button]:text-white/70 [&>button:hover]:text-white"
      >
        <div className="overflow-y-auto">
          {/* Logo */}
          <SheetHeader className="space-y-0 p-6 pb-4 text-left">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex w-fit items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60"
            >
              <span
                aria-hidden="true"
                className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[#E4141B]"
              >
                <span className="absolute h-10 w-1.5 -translate-x-1 -skew-x-[20deg] bg-white/95" />
                <span className="absolute h-10 w-1 translate-x-1.5 -skew-x-[20deg] bg-white/60" />
              </span>
              <span className="font-montserrat text-xl font-[800] leading-none tracking-tight text-white">
                Cars<span className="text-[#E4141B]">Ai</span>
              </span>
            </Link>
          </SheetHeader>

          {/* Links */}
          <nav aria-label="Main" className="px-3 pb-4">
            <ul className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex items-center justify-between rounded-2xl px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60 ${
                        active
                          ? "bg-white/10 text-white"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute -left-3 bottom-3 top-3 w-1 rounded-r-full bg-[#E4141B] shadow-[0_0_14px_3px_rgba(228,20,27,0.8)]"
                        />
                      )}
                      <span className="flex items-center gap-4">
                        <Icon
                          className={`h-5 w-5 shrink-0 ${active ? "text-[#E4141B]" : "text-white/40"}`}
                          aria-hidden="true"
                        />
                        <span className="font-montserrat text-lg font-[800] tracking-tight">
                          {link.label}
                        </span>
                      </span>
                      {link.badge && (
                        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[#E4141B] px-1.5 text-xs font-bold text-white">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Support */}
        <div className="relative space-y-3 border-t border-white/10 p-6">
          <span
            aria-hidden="true"
            className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-gradient-to-r from-[#E4141B]/30 via-[#E4141B] to-[#E4141B]/30 shadow-[0_0_12px_2px_rgba(228,20,27,0.6)]"
          />
          <a
            href="tel:+201009014597"
            className="flex w-fit items-center gap-2.5 rounded-md text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60"
          >
            <Phone className="h-4 w-4 text-[#E4141B]" aria-hidden="true" />
            Support: +20 100 901 4597
          </a>
          <p className="text-xs leading-relaxed text-white/50">
            Every vehicle is 150-point certified &amp; backed by our 7-day
            guarantee.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
