"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Clock,
  CheckCircle2,
  Car,
  Truck,
  Building2,
  Sparkles,
  QrCode,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/helpers";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-auth";

const HOLDING_DEPOSIT_USD = 500;

export function ReserveCarDialog({ car, triggerButton }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [fulfillment, setFulfillment] = useState("DEALERSHIP");
  const [reservationCode, setReservationCode] = useState("");

  const [contact, setContact] = useState({
    name: user?.fullName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    phone: "",
    address: "",
  });

  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    if (!contact.name.trim() || !contact.email.trim() || !contact.phone.trim()) {
      toast.error("Please fill in your contact information");
      return;
    }

    setLoading(true);
    // Simulate real reservation processing
    await new Promise((r) => setTimeout(r, 1000));

    const code = `RSV-${Date.now().toString().slice(-6)}`;
    setReservationCode(code);
    setLoading(false);
    setStep(2);
    toast.success("Vehicle reservation confirmed! 48-hour hold is active.");
  };

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => setStep(1), 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="w-full py-6 text-base font-bold rounded-full bg-slate-900 hover:bg-slate-800 text-white gap-2 shadow-md">
            <Lock className="h-4 w-4 text-amber-400" />
            <span>Hold Vehicle ($500 Deposit)</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        {step === 1 ? (
          <form onSubmit={handleConfirmReservation}>
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-2 text-slate-800 mb-1">
                <span className="p-1.5 bg-red-50 text-[#E4141B] rounded-lg">
                  <Lock className="h-4 w-4" />
                </span>
                <DialogTitle className="text-xl">
                  Reserve & Hold This Vehicle
                </DialogTitle>
              </div>
              <DialogDescription>
                Place a 100% refundable $500 deposit to hold this car for 48 hours exclusively. No other customer can book or buy it.
              </DialogDescription>
            </DialogHeader>

            {/* Vehicle Mini Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3.5 mb-5">
              <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                {car?.images?.[0] ? (
                  <Image
                    src={car.images[0]}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Car className="h-6 w-6 text-slate-400 m-auto" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-900 truncate">
                  {car?.year} {car?.make} {car?.model}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-[#E4141B]">
                    {formatCurrency(car?.price)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    • {car?.mileage?.toLocaleString()} mi
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-muted-foreground block">
                  Holding Deposit
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(HOLDING_DEPOSIT_USD)}
                </span>
              </div>
            </div>

            {/* Delivery / Handover Preference */}
            <div className="space-y-3 mb-5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Handover Preference
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setFulfillment("DEALERSHIP")}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                    fulfillment === "DEALERSHIP"
                      ? "border-[#E4141B] bg-red-50/30"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-[#E4141B]" />
                    <span className="text-xs font-bold text-slate-900">
                      Showroom Pickup
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block">
                    Cairo Dealership • Free
                  </span>
                </div>

                <div
                  onClick={() => setFulfillment("HOME_DELIVERY")}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                    fulfillment === "HOME_DELIVERY"
                      ? "border-[#E4141B] bg-red-50/30"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="h-4 w-4 text-[#E4141B]" />
                    <span className="text-xs font-bold text-slate-900">
                      Home Delivery
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block">
                    Direct to your doorstep
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3 mb-5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Buyer Contact Details
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-xs text-slate-600">Full Name *</span>
                  <Input
                    required
                    value={contact.name}
                    onChange={(e) =>
                      setContact((c) => ({ ...c, name: e.target.value }))
                    }
                    placeholder="Ahmed Hassan"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-600">Email Address *</span>
                  <Input
                    required
                    type="email"
                    value={contact.email}
                    onChange={(e) =>
                      setContact((c) => ({ ...c, email: e.target.value }))
                    }
                    placeholder="ahmed@example.com"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-600">Phone Number *</span>
                <Input
                  required
                  type="tel"
                  value={contact.phone}
                  onChange={(e) =>
                    setContact((c) => ({ ...c, phone: e.target.value }))
                  }
                  placeholder="+20 100 123 4567"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 mb-6">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Deposit Payment Method
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "CARD", label: "Credit Card", icon: CreditCard },
                  { id: "INSTAPAY", label: "Instapay", icon: QrCode },
                  { id: "FAWRY", label: "Fawry", icon: Building2 },
                  { id: "WIRE", label: "Bank Transfer", icon: DollarSign },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id)}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        paymentMethod === item.id
                          ? "border-[#E4141B] bg-red-50/50 text-[#E4141B] font-bold"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-xs block">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guarantee Callout */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 mb-6">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>100% Risk-Free Guarantee:</strong> If you change your mind for any reason before or after your test drive, your deposit is immediately refunded to your original payment method.
              </span>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full text-xs"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white text-xs font-bold gap-2 px-6"
              >
                {loading ? (
                  <span>Processing Deposit...</span>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>Confirm Hold & Pay {formatCurrency(HOLDING_DEPOSIT_USD)}</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* Confirmation Screen */
          <div className="py-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Vehicle Reserved Successfully!
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Your 48-hour exclusive hold is now active.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Reservation Reference</span>
                <span className="font-mono font-bold text-[#E4141B] text-sm">
                  {reservationCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reserved For</span>
                <span className="font-semibold text-slate-800">{contact.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hold Duration</span>
                <span className="font-semibold text-emerald-700">48 Hours (Guaranteed)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deposit Paid</span>
                <span className="font-semibold text-slate-800">{formatCurrency(HOLDING_DEPOSIT_USD)} (Refundable)</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Our showroom team will call you within 1 business hour to schedule your final paperwork and vehicle handover.
            </p>

            <Button
              className="rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white px-8"
              onClick={() => handleOpenChange(false)}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

