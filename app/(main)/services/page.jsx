"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  Calendar,
  Check,
  Clock,
  Phone,
  DollarSign,
  Copy,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createServiceBooking } from "@/actions/service-booking";

const MAINTENANCE_INTERVALS = [
  {
    miles: "10,000 Miles",
    timeframe: "Every 12 Months",
    costEstimate: "$120 - $180",
    items: [
      "Full Synthetic Engine Oil & Filter Change",
      "Tire Rotation & Pressure Calibration",
      "Brake Pad & Rotor Thickness Check",
      "Multi-Point Safety Inspection (Fluids & Belts)",
      "Steering & Suspension Geometry Check",
    ],
  },
  {
    miles: "30,000 Miles",
    timeframe: "Every 36 Months",
    costEstimate: "$320 - $450",
    items: [
      "All 10k Maintenance Items Included",
      "Engine Air Filter & Cabin Microfilter Replacement",
      "Brake Fluid Flush & Bleed",
      "Coolant Condition & Hose Pressure Test",
      "Battery Load & Alternator Output Test",
      "Fuel System & Throttle Body Cleaning",
    ],
  },
  {
    miles: "60,000 Miles",
    timeframe: "Major Certified Service",
    costEstimate: "$550 - $780",
    items: [
      "All 30k Maintenance Items Included",
      "Transmission Fluid & Filter Replacement",
      "Differential & Transfer Case Fluid (AWD/4WD)",
      "Spark Plugs & Ignition Coil Inspection",
      "Drive Belts & Tensioner Evaluation",
      "Comprehensive Diagnostic Computer Scan",
    ],
  },
  {
    miles: "100,000 Miles",
    timeframe: "Centennial Master Care",
    costEstimate: "$850 - $1,200",
    items: [
      "All 60k Service Items Included",
      "Timing Belt / Chain & Water Pump Service",
      "Complete Engine Coolant Replacement",
      "Oxygen Sensor & Catalytic Converter Testing",
      "Suspension Bushing & Strut Refresh",
      "CarsAi 150-Point Recertification Pass",
    ],
  },
];

const BRANDS = ["Toyota", "Mercedes-Benz", "BMW", "Porsche", "Hyundai", "Ford"];

const SERVICE_TYPES = [
  "Scheduled Maintenance (Oil, Filters, Brakes)",
  "Brake Service & Pad Replacement",
  "Engine & Transmission Diagnostic",
  "Air Conditioning & HVAC Service",
  "Tire Balancing & Alignment",
  "150-Point Pre-Purchase Inspection",
];

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "OEM certified parts",
    text: "We use 100% genuine factory parts backed by a 12-month / 12,000-mile warranty.",
  },
  {
    icon: Wrench,
    title: "Master technicians",
    text: "ASE-certified mechanics specializing in American, European, and Japanese vehicles.",
  },
  {
    icon: DollarSign,
    title: "Transparent pricing",
    text: "No surprises or hidden fees. We provide digital video inspections before any work begins.",
  },
];

const fieldCls =
  "h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40";

