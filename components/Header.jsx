import React from "react";
import { Button } from "./ui/button";
import {
  Heart,
  CarFront,
  Layout,
  ArrowLeft,
  LogIn,
  LogInIcon,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";

const Header = async ({ isAdminPage = false }) => {
  const user = await checkUser();
  console.log(user, "nnnnnnnn");
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between relative">
        {/* Logo */}
        <Link
          href={isAdminPage ? "/ADMIN" : "/"}
          className="flex items-center gap-2.5"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#E4141B]" />
          <span className="text-black text-2xl font-[800] font-montserrat tracking-tight">
            Cars<span className="text-[#E4141B]">Ai</span>
          </span>

          {isAdminPage && (
            <span className="text-[11px] font-semibold uppercase tracking-wide bg-[#E4141B] text-white px-2.5 py-0.5 rounded-full">
              admin
            </span>
          )}
        </Link>

        {/* Center Nav Links */}
        {!isAdminPage && (
          <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 px-4 py-2 rounded-full hover:text-[#E4141B] hover:bg-red-50 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/cars"
              className="text-sm font-medium text-gray-700 px-4 py-2 rounded-full hover:text-[#E4141B] hover:bg-red-50 transition-colors"
            >
              Browse Cars
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-700 px-4 py-2 rounded-full hover:text-[#E4141B] hover:bg-red-50 transition-colors"
            >
              About
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isAdminPage ? (
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft size={16} />
                <span>Back to App</span>
              </Button>
            </Link>
          ) : (
            <SignedIn>
              {!isAdmin && (
                <Link href="/reservations">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-full border-gray-300 text-gray-700 hover:bg-red-50 hover:text-[#E4141B] hover:border-red-200"
                  >
                    <CarFront size={16} />
                    <span className="hidden md:inline">My Reservations</span>
                  </Button>
                </Link>
              )}

              <Link href="/saved-cars">
                <Button
                  size="sm"
                  className="gap-2 rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white"
                >
                  <Heart size={16} />
                  <span className="hidden md:inline">Saved Cars</span>
                </Button>
              </Link>

              {isAdmin && (
                <Link href="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-full border-gray-300 text-gray-700 hover:bg-red-50 hover:text-[#E4141B] hover:border-red-200"
                  >
                    <Layout size={16} />
                    <span className="hidden md:inline">Admin Portal</span>
                  </Button>
                </Link>
              )}
            </SignedIn>
          )}

          <SignedOut>
            {!isAdminPage && (
              <SignInButton forceRedirectUrl="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="group relative rounded-full border-[#E4141B]/40 text-[#1a1a1a] font-semibold px-5 overflow-hidden transition-colors duration-300 hover:text-white hover:border-[#E4141B]"
                >
                  {/* fills solid red from the center on hover instead of a flat bg swap */}
                  <span className="absolute inset-0 scale-0 rounded-full bg-[#E4141B] transition-transform duration-300 ease-out group-hover:scale-100" />
                  <span className="relative flex items-center gap-1.5">
                    <LogInIcon className="h-3.5 w-3.5" />
                    Login
                  </span>
                </Button>
              </SignInButton>
            )}
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
