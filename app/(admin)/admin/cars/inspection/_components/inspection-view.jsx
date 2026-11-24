"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Printer,
  Share2,
  Car,
  ShieldCheck,
  Wrench,
  Search,
  ArrowLeft,
  Award,
  Check,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { saveCarInspection } from "@/actions/inspection";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const DEFAULT_INSPECTION_SECTIONS = [
  {
    id: "powertrain",
    title: "1. Engine & Powertrain",
    description: "Fluid levels, mechanical wear, transmission responsiveness, and exhaust emissions.",
    items: [
      { id: "oil", label: "Engine Oil Level & Clarity", status: "PASS", note: "" },
      { id: "coolant", label: "Coolant Level & Radiator Leaks", status: "PASS", note: "" },
      { id: "trans", label: "Transmission Fluid & Shift Quality", status: "PASS", note: "" },
      { id: "belts", label: "Accessory Drive Belts & Pulleys", status: "PASS", note: "" },
      { id: "exhaust", label: "Exhaust System & Catalytic Converter", status: "PASS", note: "" },
    ],
  },
  {
    id: "brakes",
    title: "2. Brakes & Suspension",
    description: "Stopping friction, hydraulic pressures, and undercarriage damping components.",
    items: [
      { id: "fpads", label: "Front Brake Pads (> 5mm remaining)", status: "PASS", note: "" },
      { id: "rpads", label: "Rear Brake Pads (> 4mm remaining)", status: "PASS", note: "" },
      { id: "rotors", label: "Brake Discs / Rotors Wear & Runout", status: "PASS", note: "" },
      { id: "abs", label: "ABS Anti-Lock Sensors & Master Cylinder", status: "PASS", note: "" },
      { id: "suspension", label: "Shock Absorbers, Struts & Bushings", status: "PASS", note: "" },
    ],
  },
  {
    id: "electrical",
    title: "3. Electrical, Battery & Diagnostics",
    description: "ECU computer health, charging currents, sensors, and illumination.",
    items: [
      { id: "battery", label: "Battery Health & Cold Cranking Amps (12.4V+)", status: "PASS", note: "" },
      { id: "obd", label: "OBD-II Diagnostic Scanner (Zero Trouble Codes)", status: "PASS", note: "" },
      { id: "alternator", label: "Alternator Output & Charging Circuit", status: "PASS", note: "" },
      { id: "lights", label: "LED / Xenon Headlights, Fog & Tail Lights", status: "PASS", note: "" },
      { id: "starter", label: "Starter Motor & Ignition Switch", status: "PASS", note: "" },
    ],
  },
  {
    id: "tires",
    title: "4. Tires & Running Gear",
    description: "Tread depth measurements, pressure balances, and alloy condition.",
    items: [
      { id: "front_tread", label: "Front Tires Tread Depth (> 4.5mm)", status: "PASS", note: "" },
      { id: "rear_tread", label: "Rear Tires Tread Depth (> 4.5mm)", status: "PASS", note: "" },
      { id: "tpms", label: "TPMS Pressure Sensors Calibrated", status: "PASS", note: "" },
      { id: "alignment", label: "Wheel Alignment & High-Speed Balance", status: "PASS", note: "" },
      { id: "spare", label: "Spare Wheel / Sealant Repair Kit Present", status: "PASS", note: "" },
    ],
  },
  {
    id: "exterior",
    title: "5. Bodywork & Exterior Condition",
    description: "Paint thickness, panel alignment, optical clarity, and structural seals.",
    items: [
      { id: "frame", label: "Unibody / Chassis Structural Integrity", status: "PASS", note: "" },
      { id: "paint", label: "Original Paint Depth & Scratch Inspection", status: "PASS", note: "" },
      { id: "glass", label: "Windshield & Side Windows (No Cracks)", status: "PASS", note: "" },
      { id: "doors", label: "Door Hinges, Locks & Boot Latch Fitment", status: "PASS", note: "" },
      { id: "seals", label: "Weatherstripping & Sunroof Water Drainage", status: "PASS", note: "" },
    ],
  },
  {
    id: "cabin",
    title: "6. Cabin, Comfort & Technology",
    description: "Air conditioning delta, infotainment touch screen, safety restraints, and trim.",
    items: [
      { id: "ac", label: "Dual-Zone Climate Control & Refrigerant", status: "PASS", note: "" },
      { id: "infotainment", label: "Infotainment Touchscreen & Sound System", status: "PASS", note: "" },
      { id: "airbags", label: "SRS Airbag Ready Light & Seatbelt Tensioners", status: "PASS", note: "" },
      { id: "seats", label: "Electric Power Seats & Leather / Fabric", status: "PASS", note: "" },
      { id: "cleanliness", label: "Cabin Air Micro-Filter & Sanitization", status: "PASS", note: "" },
    ],
  },
];

