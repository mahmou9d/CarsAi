"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, TrendingUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/helpers";

const LOAN_TERMS = [24, 36, 48, 60, 72, 84];

const sliderCls =
  "[&_[role=slider]]:border-[#E4141B] [&_[role=slider]]:bg-white [&_.bg-primary]:bg-[#E4141B]";

// One labelled slider row: label on the left, big value on the right
function Field({ id, label, value, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
        <div className="flex items-baseline gap-2">
          {hint && <span className="text-xs text-gray-500">{hint}</span>}
          <span className="font-montserrat text-2xl font-[800] tracking-tight text-black">
            {value}
          </span>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function FinanceCalculatorPage() {
  const [vehiclePrice, setVehiclePrice] = useState(35000);
  const [downPayment, setDownPayment] = useState(5000);
  const [tradeInValue, setTradeInValue] = useState(0);
  const [interestRate, setInterestRate] = useState(5.5);
  const [loanTerm, setLoanTerm] = useState(60);

  // Monthly payment and totals
  const calculation = useMemo(() => {
    const principal = Math.max(0, vehiclePrice - downPayment - tradeInValue);
    const monthlyRate = interestRate / 100 / 12;

    let monthlyPayment = 0;
    if (principal > 0) {
      if (monthlyRate === 0) {
        monthlyPayment = principal / loanTerm;
      } else {
        monthlyPayment =
          (principal * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm))) /
          (Math.pow(1 + monthlyRate, loanTerm) - 1);
      }
    }

    const totalPaid = monthlyPayment * loanTerm;
    const totalInterest = Math.max(0, totalPaid - principal);
    const principalPercent =
      totalPaid > 0 ? (principal / totalPaid) * 100 : 100;
    const interestPercent =
      totalPaid > 0 ? (totalInterest / totalPaid) * 100 : 0;

    return {
      principal,
      monthlyPayment: Math.round(monthlyPayment),
      totalPaid: Math.round(totalPaid),
      totalInterest: Math.round(totalInterest),
      principalPercent: Math.round(principalPercent),
      interestPercent: Math.round(interestPercent),
    };
  }, [vehiclePrice, downPayment, tradeInValue, interestRate, loanTerm]);

  const downPct =
    vehiclePrice > 0 ? Math.round((downPayment / vehiclePrice) * 100) : 0;

  return (
    <div className="px-4 pb-20 pt-28 md:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Title */}
        <header className="max-w-3xl">
          <h1 className="font-montserrat text-5xl font-[800] leading-[0.98] tracking-tighter text-black md:text-7xl">
            Car loan calculator
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
            Set your price, down payment and term to see your monthly payment,
            total interest, and the cars that fit your budget.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Controls */}
          <section
            aria-label="Loan parameters"
            className="space-y-10 rounded-3xl border border-black/5 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] md:p-10 lg:col-span-7"
          >
            <Field
              id="fin-price"
              label="Vehicle price"
              value={formatCurrency(vehiclePrice)}
            >
              <Slider
                id="fin-price"
                min={5000}
                max={150000}
                step={500}
                value={[vehiclePrice]}
                onValueChange={(val) => setVehiclePrice(val[0])}
                className={sliderCls}
              />
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>$5,000</span>
                <span>$75,000</span>
                <span>$150,000+</span>
              </div>
            </Field>

            <Field
              id="fin-down"
              label="Down payment"
              value={formatCurrency(downPayment)}
              hint={`${downPct}% of price`}
            >
              <Slider
                id="fin-down"
                min={0}
                max={Math.min(vehiclePrice, 50000)}
                step={250}
                value={[downPayment]}
                onValueChange={(val) => setDownPayment(val[0])}
                className={sliderCls}
              />
            </Field>

            <Field
              id="fin-trade"
              label="Trade-in value (optional)"
              value={formatCurrency(tradeInValue)}
            >
              <Slider
                id="fin-trade"
                min={0}
                max={30000}
                step={500}
                value={[tradeInValue]}
                onValueChange={(val) => setTradeInValue(val[0])}
                className={sliderCls}
              />
              <div className="mt-2 text-right">
                <Link
                  href="/sell-or-trade"
                  className="rounded-md text-sm font-semibold text-[#E4141B] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40"
                >
                  Estimate your trade-in value
                </Link>
              </div>
            </Field>

            <Field
              id="fin-apr"
              label="Interest rate (APR)"
              value={`${interestRate}%`}
            >
              <Slider
                id="fin-apr"
                min={1}
                max={20}
                step={0.1}
                value={[interestRate]}
                onValueChange={(val) => setInterestRate(val[0])}
                className={sliderCls}
              />
            </Field>

            {/* Term */}
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Loan duration
              </p>
              <div
                role="group"
                aria-label="Loan duration"
                className="mt-4 flex flex-wrap gap-2"
              >
                {LOAN_TERMS.map((months) => {
                  const active = loanTerm === months;
                  return (
                    <button
                      key={months}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setLoanTerm(months)}
                      className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40 ${
                        active
                          ? "border-[#E4141B] bg-[#E4141B] text-white"
                          : "border-black/10 bg-white text-gray-700 hover:border-black/30"
                      }`}
                    >
                      {months} months
                      <span
                        className={`ml-1.5 text-xs font-medium ${active ? "text-white/80" : "text-gray-500"}`}
                      >
                        {months / 12} yrs
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Result panel */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-5">
            <div className="relative overflow-hidden rounded-[32px] bg-[#161213] p-8 text-white md:p-10">
              {/* Tail-light strip */}
              <div
                aria-hidden="true"
                className="absolute inset-x-8 top-0 h-1.5 rounded-b-full bg-gradient-to-r from-[#E4141B]/30 via-[#E4141B] to-[#E4141B]/30 shadow-[0_0_30px_6px_rgba(228,20,27,0.5)]"
              />

              <p className="text-sm font-semibold text-white/60">
                Estimated monthly payment
              </p>
              <p className="mt-2 font-montserrat text-6xl font-[800] leading-none tracking-tighter md:text-7xl">
                {formatCurrency(calculation.monthlyPayment)}
              </p>
              <p className="mt-3 text-sm text-white/60">
                for {loanTerm} months at {interestRate}% APR
              </p>

              {/* Ring + breakdown */}
              <div className="mt-8 flex items-center gap-6 border-t border-white/10 pt-8">
                <div className="relative size-32 shrink-0">
                  <svg
                    viewBox="0 0 120 120"
                    className="size-full -rotate-90"
                    role="img"
                    aria-label={`${calculation.principalPercent}% principal, ${calculation.interestPercent}% interest`}
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="14"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="#E4141B"
                      strokeWidth="14"
                      pathLength="100"
                      strokeDasharray={`${calculation.principalPercent} ${100 - calculation.principalPercent}`}
                      className="transition-all duration-300"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="14"
                      pathLength="100"
                      strokeDasharray={`${calculation.interestPercent} ${100 - calculation.interestPercent}`}
                      strokeDashoffset={-calculation.principalPercent}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-center">
                    <div>
                      <p className="font-montserrat text-2xl font-[800] leading-none">
                        {calculation.interestPercent}%
                      </p>
                      <p className="mt-1 text-[11px] text-white/60">interest</p>
                    </div>
                  </div>
                </div>

                <ul className="flex-1 space-y-3 text-sm">
                  <li className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-white/70">
                      <span
                        className="size-2.5 rounded-full bg-[#E4141B]"
                        aria-hidden="true"
                      />
                      Financed
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(calculation.principal)}
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-white/70">
                      <span
                        className="size-2.5 rounded-full bg-white"
                        aria-hidden="true"
                      />
                      Interest
                    </span>
                    <span className="font-semibold">
                      +{formatCurrency(calculation.totalInterest)}
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-base font-bold">
                    <span>Total paid</span>
                    <span>{formatCurrency(calculation.totalPaid)}</span>
                  </li>
                </ul>
              </div>

              <Link
                href={`/cars?maxPrice=${vehiclePrice}`}
                className="group mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#E4141B] font-semibold text-white transition-colors hover:bg-[#c81219] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#161213]"
              >
                Browse cars within this budget
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Value props */}
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <li className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#E4141B]/10 text-[#E4141B]">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-black">
                    Zero hidden fees
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
                    All pricing and finance calculations are upfront.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#E4141B]/10 text-[#E4141B]">
                  <TrendingUp className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-black">
                    Competitive APR
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
                    Partnered with top-tier auto finance institutions.
                  </p>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
