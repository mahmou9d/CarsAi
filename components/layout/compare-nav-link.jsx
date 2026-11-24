"use client";

import Link from "next/link";
import { useCompare } from "@/hooks/use-compare";
import { ArrowLeftRight } from "lucide-react";

export function CompareNavLink() {
  const { compareCount } = useCompare();

  return (
    <Link
      href="/compare"
      className="relative text-sm font-medium text-gray-700 px-4 py-2 rounded-full hover:text-[#E4141B] transition-colors flex items-center gap-1.5"
    >
      <ArrowLeftRight className="h-3.5 w-3.5" />
      <span>Compare</span>
      {compareCount > 0 && (
        <span className="inline-flex items-center justify-center bg-[#E4141B] text-white text-[11px] font-bold h-4 min-w-4 px-1 rounded-full">
          {compareCount}
        </span>
      )}
    </Link>
  );
}