export function InspectionView({ cars = [], initialCarId = "", adminUser }) {
  const [selectedCarId, setSelectedCarId] = useState(
    initialCarId || (cars.length > 0 ? cars[0].id : "")
  );
  const [searchCarQuery, setSearchCarQuery] = useState("");
  const [sections, setSections] = useState(DEFAULT_INSPECTION_SECTIONS);
  const [inspectorName, setInspectorName] = useState(adminUser?.name || "Senior Dealership Inspector");
  const [inspectionNotes, setInspectionNotes] = useState(
    "Vehicle has passed the dealership multi-point inspection. All critical powertrain, safety, braking, and electronic systems are functioning within manufacturer tolerance."
  );
  const [saving, setSaving] = useState(false);
  const [lastSavedId, setLastSavedId] = useState(null);

  const selectedCar = useMemo(() => {
    return cars.find((c) => c.id === selectedCarId) || cars[0] || null;
  }, [cars, selectedCarId]);

  // Filter cars for dropdown / selection
  const filteredCars = useMemo(() => {
    if (!searchCarQuery) return cars;
    const q = searchCarQuery.toLowerCase();
    return cars.filter(
      (c) =>
        c.make.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.year.toString().includes(q)
    );
  }, [cars, searchCarQuery]);

  // Calculate score
  const { score, grade, passCount, warnCount, failCount } = useMemo(() => {
    let pass = 0;
    let warn = 0;
    let fail = 0;
    let totalItems = 0;

    sections.forEach((section) => {
      section.items.forEach((item) => {
        totalItems++;
        if (item.status === "PASS") pass++;
        else if (item.status === "ATTENTION") warn++;
        else if (item.status === "FAIL") fail++;
      });
    });

    let calculated = 100 - warn * 3 - fail * 10;
    if (calculated < 0) calculated = 0;

    let calculatedGrade = {
      label: "Grade A+ (Certified Mint)",
      color: "text-emerald-700 bg-emerald-50 border-emerald-300",
      badge: "DEALERSHIP CERTIFIED",
    };

    if (calculated < 95 && calculated >= 85) {
      calculatedGrade = {
        label: "Grade A (Excellent Condition)",
        color: "text-blue-700 bg-blue-50 border-blue-300",
        badge: "VERIFIED EXCELLENT",
      };
    } else if (calculated < 85 && calculated >= 70) {
      calculatedGrade = {
        label: "Grade B (Good / Minor Wear)",
        color: "text-amber-700 bg-amber-50 border-amber-300",
        badge: "GOOD QUALITY",
      };
    } else if (calculated < 70) {
      calculatedGrade = {
        label: "Grade C (Requires Service)",
        color: "text-red-700 bg-red-50 border-red-300",
        badge: "SERVICE RECOMMENDED",
      };
    }

    return {
      score: calculated,
      grade: calculatedGrade,
      passCount: pass,
      warnCount: warn,
      failCount: fail,
    };
  }, [sections]);

  const setItemStatus = (sectionId, itemId, newStatus) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          items: sec.items.map((it) => (it.id === itemId ? { ...it, status: newStatus } : it)),
        };
      })
    );
  };

  const handleResetChecklist = () => {
    setSections(DEFAULT_INSPECTION_SECTIONS);
    toast.info("Inspection checklist reset to factory standards.");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareQuote = () => {
    if (!selectedCar) return;
    const text = `🚗 *CarsAi Official Vehicle Inspection Report*\n*Vehicle:* ${selectedCar.year} ${selectedCar.make} ${selectedCar.model}\n*Condition Score:* ${score}/100 (${grade.label})\n*Passed Checks:* ${passCount}/30\n*Needs Attention:* ${warnCount}\n*Inspector:* ${inspectorName}\n*Certification:* ${grade.badge}\n\nContact us for the full inspection sheet!`;
    navigator.clipboard.writeText(text);
    toast.success("Inspection summary copied to clipboard!");
  };

  const handleSaveCertification = async () => {
    if (!selectedCar) {
      toast.error("Please select a vehicle first.");
      return;
    }
    setSaving(true);
    try {
      const result = await saveCarInspection({
        carId: selectedCar.id,
        inspectorName,
        score,
        grade: grade.label,
        certification: grade.badge,
        passedItems: passCount,
        attentionItems: warnCount,
        failedItems: failCount,
        checklistData: sections,
        notes: inspectionNotes,
      });
      if (result.success) {
        setLastSavedId(result.data.id);
        toast.success(result.message || "Inspection certification saved to database!");
      } else {
        toast.error(result.error || "Failed to save inspection. Please try again.");
      }
    } catch (err) {
      toast.error("Unexpected error saving inspection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b print:hidden">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/cars" className="hover:text-red-600 flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Inventory
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">Multi-Point Inspection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="h-7 w-7 text-[#E4141B]" />
            Vehicle Multi-Point Inspection & Certification
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete 30-point mechanical, diagnostic, chassis, and cosmetic assessment with condition certification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChecklist}
            className="flex items-center gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareQuote}
            className="flex items-center gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Share2 className="h-4 w-4" />
            Copy Summary
          </Button>
          <Button
            onClick={handleSaveCertification}
            size="sm"
            disabled={saving || !selectedCar}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
            ) : lastSavedId ? (
              <><Check className="h-4 w-4" />Saved to DB</>
            ) : (
              <><ShieldCheck className="h-4 w-4" />Save Certification</>
            )}
          </Button>
          <Button
            onClick={handlePrint}
            size="sm"
            className="flex items-center gap-1.5 bg-[#E4141B] hover:bg-red-700 text-white shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print Certificate
          </Button>
        </div>
      </div>

      {/* Vehicle Selector & Condition Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Car Selection */}
        <Card className="border-slate-200/80 shadow-sm lg:col-span-2 print:border-none print:shadow-none">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Car className="h-5 w-5 text-red-600" />
                  Target Vehicle For Inspection
                </CardTitle>
                <CardDescription>
                  Select any car from showroom stock or search by model/year.
                </CardDescription>
              </div>
              {/* Car Picker Dropdown */}
              <div className="flex items-center gap-2 print:hidden">
                <select
                  value={selectedCarId}
                  onChange={(e) => setSelectedCarId(e.target.value)}
                  className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-red-500 min-w-[220px]"
                >
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.year} {c.make} {c.model} (${parseFloat(c.price).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedCar ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="relative w-28 h-20 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                  {selectedCar.images?.[0] ? (
                    <Image
                      src={selectedCar.images[0]}
                      alt={selectedCar.make}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Car className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedCar.year} {selectedCar.make} {selectedCar.model}
                    </h2>
                    <Badge variant="outline" className="bg-white border-slate-300 text-slate-700">
                      {selectedCar.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400">Price:</span>{" "}
                      <span className="font-bold text-emerald-700">
                        ${parseFloat(selectedCar.price).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Mileage:</span>{" "}
                      <span className="font-medium text-slate-800">
                        {selectedCar.mileage?.toLocaleString()} km
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Fuel:</span>{" "}
                      <span className="font-medium text-slate-800">{selectedCar.fuelType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Body:</span>{" "}
                      <span className="font-medium text-slate-800">{selectedCar.bodyType}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 py-4 text-center">
                No vehicles found in inventory.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Condition Score Card */}
        <Card className="border-slate-200/80 shadow-sm flex flex-col justify-between print:border-none print:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Condition Rating
              </span>
              <Badge variant="outline" className={`font-bold text-xs ${grade.color}`}>
                {grade.badge}
              </Badge>
            </CardTitle>
            <CardDescription>Real-time calculation based on 30 inspection points.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900">{score}</span>
              <span className="text-xl text-slate-400 font-semibold">/ 100</span>
            </div>
            <div className="text-sm font-semibold text-slate-700">{grade.label}</div>

            {/* Micro stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <div className="font-bold text-sm">{passCount}</div>
                <div>Passed</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                <div className="font-bold text-sm">{warnCount}</div>
                <div>Fair / Minor</div>
              </div>
              <div className="p-2 rounded-lg bg-red-50 text-red-700">
                <div className="font-bold text-sm">{failCount}</div>
                <div>Needs Repair</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inspector Details & Certification Notes */}
      <Card className="border-slate-200/80 shadow-sm print:border-slate-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Inspection Certification Sign-off
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Authorized Lead Inspector Name
            </label>
            <Input
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              placeholder="e.g. Lead Certified Technician"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Inspection Date & Timestamp
            </label>
            <Input
              readOnly
              value={new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              className="text-sm bg-slate-50 text-slate-600 cursor-default"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Official Findings & Customer Notes
            </label>
            <Textarea
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              rows={2}
              className="text-sm"
              placeholder="Enter notes regarding mechanical findings, wear, or recommendations..."
            />
          </div>
        </CardContent>
      </Card>

      {/* 30-Point Checklist Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.id} className="border-slate-200/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/70 py-3.5 border-b border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <CardTitle className="text-base font-bold text-slate-900">
                  {section.title}
                </CardTitle>
                <span className="text-xs text-slate-500 font-normal">
                  {section.description}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 px-6 gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.status === "PASS" && (
                      <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                    )}
                    {item.status === "ATTENTION" && (
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                    )}
                    {item.status === "FAIL" && (
                      <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                    )}
                    <span className="text-sm font-medium text-slate-800">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 print:hidden">
                    <button
                      type="button"
                      onClick={() => setItemStatus(section.id, item.id, "PASS")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                        item.status === "PASS"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemStatus(section.id, item.id, "ATTENTION")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                        item.status === "ATTENTION"
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                      }`}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Fair
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemStatus(section.id, item.id, "FAIL")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                        item.status === "FAIL"
                          ? "bg-red-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700"
                      }`}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Fail
                    </button>
                  </div>

                  {/* Print status badge */}
                  <div className="hidden print:block font-bold text-xs">
                    {item.status === "PASS" && <span className="text-emerald-700">[✓ PASS]</span>}
                    {item.status === "ATTENTION" && <span className="text-amber-700">[! FAIR]</span>}
                    {item.status === "FAIL" && <span className="text-red-700">[X FAIL]</span>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Official Print Footer (Shown only during print) */}
      <div className="hidden print:block pt-8 border-t-2 border-slate-900 mt-8">
        <div className="flex justify-between items-center text-xs text-slate-600">
          <div>
            <p className="font-bold text-slate-900">CarsAi Certified Pre-Owned Assurance</p>
            <p>Official Dealership Verification Document</p>
          </div>
          <div className="text-right">
            <p>Certified Inspector Signature: _______________________</p>
            <p className="text-slate-400 mt-1">Generated on {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

