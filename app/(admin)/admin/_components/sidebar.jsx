"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Calendar,
  Cog,
  LogOut,
  MessageSquare,
  Users,
  TrendingUp,
  ClipboardCheck,
  History,
  MoreHorizontal,
  ArrowLeftRight,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/auth-context";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

// Navigation items
export const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Cars", icon: Car, href: "/admin/cars" },
  { label: "Trade-Ins", icon: ArrowLeftRight, href: "/admin/trade-ins" },
  { label: "Services", icon: Wrench, href: "/admin/services" },
  { label: "Inspection", icon: ClipboardCheck, href: "/admin/cars/inspection" },
  { label: "Inquiries", icon: MessageSquare, href: "/admin/inquiries" },
  { label: "Test Drives", icon: Calendar, href: "/admin/test-drives" },
  { label: "Customers", icon: Users, href: "/admin/users" },
  { label: "Reports", icon: TrendingUp, href: "/admin/reports" },
  { label: "Audit Logs", icon: History, href: "/admin/logs" },
  { label: "Settings", icon: Cog, href: "/admin/settings" },
];

// Phones show these four in the bar; everything else lives under "More"
export const PRIMARY_HREFS = [
  "/admin",
  "/admin/cars",
  "/admin/inquiries",
  "/admin/test-drives",
];

export const SidebarContent = ({ onNavigate }) => {
  const pathname = usePathname() ?? "";
  const { signOut } = useAuthContext();

  const activeHref = routes
    .filter((r) =>
      r.href === "/admin"
        ? pathname === r.href
        : pathname === r.href || pathname.startsWith(r.href + "/"),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const isActiveRoute = (href) => href === activeHref;

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#161213] text-white">
      {/* Logo */}
      <div className="px-6 pb-6 pt-7">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60"
        >
          <span
            aria-hidden="true"
            className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[#E4141B]"
          >
            <span className="absolute h-10 w-1.5 -translate-x-1 -skew-x-[20deg] bg-white/95" />
            <span className="absolute h-10 w-1 translate-x-1.5 -skew-x-[20deg] bg-white/60" />
          </span>
          <span className="font-montserrat text-xl font-[800] leading-none tracking-tight">
            Cars<span className="text-[#E4141B]">Ai</span>
          </span>
        </Link>
        <p className="mt-4 text-xs font-semibold text-white/40">
          Admin portal
        </p>
      </div>

      {/* Nav */}
      <nav aria-label="Admin" className="flex flex-col gap-1 px-3">
        {routes.map((route) => {
          const active = isActiveRoute(route.href);
          return (
            <Link
              key={route.href}
              href={route.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-11 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              {/* Headlight bar on the active item */}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute -left-3 bottom-2 top-2 w-1 rounded-r-full bg-[#E4141B] shadow-[0_0_14px_3px_rgba(228,20,27,0.8)]"
                />
              )}
              <route.icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-[#E4141B]" : "text-white/40",
                )}
              />
              {route.label}
            </Link>
          );
        })}
      </nav>

      {/* Log out */}
      <div className="mt-auto border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            signOut();
          }}
          className="flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60"
        >
          <LogOut className="h-5 w-5 text-white/40" />
          Log out
        </button>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  return (
    <aside className="hidden h-full flex-col overflow-y-auto bg-[#161213] text-white md:flex">
      <SidebarContent />
    </aside>
  );
};
