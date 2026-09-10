"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, Calendar, Cog, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/nextjs";

// Navigation items
const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    label: "Cars",
    icon: Car,
    href: "/admin/cars",
  },
  {
    label: "Test Drives",
    icon: Calendar,
    href: "/admin/test-drives",
  },
  {
    label: "Settings",
    icon: Cog,
    href: "/admin/settings",
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full flex-col overflow-y-auto bg-white shadow-sm border-r">
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-x-2">
            <div className="h-9 w-9 rounded-lg bg-red-600 flex items-center justify-center shadow-sm">
              <Car className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              Cars<span className="text-[#E4141B]">Ai</span>
            </h1>
          </Link>
        </div>

        <div className="flex flex-col w-full p-3 gap-y-1">
          {routes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-x-3 text-slate-500 text-sm font-medium px-4 rounded-lg transition-all duration-200 hover:text-red-700 hover:bg-red-50",
                  isActive
                    ? "text-red-700 bg-red-100 shadow-sm hover:bg-red-100 hover:text-red-700"
                    : "",
                  "h-11",
                )}
              >
                <route.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-red-700" : "text-slate-400",
                  )}
                />
                {route.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto p-6 border-t">
          <SignOutButton>
            <button className="flex items-center gap-x-2 text-slate-500 text-sm font-medium transition-all duration-200 hover:text-red-700 w-full">
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          </SignOutButton>
        </div>
      </div>

      {/* Mobile Bottom Tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around items-center h-16">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center justify-center text-slate-500 text-xs font-medium transition-all duration-200",
                isActive ? "text-red-700" : "",
                "py-1 flex-1",
              )}
            >
              <route.icon
                className={cn(
                  "h-6 w-6 mb-1 transition-colors",
                  isActive ? "text-red-700" : "text-slate-400",
                )}
              />
              {route.label}
            </Link>
          );
        })}
      </div>
    </>
  );
};
