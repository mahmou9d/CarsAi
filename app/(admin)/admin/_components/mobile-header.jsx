"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar";

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/10 bg-[#161213] px-4 text-white md:hidden shadow-md">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-[#E4141B]"
        >
          <span className="absolute h-9 w-1.5 -translate-x-1 -skew-x-[20deg] bg-white/95" />
          <span className="absolute h-9 w-1 translate-x-1 -skew-x-[20deg] bg-white/60" />
        </span>
        <span className="font-montserrat text-lg font-[800] leading-none tracking-tight">
          Cars<span className="text-[#E4141B]">Ai</span>
        </span>
        <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/60">
          Admin
        </span>
      </Link>

      {/* Button to open Sidebar Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-white hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-[#E4141B]"
            aria-label="Open navigation sidebar"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 p-0 bg-[#161213] border-r border-white/10 text-white"
        >
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}

