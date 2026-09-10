import Link from "next/link";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2">
      {/* Mobile-only compact header */}
      <div className="flex lg:hidden items-center justify-between px-4 py-4 border-b border-[#e7e5e1] bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <Link
          href="/"
          className="text-lg font-extrabold tracking-tight text-[#1a1a1a] transition-opacity hover:opacity-80"
        >
          Cars<span className="text-[#E4141B]">Ai</span>
        </Link>
      </div>

      {/* Brand panel — desktop only */}
      <div className="relative hidden lg:flex flex-col justify-center overflow-hidden bg-[#111113] p-12">
        <div className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full bg-[#E4141B]/15 blur-[120px] animate-pulse [animation-duration:6s]" />
        <div className="pointer-events-none absolute -bottom-40 -right-16 h-80 w-80 rounded-full bg-[#E4141B]/10 blur-[100px] animate-pulse [animation-duration:8s]" />

        {/* road-line motif */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-35deg, #ffffff 0 2px, transparent 2px 44px)",
          }}
        />

        {/* seam between the two panels */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

        <Link
          href="/"
          className="relative text-xl font-extrabold tracking-tight text-white w-fit"
        >
          Cars<span className="text-[#E4141B]">Ai</span>
        </Link>

        <div className="relative max-w-sm mt-auto mb-auto">
          <span className="mb-4 inline-block h-[2px] w-10 bg-[#E4141B]" />
          <p className="text-2xl font-semibold leading-snug text-white">
            Find, compare, and drive away in your next car — all in one place.
          </p>
          <p className="mt-4 text-sm text-white/50">
            Trusted by thousands of buyers and sellers every month.
          </p>
        </div>

        <div className="relative flex items-center gap-4 text-xs text-white/40">
          <span>© {new Date().getFullYear()} CarsAi</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>All rights reserved</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-[#faf9f7] px-4 py-10">
        <div className="w-full max-w-sm rounded-2xl bg-white/60 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-sm sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
