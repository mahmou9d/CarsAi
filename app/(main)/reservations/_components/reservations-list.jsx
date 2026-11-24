"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Calendar,
  Car,
  Wrench,
  Check,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { TestDriveCard } from "@/components/cars/test-drive-card";
import useFetch from "@/hooks/use-fetch";
import { cancelTestDrive } from "@/actions/test-drive";
import { respondToTradeInOffer } from "@/actions/trade-in";
import { formatCurrency } from "@/lib/helpers";
import { toast } from "sonner";

export function ReservationsList({
  initialData,
  tradeInsData = [],
  servicesData = [],
  defaultTab = "test-drives",
}) {
  const [tab, setTab] = useState(defaultTab);
  const [tradeIns, setTradeIns] = useState(tradeInsData);
  const [isResponding, startTransition] = useTransition();

  // Test drive cancellation
  const {
    loading: cancelling,
    fn: cancelBookingFn,
    error: cancelError,
  } = useFetch(cancelTestDrive);

  const handleCancelBooking = async (bookingId) => {
    await cancelBookingFn(bookingId);
  };

  const handleTradeInResponse = (id, decision) => {
    startTransition(async () => {
      const res = await respondToTradeInOffer(id, decision);
      if (res.success) {
        setTradeIns((prev) =>
          prev.map((item) => (item.id === id ? res.data : item)),
        );
        toast.success(
          decision === "ACCEPTED"
            ? "Offer accepted! Our representative will call you for handover."
            : "Offer declined.",
        );
      } else {
        toast.error(res.error || "Failed to submit response");
      }
    });
  };

  const bookings = initialData?.data ?? [];
  const upcomingBookings = bookings.filter((b) =>
    ["PENDING", "CONFIRMED"].includes(b.status),
  );
  const pastBookings = bookings.filter((b) =>
    ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(b.status),
  );

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-2xl h-auto flex-wrap gap-1">
          <TabsTrigger
            value="test-drives"
            className="rounded-xl text-xs sm:text-sm font-semibold py-2.5 px-4 gap-2"
          >
            <Calendar className="h-4 w-4 text-[#E4141B]" />
            Test Drives ({bookings.length})
          </TabsTrigger>

          <TabsTrigger
            value="trade-ins"
            className="rounded-xl text-xs sm:text-sm font-semibold py-2.5 px-4 gap-2"
          >
            <Car className="h-4 w-4 text-emerald-600" />
            Sell & Trade-In ({tradeIns.length})
            {tradeIns.some((t) => t.status === "OFFER_MADE") && (
              <span className="inline-flex size-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </TabsTrigger>

          <TabsTrigger
            value="services"
            className="rounded-xl text-xs sm:text-sm font-semibold py-2.5 px-4 gap-2"
          >
            <Wrench className="h-4 w-4 text-blue-600" />
            Certified Vehicle Care ({servicesData.length})
          </TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════════════
            TAB 1: TEST DRIVES
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="test-drives" className="space-y-8 pt-4">
          {cancelError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {cancelError?.message || "Failed to cancel reservation."}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="min-h-[350px] flex flex-col items-center justify-center text-center p-8 border border-slate-200 rounded-3xl bg-white">
              <div className="bg-red-50 p-4 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-[#E4141B]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No test drive bookings yet</h3>
              <p className="text-slate-500 mb-6 max-w-sm text-sm">
                Explore our showroom and schedule an on-road test drive.
              </p>
              <Button asChild className="rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white">
                <Link href="/cars">Browse Available Cars</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Upcoming */}
              <div>
                <h2 className="text-xl font-bold mb-3 text-slate-900">
                  Upcoming Test Drives{" "}
                  <span className="text-[#E4141B]">({upcomingBookings.length})</span>
                </h2>
                {upcomingBookings.length === 0 ? (
                  <p className="text-sm text-slate-400">No upcoming test drives scheduled.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingBookings.map((booking) => (
                      <TestDriveCard
                        key={booking.id}
                        booking={booking}
                        onCancel={handleCancelBooking}
                        isCancelling={cancelling}
                        showActions
                        cancelError={cancelError}
                        viewMode="list"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Past */}
              {pastBookings.length > 0 && (
                <div className="pt-4">
                  <h2 className="text-xl font-bold mb-3 text-slate-900">
                    Past Test Drives{" "}
                    <span className="text-slate-400">({pastBookings.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pastBookings.map((booking) => (
                      <TestDriveCard
                        key={booking.id}
                        booking={booking}
                        showActions={false}
                        viewMode="grid"
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════
            TAB 2: SELL & TRADE-IN REQUESTS
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="trade-ins" className="space-y-4 pt-4">
          {tradeIns.length === 0 ? (
            <div className="min-h-[350px] flex flex-col items-center justify-center text-center p-8 border border-slate-200 rounded-3xl bg-white">
              <div className="bg-emerald-50 p-4 rounded-full mb-4">
                <Car className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No trade-in appraisals submitted</h3>
              <p className="text-slate-500 mb-6 max-w-sm text-sm">
                Get an instant valuation on your vehicle and trade it for cash or credit towards a new car.
              </p>
              <Button asChild className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link href="/sell-or-trade">Value My Car Now</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tradeIns.map((item) => (
                <Card key={item.id} className="border-slate-200 shadow-sm overflow-hidden">
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">
                            {item.referenceNumber}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(item.referenceNumber);
                              toast.success("Code copied!");
                            }}
                            className="h-6 w-6 p-0 text-slate-400"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs text-slate-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">
                          {item.year} {item.make} {item.model}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {Number(item.mileage).toLocaleString()} km · Condition: {item.condition}
                        </p>
                      </div>

                      <Badge
                        className={`text-xs px-3 py-1 font-bold ${
                          item.status === "OFFER_MADE"
                            ? "bg-amber-500 text-white animate-pulse"
                            : item.status === "ACCEPTED"
                              ? "bg-emerald-600 text-white"
                              : item.status === "IN_REVIEW"
                                ? "bg-blue-600 text-white"
                                : item.status === "REJECTED"
                                  ? "bg-red-600 text-white"
                                  : "bg-slate-700 text-white"
                        }`}
                      >
                        {item.status === "PENDING" && "قيد المراجعة (Pending)"}
                        {item.status === "IN_REVIEW" && "جاري التقييم (Under Review)"}
                        {item.status === "OFFER_MADE" && "🔥 تم تقديم عرض سعر"}
                        {item.status === "ACCEPTED" && "تم قبول العرض (Accepted)"}
                        {item.status === "REJECTED" && "مرفوض (Declined)"}
                        {item.status === "COMPLETED" && "تمت الصفقة (Completed)"}
                      </Badge>
                    </div>

                    {/* Offer Presentation if Ready */}
                    {item.status === "OFFER_MADE" && item.finalOffer && (
                      <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold text-emerald-800 uppercase">
                            Official Dealership Cash Offer
                          </span>
                          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-0.5">
                            {formatCurrency(item.finalOffer)}
                          </div>
                          {item.adminNotes && (
                            <p className="text-xs text-slate-600 mt-1">
                              <strong>Note:</strong> {item.adminNotes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            onClick={() => handleTradeInResponse(item.id, "ACCEPTED")}
                            disabled={isResponding}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex-1 sm:flex-none"
                          >
                            <Check className="h-4 w-4 mr-1" /> Accept Offer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTradeInResponse(item.id, "REJECTED")}
                            disabled={isResponding}
                            className="border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl flex-1 sm:flex-none"
                          >
                            <X className="h-4 w-4 mr-1" /> Decline
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Link to public tracking details */}
                    <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>Est. Market: {formatCurrency(item.estimatedMarket || 0)}</span>
                      <Link
                        href={`/track-request?ref=${item.referenceNumber}`}
                        className="text-[#E4141B] font-semibold hover:underline flex items-center gap-1"
                      >
                        Live Tracking View <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════
            TAB 3: CERTIFIED VEHICLE CARE
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="services" className="space-y-4 pt-4">
          {servicesData.length === 0 ? (
            <div className="min-h-[350px] flex flex-col items-center justify-center text-center p-8 border border-slate-200 rounded-3xl bg-white">
              <div className="bg-blue-50 p-4 rounded-full mb-4">
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No service appointments</h3>
              <p className="text-slate-500 mb-6 max-w-sm text-sm">
                Schedule certified vehicle maintenance, oil service, or 150-point inspection.
              </p>
              <Button asChild className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/services">Book Service Care</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {servicesData.map((item) => (
                <Card key={item.id} className="border-slate-200 shadow-sm overflow-hidden">
                  <CardContent className="p-5 sm:p-6 space-y-3.5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">
                            {item.referenceNumber}
                          </span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs text-slate-500">
                            Preferred Date: <strong>{item.preferredDate}</strong> ({item.preferredTime || "Morning"})
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">
                          {item.serviceType}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Vehicle: <strong>{item.carMake} {item.carModel || ""}</strong> · Package: {item.servicePackage || "Standard"}
                        </p>
                      </div>

                      <Badge
                        className={`text-xs px-3 py-1 font-bold ${
                          item.status === "READY_FOR_PICKUP"
                            ? "bg-emerald-600 text-white animate-bounce"
                            : item.status === "IN_PROGRESS"
                              ? "bg-amber-500 text-white"
                              : item.status === "CONFIRMED"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-700 text-white"
                        }`}
                      >
                        {item.status === "PENDING" && "في انتظار التأكيد (Pending)"}
                        {item.status === "CONFIRMED" && "موعد مؤكد (Confirmed)"}
                        {item.status === "IN_PROGRESS" && "قيد الصيانة بالورشة"}
                        {item.status === "READY_FOR_PICKUP" && "🎉 جاهزة للاستلام"}
                        {item.status === "COMPLETED" && "تم الاستلام (Completed)"}
                        {item.status === "CANCELLED" && "ملغي (Cancelled)"}
                      </Badge>
                    </div>

                    {item.status === "READY_FOR_PICKUP" && (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-950 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span><strong>السيارة جاهزة للاستلام بالمعرض!</strong> يمكنك التوجه الآن لمركز الصيانة واستلام سيارتك.</span>
                      </div>
                    )}

                    {item.adminNotes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <strong>ملاحظات الورشة:</strong> {item.adminNotes}
                      </p>
                    )}

                    <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>Technician: {item.technicianName || "Master Tech"}</span>
                      <Link
                        href={`/track-request?ref=${item.referenceNumber}`}
                        className="text-[#E4141B] font-semibold hover:underline flex items-center gap-1"
                      >
                        Track Live <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
