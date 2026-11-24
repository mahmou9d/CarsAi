import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, CarFront, Layout, ArrowLeft, LogIn } from "lucide-react";
import Link from "next/link";
import { UserButton } from "./user-button";
import { checkUser } from "@/lib/checkUser";
import { CompareNavLink } from "./compare-nav-link";
import { MobileNav } from "./mobile-nav";

// Center nav links (Compare sits between Browse Cars and Finance)
const NAV = [
  { href: "/", label: "Home" },
  { href: "/cars", label: "Browse Cars" },
  { compare: true },
  { href: "/finance", label: "Finance" },
  { href: "/sell-or-trade", label: "Sell / Trade" },
  { href: "/services", label: "Services" },
  { href: "/track-request", label: "Track" },
  { href: "/about", label: "About" },
];

// "Headlight" hover: a red beam of light shines up from the bottom edge of the link
const navLink =
  "group relative block whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold text-gray-400 transition-colors duration-200 hover:text-white focus-visible:text-white " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60 " +
  // soft glow
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:opacity-0 before:transition-opacity before:duration-300 " +
  "before:bg-[radial-gradient(70%_120%_at_50%_100%,rgba(228,20,27,0.55),transparent_70%)] hover:before:opacity-100 focus-visible:before:opacity-100 " +
  // bright lamp line
  "after:pointer-events-none after:absolute after:bottom-0 after:left-1/2 after:h-[3px] after:w-0 after:-translate-x-1/2 after:rounded-full " +
  "after:bg-[#E4141B] after:shadow-[0_0_12px_2px_rgba(228,20,27,0.9)] after:transition-all after:duration-300 hover:after:w-6 focus-visible:after:w-6";

const iconBtn =
  "h-10 gap-2 rounded-full px-3 text-gray-300 hover:bg-white/10 hover:text-white " +
  "focus-visible:ring-2 focus-visible:ring-[#E4141B]/60";

const Header = async ({ isAdminPage = false }) => {
  const user = await checkUser();
  const isAdmin = user?.role === "ADMIN";
  const isSignedIn = !!user;

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 pt-3 pointer-events-none">
      <nav
        aria-label="Main"
        className="pointer-events-auto relative mx-auto max-w-6xl h-14 pl-3 pr-2 flex items-center justify-between
                   rounded-full bg-[#161213]/95 backdrop-blur-xl text-white ring-1 ring-white/10
                   shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)]"
      >
        {/* Left: mobile menu + logo */}
        <div className="flex items-center gap-1">
          {/* Mobile trigger is forced light so it's visible on the dark bar */}
          {!isAdminPage && (
            <div className="text-white [&_button]:text-white [&_svg]:text-white">
              <MobileNav isAdmin={isAdmin} />
            </div>
          )}

          <Link
            href={isAdminPage ? "/admin" : "/"}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60"
          >
            <span
              aria-hidden
              className="relative grid place-items-center w-9 h-9 rounded-full bg-[#E4141B] overflow-hidden"
            >
              <span className="absolute w-1.5 h-10 bg-white/95 -skew-x-[20deg] -translate-x-1" />
              <span className="absolute w-1 h-10 bg-white/60 -skew-x-[20deg] translate-x-1.5" />
            </span>
            <span className="text-xl font-[800] font-montserrat tracking-tight text-white leading-none">
              Cars<span className="text-[#E4141B]">Ai</span>
            </span>
            {isAdminPage && (
              <span className="ml-1 rounded-full bg-[#E4141B] px-2.5 py-1 text-xs font-semibold text-white">
                Admin
              </span>
            )}
          </Link>
        </div>

        {/* Center: primary navigation (desktop) */}
        {!isAdminPage && (
          <ul className="hidden lg:flex items-center gap-0.5 absolute left-[48%] -translate-x-1/2">
            {NAV.map((item) =>
              item.compare ? (
                <li
                  key="compare"
                  className="[&_a]:text-sm [&_a]:font-semibold [&_a]:text-gray-400 [&_a:hover]:text-white"
                >
                  <CompareNavLink />
                </li>
              ) : (
                <li key={item.href}>
                  <Link href={item.href} className={navLink}>
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        )}

        {/* Right: actions */}
        <div className="flex items-center">
          {isAdminPage ? (
            <Button asChild variant="ghost" size="sm" className={iconBtn}>
              <Link href="/">
                <ArrowLeft size={16} />
                <span>Back to app</span>
              </Link>
            </Button>
          ) : (
            <>
              {isAdmin && (
                <Button asChild variant="ghost" size="sm" className={iconBtn}>
                  <Link href="/admin" aria-label="Admin portal">
                    <Layout size={18} />
                    <span className="hidden xl:inline">Admin</span>
                  </Link>
                </Button>
              )}

              {isSignedIn && !isAdmin && (
                <Button asChild variant="ghost" size="sm" className={iconBtn}>
                  <Link href="/reservations" aria-label="My reservations">
                    <CarFront size={18} />
                    <span className="hidden xl:inline">Reservations</span>
                  </Link>
                </Button>
              )}

              {isSignedIn && (
                <Button asChild variant="ghost" size="sm" className={iconBtn}>
                  <Link href="/saved-cars" aria-label="Saved cars">
                    <Heart size={18} />
                    <span className="hidden xl:inline">Saved</span>
                  </Link>
                </Button>
              )}

              {!isSignedIn && (
                <Button
                  asChild
                  size="sm"
                  className="h-10 rounded-full bg-white px-5 font-semibold text-[#161213] hover:bg-[#E4141B] hover:text-white
                             focus-visible:ring-2 focus-visible:ring-[#E4141B]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161213]"
                >
                  <Link href="/sign-in">
                    <LogIn size={16} className="mr-1.5" />
                    Log in
                  </Link>
                </Button>
              )}
            </>
          )}

          {isSignedIn && (
            <div className="pl-1.5 ml-0.5 border-l border-white/15">
              <UserButton />
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
