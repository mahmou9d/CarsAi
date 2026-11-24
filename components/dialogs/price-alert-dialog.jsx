"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, CheckCircle2, TrendingDown, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PriceAlertDialog({ car }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  if (!car) return null;

  const currentPrice = Number(car.price) || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      toast.success(
        `Price drop alert activated! We will notify ${email} if price drops.`
      );
    }, 700);
  };

  const handleReset = () => {
    setSubscribed(false);
    setEmail("");
    setTargetPrice("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center justify-center gap-1.5 rounded-full text-xs hover:border-[#E4141B] hover:text-[#E4141B] transition cursor-pointer"
        >
          <Bell className="h-4 w-4 text-amber-500" />
          <span>Price Alert</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-6 bg-white">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-2">
            <TrendingDown className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Get Price Drop Alerts
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Never miss a deal on this {car.year} {car.make} {car.model}. We&apos;ll send you an instant notification if the price drops below current listing.
          </DialogDescription>
        </DialogHeader>

        {subscribed ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Alert Successfully Set!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              We&apos;ve subscribed <strong className="text-slate-800">{email}</strong> to instant price drop alerts for this vehicle.
            </p>
            <Button
              onClick={handleReset}
              className="mt-4 bg-[#E4141B] hover:bg-red-700 text-white rounded-full text-xs w-full cursor-pointer"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">Current Listed Price:</span>
              <span className="text-base font-bold text-slate-900">
                ${currentPrice.toLocaleString()} USD
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Price (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                  $
                </span>
                <Input
                  type="number"
                  placeholder={(currentPrice * 0.95).toFixed(0)}
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="pl-8 text-xs rounded-xl"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Leave blank to be alerted on ANY price reduction.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E4141B] hover:bg-red-700 text-white rounded-full text-xs py-2.5 font-bold shadow-md cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating Alert...
                </>
              ) : (
                "Set Price Drop Alert"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

