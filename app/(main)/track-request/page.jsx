"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  Clock,
  Car,
  Wrench,
  ShieldAlert,
  ArrowRight,
  PhoneCall,
  Check,
  X,
  FileText,
  DollarSign,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/helpers";
import { getTradeInByCode, respondToTradeInOffer } from "@/actions/trade-in";
import { getServiceBookingByCode } from "@/actions/service-booking";

export default function TrackRequestPage() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";
  const initialPhone = searchParams.get("phone") || "";

  const [refNumber, setRefNumber] = useState(initialRef);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [tradeInData, setTradeInData] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!refNumber.trim()) {
      toast.error(
        "Please enter your reference code (e.g. APP-123456 or SRV-123456)",
      );
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setTradeInData(null);
    setServiceData(null);
    setSearched(true);

    const cleanRef = refNumber.trim().toUpperCase();

    // Check if Trade-In or Service based on prefix or attempt both
    if (cleanRef.startsWith("SRV")) {
      const res = await getServiceBookingByCode(cleanRef, phone);
      setLoading(false);
      if (res.success) {
        setServiceData(res.data);
      } else {
        setErrorMsg(res.error || "No booking found with this code");
      }
    } else {
      // Default to trade-in first, fallback to service if not found
      const res = await getTradeInByCode(cleanRef, phone);
      if (res.success) {
        setLoading(false);
        setTradeInData(res.data);
      } else {
        const srvRes = await getServiceBookingByCode(cleanRef, phone);
        setLoading(false);
        if (srvRes.success) {
          setServiceData(srvRes.data);
        } else {
          setErrorMsg(res.error || "No request found with this reference code");
        }
      }
    }
  };

  useEffect(() => {
    if (initialRef) {
      handleSearch();
    }
  }, [initialRef]);

  // Customer responds to offer
  const handleOfferResponse = (decision) => {
    if (!tradeInData?.id) return;
    startTransition(async () => {
      const res = await respondToTradeInOffer(tradeInData.id, decision);
      if (res.success) {
        setTradeInData(res.data);
        toast.success(
          decision === "ACCEPTED"
            ? "Offer accepted! Our sales manager will contact you for vehicle handover."
            : "Offer declined. Thank you for your feedback.",
        );
      } else {
        toast.error(res.error || "Failed to submit response");
      }
    });
  };

  return (
    <div className="px-4 pb-24 pt-24 md:px-6 min-h-screen bg-slate-50/50">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <header className="rounded-3xl bg-[#161213] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block rounded-full bg-[#E4141B] px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              Live Status Portal
            </span>
            <h1 className="font-montserrat text-3xl sm:text-5xl font-extrabold tracking-tight">
              Track Your <span className="text-[#E4141B]">Request</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/70">
              Check real-time updates for your Trade-In valuation, Certified
              vehicle care, and service bookings.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="mt-8 flex flex-col sm:flex-row gap-3 relative z-10"
          >
            <div className="flex-1">
              <Input
                placeholder="Reference Code (e.g. APP-123456 or SRV-123456)"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="h-13 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-mono text-sm uppercase px-4"
              />
            </div>
            <div className="sm:w-52">
              <Input
                placeholder="Phone (optional check)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-13 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm px-4"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-13 rounded-2xl bg-[#E4141B] hover:bg-[#c81219] text-white px-7 font-bold shrink-0"
            >
              {loading ? (
                "Searching..."
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" /> Track
                </>
              )}
            </Button>
          </form>
        </header>

        {/* Error notification */}
        {errorMsg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <div className="font-bold">Request not found</div>
              <div className="text-xs text-red-700">{errorMsg}</div>
            </div>
          </div>
        )}

        {/* ── Trade-In Request Tracking Result ── */}
        {tradeInData && (
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-md overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">
                      Sell or Trade Appraisal
                    </span>
                    <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 mt-0.5">
                      <Car className="h-5 w-5 text-[#E4141B]" />
                      {tradeInData.year} {tradeInData.make} {tradeInData.model}
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Code:{" "}
                      <strong className="font-mono text-white">
                        {tradeInData.referenceNumber}
                      </strong>{" "}
                      · Submitted:{" "}
                      {new Date(tradeInData.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>

                  <Badge
                    className={`text-xs px-3 py-1 font-bold ${
                      tradeInData.status === "OFFER_MADE"
                        ? "bg-amber-500 text-white animate-pulse"
                        : tradeInData.status === "ACCEPTED"
                          ? "bg-emerald-600 text-white"
                          : tradeInData.status === "IN_REVIEW"
                            ? "bg-blue-600 text-white"
                            : tradeInData.status === "REJECTED"
                              ? "bg-red-600 text-white"
                              : "bg-slate-700 text-white"
                    }`}
                  >
                    {tradeInData.status === "PENDING" &&
                      "قيد المراجعة (Pending)"}
                    {tradeInData.status === "IN_REVIEW" &&
                      "جاري التقييم الفني (Under Review)"}
                    {tradeInData.status === "OFFER_MADE" &&
                      "🔥 تم تقديم عرض مالي (Offer Ready)"}
                    {tradeInData.status === "ACCEPTED" &&
                      "تم قبول العرض (Offer Accepted)"}
                    {tradeInData.status === "REJECTED" &&
                      "مرفوض (Offer Rejected)"}
                    {tradeInData.status === "COMPLETED" &&
                      "تمت الصفقة (Completed)"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Visual Progress Stepper */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">
                    Appraisal Lifecycle Progress
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {[
                      { num: 1, label: "Submitted", done: true },
                      {
                        num: 2,
                        label: "Review & Inspection",
                        done: [
                          "IN_REVIEW",
                          "OFFER_MADE",
                          "ACCEPTED",
                          "COMPLETED",
                        ].includes(tradeInData.status),
                      },
                      {
                        num: 3,
                        label: "Official Offer",
                        done: ["OFFER_MADE", "ACCEPTED", "COMPLETED"].includes(
                          tradeInData.status,
                        ),
                      },
                      {
                        num: 4,
                        label: "Deal Finalized",
                        done: ["ACCEPTED", "COMPLETED"].includes(
                          tradeInData.status,
                        ),
                      },
                    ].map((step, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            step.done
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-400 border border-slate-200"
                          }`}
                        >
                          {step.done ? <Check className="h-4 w-4" /> : step.num}
                        </div>
                        <span
                          className={`text-[11px] font-medium leading-tight ${step.done ? "text-slate-900 font-bold" : "text-slate-400"}`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Offer Action Banner if Offer is ready */}
                {tradeInData.status === "OFFER_MADE" &&
                  tradeInData.finalOffer && (
                    <div className="rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white p-5 sm:p-6 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs uppercase font-bold text-emerald-800 tracking-wide">
                            Official Dealership Cash / Trade Offer
                          </span>
                          <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-0.5">
                            {formatCurrency(tradeInData.finalOffer)}
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            This certified offer is ready for immediate payout
                            or credit towards any showroom car.
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                          <Button
                            onClick={() => handleOfferResponse("ACCEPTED")}
                            disabled={isPending}
                            className="flex-1 sm:flex-none h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5"
                          >
                            <Check className="h-4 w-4 mr-1.5" />
                            Accept Offer (قبول العرض)
                          </Button>
                          <Button
                            onClick={() => handleOfferResponse("REJECTED")}
                            disabled={isPending}
                            variant="outline"
                            className="flex-1 sm:flex-none h-11 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs px-5"
                          >
                            <X className="h-4 w-4 mr-1.5" />
                            Decline (رفض)
                          </Button>
                        </div>
                      </div>

                      {tradeInData.adminNotes && (
                        <div className="pt-3 border-t border-emerald-100 text-xs text-slate-700">
                          <strong>Appraiser Message:</strong>{" "}
                          {tradeInData.adminNotes}
                        </div>
                      )}
                    </div>
                  )}

                {/* Offer Accepted confirmation */}
                {tradeInData.status === "ACCEPTED" && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-emerald-900 flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                    <div className="text-xs sm:text-sm">
                      <strong>Offer Accepted!</strong> Final valuation:{" "}
                      <strong>
                        {formatCurrency(
                          tradeInData.finalOffer || tradeInData.tradeInCredit,
                        )}
                      </strong>
                      . Our closing coordinator will call you to finalize
                      contracts and title transfer.
                    </div>
                  </div>
                )}

                {/* Vehicle specifications */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Mileage
                    </span>
                    <span className="font-bold text-slate-800">
                      {Number(tradeInData.mileage).toLocaleString()} km
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Condition
                    </span>
                    <span className="font-bold text-slate-800">
                      {tradeInData.condition}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Initial System Estimate
                    </span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(tradeInData.estimatedMarket || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Customer City
                    </span>
                    <span className="font-bold text-slate-800">
                      {tradeInData.city || "Cairo"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Service Booking Tracking Result ── */}
        {serviceData && (
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-md overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">
                      Certified Vehicle Care Appointment
                    </span>
                    <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 mt-0.5">
                      <Wrench className="h-5 w-5 text-[#E4141B]" />
                      {serviceData.serviceType}
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Code:{" "}
                      <strong className="font-mono text-white">
                        {serviceData.referenceNumber}
                      </strong>{" "}
                      · Vehicle: {serviceData.carMake}{" "}
                      {serviceData.carModel || ""}
                    </CardDescription>
                  </div>

                  <Badge
                    className={`text-xs px-3 py-1 font-bold ${
                      serviceData.status === "READY_FOR_PICKUP"
                        ? "bg-emerald-600 text-white animate-bounce"
                        : serviceData.status === "IN_PROGRESS"
                          ? "bg-amber-500 text-white"
                          : serviceData.status === "CONFIRMED"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-700 text-white"
                    }`}
                  >
                    {serviceData.status === "PENDING" &&
                      "في انتظار التأكيد (Pending)"}
                    {serviceData.status === "CONFIRMED" &&
                      "موعد مؤكد (Confirmed)"}
                    {serviceData.status === "IN_PROGRESS" &&
                      "قيد الصيانة بالورشة (In Progress)"}
                    {serviceData.status === "READY_FOR_PICKUP" &&
                      "🎉 جاهزة للاستلام (Ready for Pickup)"}
                    {serviceData.status === "COMPLETED" &&
                      "تم الاستلام (Completed)"}
                    {serviceData.status === "CANCELLED" && "ملغي (Cancelled)"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Visual Progress Stepper */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">
                    Workshop Care Lifecycle
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {[
                      { num: 1, label: "Requested", done: true },
                      {
                        num: 2,
                        label: "Slot Confirmed",
                        done: [
                          "CONFIRMED",
                          "IN_PROGRESS",
                          "READY_FOR_PICKUP",
                          "COMPLETED",
                        ].includes(serviceData.status),
                      },
                      {
                        num: 3,
                        label: "In Workshop",
                        done: [
                          "IN_PROGRESS",
                          "READY_FOR_PICKUP",
                          "COMPLETED",
                        ].includes(serviceData.status),
                      },
                      {
                        num: 4,
                        label: "Ready / Done",
                        done: ["READY_FOR_PICKUP", "COMPLETED"].includes(
                          serviceData.status,
                        ),
                      },
                    ].map((step, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            step.done
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-400 border border-slate-200"
                          }`}
                        >
                          {step.done ? <Check className="h-4 w-4" /> : step.num}
                        </div>
                        <span
                          className={`text-[11px] font-medium leading-tight ${step.done ? "text-slate-900 font-bold" : "text-slate-400"}`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ready for pickup alert banner */}
                {serviceData.status === "READY_FOR_PICKUP" && (
                  <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-500 p-5 text-emerald-950 flex items-center gap-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-base">
                        Your vehicle is ready for pickup!
                      </div>
                      <div className="text-xs text-emerald-800 mt-0.5">
                        All service items and multi-point checks have been
                        completed. Please visit our service reception counter.
                      </div>
                    </div>
                  </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Scheduled Date
                    </span>
                    <span className="font-bold text-slate-800">
                      {serviceData.preferredDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Assigned Technician
                    </span>
                    <span className="font-bold text-slate-800">
                      {serviceData.technicianName || "Master Technician"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Package
                    </span>
                    <span className="font-bold text-slate-800">
                      {serviceData.servicePackage || "Standard"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Cost Estimate
                    </span>
                    <span className="font-bold text-emerald-700">
                      {serviceData.finalCost
                        ? formatCurrency(serviceData.finalCost)
                        : serviceData.estimatedCost
                          ? formatCurrency(serviceData.estimatedCost)
                          : "Pending Inspection"}
                    </span>
                  </div>
                </div>

                {serviceData.adminNotes && (
                  <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900">
                    <strong>Workshop Notes:</strong> {serviceData.adminNotes}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