export default function ServicesPage() {
  const [selectedInterval, setSelectedInterval] = useState(0);
  const [carMake, setCarMake] = useState("Toyota");
  const [appointmentName, setAppointmentName] = useState("");
  const [appointmentPhone, setAppointmentPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!appointmentName.trim() || !appointmentPhone.trim()) {
      toast.error("Please enter your name and phone number");
      return;
    }

    const intervalObj = MAINTENANCE_INTERVALS[selectedInterval];
    const costMatches = intervalObj.costEstimate.match(/\d+/g);
    const estCost = costMatches ? Number(costMatches[0]) : 150;

    setSubmitting(true);
    const res = await createServiceBooking({
      customerName: appointmentName.trim(),
      customerPhone: appointmentPhone.trim(),
      carMake,
      serviceType,
      servicePackage: intervalObj.miles,
      preferredDate: appointmentDate || new Date().toISOString().slice(0, 10),
      estimatedCost: estCost,
    });
    setSubmitting(false);

    if (!res.success) {
      toast.error(res.error || "Failed to book service appointment");
      return;
    }

    setBookingRef(res.data.referenceNumber);
    setBooked(true);
    toast.success("Service appointment request submitted and logged!");
  };

  const interval = MAINTENANCE_INTERVALS[selectedInterval];

  // Odometer digits: "10,000 Miles" -> 010000 -> [0,1,0] [0,0,0]; leading zeros are dimmed
  const milesNum = parseInt(interval.miles.replace(/,/g, ""), 10) || 0;
  const digits = String(milesNum).padStart(6, "0").split("");
  const firstReal = digits.findIndex((d) => d !== "0");

  return (
    <div className="px-4 pb-20 pt-24 md:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Title panel */}
        <header className="relative overflow-hidden rounded-[40px] bg-[#161213] px-8 pb-14 pt-12 text-white md:px-14 md:pb-16 md:pt-16">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <span className="absolute -top-10 bottom-[-40px] right-[6%] w-24 -skew-x-[20deg] bg-white/[0.06] md:w-40" />
            <span className="absolute -top-10 bottom-[-40px] right-[20%] w-10 -skew-x-[20deg] bg-[#E4141B]/20 md:w-16" />
          </div>

          <h1 className="relative font-montserrat text-5xl font-[800] leading-[0.95] tracking-tighter md:text-7xl">
            Certified
            <br />
            vehicle care
          </h1>
          <p className="relative mt-5 max-w-lg text-white/70 md:text-lg">
            Browse factory maintenance schedules and cost estimates, then book
            an appointment with our technicians.
          </p>

          <div
            aria-hidden="true"
            className="absolute inset-x-8 bottom-0 h-1.5 rounded-full bg-gradient-to-r from-[#E4141B]/30 via-[#E4141B] to-[#E4141B]/30 shadow-[0_0_30px_6px_rgba(228,20,27,0.5)] md:inset-x-14"
          />
        </header>

        {/* Pillars */}
        <ul className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#E4141B]/10 text-[#E4141B]">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-montserrat text-lg font-[800] tracking-tight text-black">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Service intervals: odometer + checklist */}
        <section aria-labelledby="intervals-title" className="mt-20">
          <h2
            id="intervals-title"
            className="font-montserrat text-3xl font-[800] tracking-tighter text-black md:text-5xl"
          >
            Recommended service intervals
          </h2>
          <p className="mt-3 max-w-xl text-gray-600">
            Pick your car&apos;s mileage to see the standard service items and
            estimated cost.
          </p>

          <div className="mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* Odometer */}
            <div className="rounded-[32px] bg-[#161213] p-6 text-white md:p-8 lg:col-span-5">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="svc-brand"
                  className="text-sm font-semibold text-white/60"
                >
                  Brand
                </label>
                <select
                  id="svc-brand"
                  value={carMake}
                  onChange={(e) => setCarMake(e.target.value)}
                  className="h-10 rounded-full border border-white/20 bg-transparent px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60 [&>option]:text-black"
                >
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Digit tiles */}
              <div
                className="mt-8 flex items-center gap-1.5"
                role="img"
                aria-label={interval.miles}
              >
                {digits.map((d, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i === 3 && (
                      <span className="text-3xl font-bold text-white/40">
                        ,
                      </span>
                    )}
                    <span
                      className={`grid h-16 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.06] font-mono text-4xl font-bold sm:h-20 sm:w-14 sm:text-5xl ${
                        i < firstReal ? "text-white/20" : "text-white"
                      }`}
                    >
                      {d}
                    </span>
                  </span>
                ))}
                <span className="ml-1 self-end pb-2 text-sm font-semibold text-white/60">
                  miles
                </span>
              </div>

              <p className="mt-4 text-sm text-white/60">{interval.timeframe}</p>

              {/* Interval stops */}
              <div
                role="group"
                aria-label="Service interval"
                className="mt-8 grid grid-cols-4 gap-2"
              >
                {MAINTENANCE_INTERVALS.map((item, idx) => {
                  const active = selectedInterval === idx;
                  return (
                    <button
                      key={item.miles}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedInterval(idx)}
                      className={`rounded-full border py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/60 ${
                        active
                          ? "border-[#E4141B] bg-[#E4141B] text-white"
                          : "border-white/20 text-white/70 hover:border-white/50 hover:text-white"
                      }`}
                    >
                      {item.miles.split(",")[0]}k
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-sm font-semibold text-white/60">
                  Estimated service cost
                </p>
                <p className="mt-1 font-montserrat text-4xl font-[800] tracking-tighter">
                  {interval.costEstimate}
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] md:p-8 lg:col-span-7">
              <p className="text-sm font-semibold text-[#E4141B]">
                {carMake} certified maintenance
              </p>
              <h3 className="mt-1 font-montserrat text-2xl font-[800] tracking-tight text-black">
                {interval.miles} service package
              </h3>

              <ul className="mt-6 divide-y divide-black/5">
                {interval.items.map((it) => (
                  <li key={it} className="flex items-start gap-3 py-3.5">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#E4141B] text-white">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="font-medium text-gray-900">{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Booking */}
        <section
          aria-labelledby="book-title"
          className="mt-20 grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
        >
          <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] md:p-10 lg:col-span-7">
            <h2
              id="book-title"
              className="font-montserrat text-2xl font-[800] tracking-tight text-black md:text-3xl"
            >
              Schedule a service appointment
            </h2>
            <p className="mt-1 text-gray-600">
              Choose a date and our service coordinator will reserve your slot.
            </p>

            {booked ? (
              <div className="mt-8 rounded-3xl bg-[#F3F1EC] p-6 sm:p-8 text-center space-y-6">
                <div>
                  <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#E4141B] text-white">
                    <Check className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 font-montserrat text-2xl font-[800] tracking-tight text-black">
                    Service Appointment Requested!
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Your appointment has been registered with booking code:
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="font-mono text-3xl font-extrabold tracking-widest text-[#E4141B]">
                      {bookingRef}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(bookingRef);
                        toast.success("Booking reference copied!");
                      }}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-black"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Details summary */}
                <div className="rounded-2xl bg-white p-5 text-left text-sm space-y-2 border border-black/5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service:</span>
                    <span className="font-semibold text-black">{serviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vehicle Brand:</span>
                    <span className="font-semibold text-black">{carMake}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Preferred Date:</span>
                    <span className="font-semibold text-black">{appointmentDate || "First Available Slot"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Registered Phone:</span>
                    <span className="font-semibold text-black">{appointmentPhone}</span>
                  </div>
                </div>

                {/* What happens next? */}
                <div className="rounded-2xl bg-white p-5 text-left text-xs sm:text-sm border border-black/5 space-y-3">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#E4141B]" />
                    What happens next? (كيف ستعرف حالة موعدك؟)
                  </div>
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">1</span>
                      <span><strong>اتصال من مستشار الخدمة:</strong> سيتواصل معك فريق الصيانة هاتفياً لتأكيد ساعة الحضور ومكان الحارة المخصصة.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-800">2</span>
                      <span><strong>فحص الـ 150 نقطة الرقمي:</strong> عند إدخال السيارة، يتم عمل فحص شامل وتحديث الحالة مباشرة في سجل سيارتك.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-800">3</span>
                      <span><strong>إشعار الجاهزية للاستلام:</strong> تتغير الحالة تلقائياً إلى "جاهزة للاستلام" فور انتهاء الفني من الخدمة.</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    asChild
                    className="h-12 flex-1 rounded-full bg-[#E4141B] font-semibold text-white hover:bg-[#c81219]"
                  >
                    <Link href={`/track-request?ref=${bookingRef}&phone=${encodeURIComponent(appointmentPhone)}`}>
                      تتبع حالة الموعد الآن (Track Booking)
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 rounded-full border-black/15 bg-white px-6 font-semibold"
                  >
                    <Link href="/reservations">
                      لوحة حجوزاتي
                    </Link>
                  </Button>
                  <Button
                    onClick={() => setBooked(false)}
                    variant="ghost"
                    className="h-12 rounded-full text-xs text-slate-500 hover:text-black"
                  >
                    حجز آخر
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="mt-8 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="b-name" className="text-sm font-medium">
                      Full name *
                    </label>
                    <Input
                      id="b-name"
                      required
                      placeholder="Ahmed Hassan"
                      value={appointmentName}
                      onChange={(e) => setAppointmentName(e.target.value)}
                      className="h-12 rounded-xl border-black/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="b-phone" className="text-sm font-medium">
                      Phone number *
                    </label>
                    <Input
                      id="b-phone"
                      type="tel"
                      required
                      placeholder="+20 100 123 4567"
                      value={appointmentPhone}
                      onChange={(e) => setAppointmentPhone(e.target.value)}
                      className="h-12 rounded-xl border-black/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="b-date" className="text-sm font-medium">
                      Preferred date
                    </label>
                    <Input
                      id="b-date"
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="h-12 rounded-xl border-black/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="b-type" className="text-sm font-medium">
                      Service type
                    </label>
                    <select
                      id="b-type"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className={fieldCls}
                    >
                      {SERVICE_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-14 w-full gap-2 rounded-full bg-[#E4141B] text-base font-semibold text-white hover:bg-[#c81219]"
                >
                  <Calendar className="h-4 w-4" />
                  Confirm service appointment
                </Button>
              </form>
            )}
          </div>

          {/* Service lounge + inspection */}
          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-[32px] bg-[#F3F1EC] p-8">
              <h3 className="font-montserrat text-xl font-[800] tracking-tight text-black">
                CarsAi service lounge
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                Relax in our customer lounge while we service your car, with
                complimentary coffee, high-speed Wi-Fi, quiet workspaces, and
                live workshop glass viewing.
              </p>
              <ul className="mt-6 space-y-3 border-t border-black/10 pt-6 text-sm text-gray-800">
                <li className="flex items-center gap-3">
                  <Clock
                    className="h-4 w-4 shrink-0 text-[#E4141B]"
                    aria-hidden="true"
                  />
                  Monday – Sunday: 8:00 AM – 7:00 PM
                </li>
                <li className="flex items-center gap-3">
                  <Phone
                    className="h-4 w-4 shrink-0 text-[#E4141B]"
                    aria-hidden="true"
                  />
                  <a
                    href="tel:+201009014597"
                    className="rounded-md underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4141B]/40"
                  >
                    Direct service line: +20 100 901 4597
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex gap-4 px-2">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#E4141B] text-white">
                <Check className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-black">
                  Complimentary multi-point inspection
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  Every visit includes a free digital battery health test, tire
                  tread depth check, and fluid top-up.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
