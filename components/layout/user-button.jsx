"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Heart,
  CarFront,
  Layout,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";
import { useAuthContext } from "@/context/auth-context";

export function UserButton({ appearance }) {
  const { user, signOut } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isAdmin = user.role === "ADMIN" || user.isAdmin;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E4141B]/30"
        aria-expanded={isOpen}
      >
        {user.imageUrl && !imgError ? (
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200">
            <Image
              src={user.imageUrl}
              alt={user.name || "User"}
              fill
              unoptimized
              onError={() => setImgError(true)}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#E4141B] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {initials}
          </div>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 hidden sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* User info banner */}
          <div className="p-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user.name || "User"}
              </p>
              {isAdmin && (
                <span className="text-[10px] font-bold bg-[#E4141B]/10 text-[#E4141B] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" /> Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {user.email}
            </p>
          </div>

          {/* Navigation links */}
          <div className="py-1">
            <Link
              href="/reservations"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-50 hover:text-[#E4141B] transition-colors"
            >
              <CarFront className="h-4 w-4 text-slate-400" />
              <span>My Reservations</span>
            </Link>

            <Link
              href="/saved-cars"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-50 hover:text-[#E4141B] transition-colors"
            >
              <Heart className="h-4 w-4 text-slate-400" />
              <span>Saved Cars</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#E4141B] rounded-xl hover:bg-red-50 transition-colors"
              >
                <Layout className="h-4 w-4 text-[#E4141B]" />
                <span>Admin Portal</span>
              </Link>
            )}
          </div>

          <div className="border-t border-slate-100 pt-1 mt-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
