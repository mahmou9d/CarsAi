"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Loader2, Send, Copy, Clock, PhoneCall, DollarSign, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/helpers";
import { createTradeInRequest } from "@/actions/trade-in";

const CONDITIONS = [
  {
    id: "EXCELLENT",
    title: "Excellent",
    desc: "Like new, no mechanical or cosmetic defects, complete maintenance history.",
    multiplier: 1.05,
  },
  {
    id: "GOOD",
    title: "Good",
    desc: "Clean condition, minor normal wear, fully functional mechanics.",
    multiplier: 0.95,
  },
  {
    id: "FAIR",
    title: "Fair",
    desc: "Some noticeable cosmetic flaws or mechanical attention needed soon.",
    multiplier: 0.82,
  },
  {
    id: "POOR",
    title: "Needs work",
    desc: "Noticeable wear, body damage, or significant mechanical issues.",
    multiplier: 0.68,
  },
];

const STEPS = ["Vehicle details", "Instant quote", "Confirmation"];

const inputCls = "h-12 rounded-xl border-black/10 bg-white";

export default function SellOrTradePage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [quoteId, setQuoteId] = useState("");

  const [vehicle, setVehicle] = useState({
    year: "2020",
    make: "",
    model: "",
    mileage: "",
    condition: "GOOD",
  });

  const [contact, setContact] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "Cairo",
    notes: "",
  });

  // Estimate trade-in and cash offer
  const calculateValuation = () => {
    const yearNum = parseInt(vehicle.year, 10) || 2020;
    const mileageNum = parseInt(vehicle.mileage, 10) || 50000;
    const condObj =
      CONDITIONS.find((c) => c.id === vehicle.condition) || CONDITIONS[1];

    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - yearNum);
    const baseNew = 38000;
    let depVal = baseNew * Math.pow(0.87, age);

    const mileageDiff = mileageNum - age * 12000;
    const mileagePenalty = (mileageDiff / 10000) * 800;
    depVal = Math.max(3000, depVal - mileagePenalty);

    const estimatedMarket = Math.round(depVal * condObj.multiplier);
    const instantCash = Math.round(estimatedMarket * 0.9);
    const tradeInCredit = Math.round(estimatedMarket * 0.96);

    return { estimatedMarket, instantCash, tradeInCredit };
  };

  const valuation = calculateValuation();

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!vehicle.make.trim() || !vehicle.model.trim() || !vehicle.mileage) {
      toast.error("Please enter your vehicle make, model, and mileage");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (
      !contact.fullName.trim() ||
      !contact.email.trim() ||
      !contact.phone.trim()
    ) {
      toast.error("Please complete your contact details");
      return;
    }

    setSubmitting(true);
    const res = await createTradeInRequest({
      vehicle,
      contact,
      valuation,
    });
    setSubmitting(false);

    if (!res.success) {
      toast.error(res.error || "Failed to submit appraisal request");
      return;
    }

    setQuoteId(res.data.referenceNumber);
    setStep(3);
    toast.success("Trade-in appraisal request submitted and logged!");
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="px-4 pb-20 pt-24 md:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Title panel with the route stepper */}
        <header className="relative overflow-hidden rounded-[40px] bg-[#161213] px-8 pb-16 pt-12 text-white md:px-14 md:pt-16">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <span className="absolute -top-10 bottom-[-40px] right-[6%] w-24 -skew-x-[20deg] bg-white/[0.06] md:w-40" />
            <span className="absolute -top-10 bottom-[-40px] right-[20%] w-10 -skew-x-[20deg] bg-[#E4141B]/20 md:w-16" />
          </div>

          <h1 className="relative font-montserrat text-5xl font-[800] leading-[0.95] tracking-tighter md:text-7xl">
            Sell or trade
            <br />
            your car
          </h1>
          <p className="relative mt-5 max-w-md text-white/70 md:text-lg">
            Get an instant cash offer or trade-in credit estimate in about 2
            minutes.
          </p>

          {/* Stepper: three stops on a route, the red line fills as you go */}
          <ol className="relative mt-12 grid max-w-xl grid-cols-3">
            <span
              aria-hidden="true"
              className="absolute left-[16.66%] right-[16.66%] top-4 h-0.5 bg-white/15"
            />
            <span
              aria-hidden="true"
              className="absolute left-[16.66%] top-4 h-0.5 bg-[#E4141B] transition-all duration-500"
              style={{ width: `${(step - 1) * 33.33}%` }}
            />
            {STEPS.map((label, i) => {
              const n = i + 1;
              const reached = step >= n;
              return (
                <li
                  key={label}
                  aria-current={step === n ? "step" : undefined}
                  className="relative flex flex-col items-center gap-2 text-center"
                >
                  <span
                    className={`grid size-8 place-items-center rounded-full text-sm font-semibold transition-colors ${
                      reached
                        ? "bg-[#E4141B] text-white"
                        : "border border-white/25 bg-[#161213] text-white/50"
                    }`}
                  >
                    {step > n ? <Check className="h-4 w-4" /> : n}
                  </span>
                  <span
                    className={`text-xs md:text-sm ${reached ? "font-semibold text-white" : "text-white/50"}`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>

          <div
            aria-hidden="true"
            className="absolute inset-x-8 bottom-0 h-1.5 rounded-full bg-gradient-to-r from-[#E4141B]/30 via-[#E4141B] to-[#E4141B]/30 shadow-[0_0_30px_6px_rgba(228,20,27,0.5)] md:inset-x-14"
          />
        </header>

        {/* Step 1: vehicle details */}
        {step === 1 && (
          <form
            onSubmit={handleStep1Submit}
            className="mx-auto mt-10 max-w-3xl space-y-8 rounded-3xl border border-black/5 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] md:p-10"
          >
            <div>
              <h2 className="font-montserrat text-2xl font-[800] tracking-tight text-black">
                Tell us about your car
              </h2>
              <p className="mt-1 text-gray-600">
                We use current market data to give you an estimate.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="v-year">Year *</Label>
                <Select
                  value={vehicle.year}
                  onValueChange={(val) =>
                    setVehicle((v) => ({ ...v, year: val }))
                  }
                >
                  <SelectTrigger id="v-year" className={inputCls}>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 25 }, (_, i) => currentYear - i).map(
                      (yr) => (
                        <SelectItem key={yr} value={yr.toString()}>
                          {yr}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="v-make">Make *</Label>
                <Input
                  id="v-make"
                  required
                  className={inputCls}
                  placeholder="e.g. Toyota, BMW"
                  value={vehicle.make}
                  onChange={(e) =>
                    setVehicle((v) => ({ ...v, make: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="v-model">Model *</Label>
                <Input
                  id="v-model"
                  required
                  className={inputCls}
                  placeholder="e.g. Camry, 330i"
                  value={vehicle.model}
                  onChange={(e) =>
                    setVehicle((v) => ({ ...v, model: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="v-mileage">Current mileage (miles) *</Label>
              <Input
                id="v-mileage"
                type="number"
                required
                className={inputCls}
                placeholder="e.g. 45000"
                value={vehicle.mileage}
                onChange={(e) =>
                  setVehicle((v) => ({ ...v, mileage: e.target.value }))
                }
              />
            </div>

            {/* Condition */}
            <div className="space-y-3">
              <p id="cond-label" className="text-sm font-medium">
                Vehicle condition *
              </p>
              <div
                role="radiogroup"
                aria-labelledby="cond-label"
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                {CONDITIONS.map((cond) => {
                  const active = vehicle.condition === cond.id;
                  return (
                    <button
                      key={cond.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() =>
                        setVehicle((v) => ({ ...v, condition: cond.id }))
                      }
                      className={`relative rounded-2xl border-2 p-4 pr-12 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40 ${
                        active
                          ? "border-[#E4141B] bg-[#E4141B]/5"
                          : "border-black/10 hover:border-black/30"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute right-4 top-4 grid size-6 place-items-center rounded-full border-2 transition-colors ${
                          active
                            ? "border-[#E4141B] bg-[#E4141B] text-white"
                            : "border-black/20"
                        }`}
                      >
                        {active && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="block font-montserrat font-[800] tracking-tight text-black">
                        {cond.title}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-gray-600">
                        {cond.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              className="h-14 w-full gap-2 rounded-full bg-[#E4141B] text-base font-semibold text-white hover:bg-[#c81219]"
            >
              Calculate my instant offer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* Step 2: offers + contact */}
        {step === 2 && (
          <div className="mx-auto mt-10 max-w-4xl space-y-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {/* Best offer */}
              <div className="relative overflow-hidden rounded-3xl bg-[#161213] p-8 text-white md:col-span-3 md:p-10">
                <span className="rounded-full bg-[#E4141B] px-3 py-1 text-xs font-semibold">
                  Best value
                </span>
                <p className="mt-6 text-sm font-semibold text-white/60">
                  Trade-in credit
                </p>
                <p className="mt-1 font-montserrat text-5xl font-[800] leading-none tracking-tighter md:text-6xl">
                  {formatCurrency(valuation.tradeInCredit)}
                </p>
                <p className="mt-4 text-sm text-white/60">
                  Towards any vehicle in our showroom
                </p>
              </div>

              <div className="grid gap-4 md:col-span-2">
                <div className="rounded-3xl bg-[#F3F1EC] p-6">
                  <p className="text-sm font-semibold text-gray-600">
                    Instant cash offer
                  </p>
                  <p className="mt-1 font-montserrat text-3xl font-[800] tracking-tight text-black">
                    {formatCurrency(valuation.instantCash)}
                  </p>
                  <p className="mt-2 text-xs text-gray-600">
                    Cash payout within 24 hours
                  </p>
                </div>
                <div className="rounded-3xl bg-[#F3F1EC] p-6">
                  <p className="text-sm font-semibold text-gray-600">
                    Est. market value
                  </p>
                  <p className="mt-1 font-montserrat text-3xl font-[800] tracking-tight text-black">
                    {formatCurrency(valuation.estimatedMarket)}
                  </p>
                  <p className="mt-2 text-xs text-gray-600">
                    Private party retail value
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleFinalSubmit}
              className="space-y-6 rounded-3xl border border-black/5 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] md:p-10"
            >
              <div>
                <h2 className="font-montserrat text-2xl font-[800] tracking-tight text-black">
                  Lock in your valuation
                </h2>
                <p className="mt-1 text-gray-600">
                  Share your contact details so our appraisal team can inspect
                  your car and confirm the offer.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="c-name">Full name *</Label>
                  <Input
                    id="c-name"
                    required
                    className={inputCls}
                    placeholder="e.g. Ahmed Ali"
                    value={contact.fullName}
                    onChange={(e) =>
                      setContact((c) => ({ ...c, fullName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-email">Email address *</Label>
                  <Input
                    id="c-email"
                    type="email"
                    required
                    className={inputCls}
                    placeholder="ahmed@example.com"
                    value={contact.email}
                    onChange={(e) =>
                      setContact((c) => ({ ...c, email: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-phone">Phone number *</Label>
                  <Input
                    id="c-phone"
                    type="tel"
                    required
                    className={inputCls}
                    placeholder="+20 100 123 4567"
                    value={contact.phone}
                    onChange={(e) =>
                      setContact((c) => ({ ...c, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-city">City</Label>
                  <Input
                    id="c-city"
                    className={inputCls}
                    placeholder="e.g. Cairo, Giza, Alexandria"
                    value={contact.city}
                    onChange={(e) =>
                      setContact((c) => ({ ...c, city: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-notes">Additional notes (optional)</Label>
                <Textarea
                  id="c-notes"
                  rows={3}
                  className="rounded-xl border-black/10"
                  placeholder="Mention modifications, new tires, service history, or any accident details..."
                  value={contact.notes}
                  onChange={(e) =>
                    setContact((c) => ({ ...c, notes: e.target.value }))
                  }
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-full border-black/15 px-6 font-semibold"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 flex-1 gap-2 rounded-full bg-[#E4141B] font-semibold text-white hover:bg-[#c81219]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating appraisal code...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Lock in this offer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: confirmation as a ticket with tracking & what's next */}
        {step === 3 && (
          <div className="mx-auto mt-10 max-w-2xl space-y-6">
            <div className="rounded-[40px] bg-[#F3F1EC] p-6 md:p-10 shadow-sm">
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]">
                <div className="p-8 text-center">
                  <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#E4141B] text-white">
                    <Check className="h-7 w-7" />
                  </span>
                  <h2 className="mt-5 font-montserrat text-2xl font-[800] tracking-tight text-black">
                    Appraisal Request Submitted!
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Your official vehicle appraisal reference code
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-[#E4141B]">
                      {quoteId}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(quoteId);
                        toast.success("Reference code copied to clipboard!");
                      }}
                      className="h-9 w-9 p-0 text-gray-400 hover:text-black"
                      title="Copy reference code"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Tear line with notches */}
                <div className="relative border-t-2 border-dashed border-black/15">
                  <span
                    aria-hidden="true"
                    className="absolute -left-3 -top-3 size-6 rounded-full bg-[#F3F1EC]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -right-3 -top-3 size-6 rounded-full bg-[#F3F1EC]"
                  />
                </div>

                <dl className="space-y-3 p-8 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-600">Vehicle</dt>
                    <dd className="font-semibold text-black">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-600">Initial Estimated Trade-in</dt>
                    <dd className="font-bold text-[#E4141B]">
                      {formatCurrency(valuation.tradeInCredit)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-600">Instant Cash Range</dt>
                    <dd className="font-semibold text-emerald-700">
                      {formatCurrency(valuation.instantCash)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-600">Contact Registered</dt>
                    <dd className="font-semibold text-black">
                      {contact.fullName} ({contact.phone})
                    </dd>
                  </div>
                </dl>
              </div>

              {/* What happens next? Timeline */}
              <div className="mt-8 rounded-2xl bg-white p-6 border border-black/10">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#E4141B]" />
                  What happens next? (كيف ستعرف نتيجة طلبك؟)
                </h3>
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      1
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">
                        تم استلام طلبك وتسجيله بالسيستم
                      </span>
                      <span className="text-slate-500">
                        طلبك مسجل الآن برقم <strong className="text-black">{quoteId}</strong> وهو في انتظار مراجعة خبير التثمين.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      2
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">
                        اتصال هاتفي خلال 24 ساعة
                      </span>
                      <span className="text-slate-500">
                        سيتواصل معك خبير التثمين على رقم الهاتف <strong className="text-black">{contact.phone}</strong> لتأكيد حالة السيارة أو تحديد موعد فحص سريع.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                      3
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">
                        تقديم العرض المالي الرسمي
                      </span>
                      <span className="text-slate-500">
                        سيقوم المعرض بتسجيل العرض المالي المعتمد، وستتمكن من قبوله أو رفضه مباشرة عبر صفحة التتبع أو حسابك.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-12 flex-1 rounded-full bg-[#E4141B] font-semibold text-white hover:bg-[#c81219]"
                >
                  <Link href={`/track-request?ref=${quoteId}&phone=${encodeURIComponent(contact.phone)}`}>
                    تتبع حالة الطلب الآن (Track Status)
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-black/15 bg-white px-6 font-semibold"
                >
                  <Link href="/reservations">
                    لوحة طلباتي (My Requests)
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
