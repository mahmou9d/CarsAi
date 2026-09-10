// @ts-nocheck
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CarFront } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center min-h-[100vh] px-4 text-center">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-[#E4141B]/5"
        aria-hidden="true"
      />

      <div className="relative w-16 h-16 rounded-full bg-[#E4141B] flex items-center justify-center mb-6">
        <CarFront size={26} className="text-white" />
      </div>

      <h1 className="relative text-7xl md:text-8xl font-[800] tracking-tight text-[#111111] mb-3">
        404
      </h1>
      <h2 className="relative text-xl font-[700] mb-3">
        This lot is empty
      </h2>
      <p className="relative text-[#4A4A4A] max-w-sm mb-9 leading-relaxed">
        The page you're looking for doesn't exist or has been moved. Let's
        get you back to the cars that do.
      </p>

      <Link href="/" className="relative">
        <Button className="rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white px-6">
          Return Home
        </Button>
      </Link>
    </div>
  );
}