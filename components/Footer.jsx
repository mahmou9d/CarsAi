import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-[#161213] text-gray-300 rounded-t-[48px] mt-4">
      <div
        className="absolute -top-24 -left-16 w-64 h-64 rounded-full bg-[#E4141B]/10"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-28 right-0 w-72 h-72 rounded-full bg-[#E4141B]/10"
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
          {/* Brand */}
          <div className="col-span-2 pr-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E4141B]" />
              <span className="text-white text-xl font-bold font-montserrat tracking-tight">
                Cars<span className="text-[#E4141B]">Ai</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm mt-4 max-w-xs leading-relaxed">
              Your smartest way to find, compare, and reserve your dream car.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#E4141B] transition-colors"
              >
                <Facebook size={15} />
              </a>
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#E4141B] transition-colors"
              >
                <Instagram size={15} />
              </a>
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#E4141B] transition-colors"
              >
                <Twitter size={15} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-xs font-semibold uppercase tracking-wide mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#E4141B] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/saved-cars"
                  className="hover:text-[#E4141B] transition-colors"
                >
                  Saved Cars
                </Link>
              </li>
              <li>
                <Link
                  href="/reservations"
                  className="hover:text-[#E4141B] transition-colors"
                >
                  My Reservations
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-xs font-semibold uppercase tracking-wide mb-5">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail size={13} className="text-[#E4141B] shrink-0" />
                <span>mohnud0987@gmail.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={13} className="text-[#E4141B] shrink-0" />
                <span>+20 100 901 4597</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin size={13} className="text-[#E4141B] shrink-0" />
                <span>Cairo, Egypt</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} CarsAi. All rights reserved.</p>
          <Link
            href="https://mahmou9d.vercel.app/"
            target="_blank"
            className="hover:text-[#E4141B] transition-colors"
          >
            Mahmoud Mohammed
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
