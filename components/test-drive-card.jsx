// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  Car,
  Clock,
  User,
  Loader2,
  ArrowRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Helper function to format time
const formatTime = (timeString) => {
  try {
    return format(parseISO(`2025-01-01T${timeString}`), "h:mm a");
  } catch (error) {
    return timeString;
  }
};

// Helper function for status badge
const getStatusBadge = (status) => {
  switch (status) {
    case "PENDING":
      return (
        <Badge className="rounded-full bg-amber-100 text-amber-800 hover:bg-amber-100">
          Pending
        </Badge>
      );
    case "CONFIRMED":
      return (
        <Badge className="rounded-full bg-green-100 text-green-800 hover:bg-green-100">
          Confirmed
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge className="rounded-full bg-sky-100 text-sky-800 hover:bg-sky-100">
          Completed
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
          Cancelled
        </Badge>
      );
    case "NO_SHOW":
      return (
        <Badge className="rounded-full bg-purple-100 text-purple-800 hover:bg-purple-100">
          No Show
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="rounded-full">
          {status}
        </Badge>
      );
  }
};

export function TestDriveCard({
  booking,
  onCancel,
  showActions = true,
  isPast = false,
  isAdmin = false,
  isCancelling = false,
  renderStatusSelector = () => null,
}) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleCancel = async () => {
    if (!onCancel) return;

    await onCancel(booking.id);
    setCancelDialogOpen(false);
  };

  return (
    <>
      <Card
        className={`overflow-hidden border-0 rounded-2xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_35px_-15px_rgba(0,0,0,0.25)] transition-shadow ${
          isPast ? "opacity-80 hover:opacity-100 transition-opacity" : ""
        }`}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Car Image - Left */}
          <div className="sm:w-1/4 relative h-40 sm:h-auto bg-slate-100">
            {booking.car.images && booking.car.images.length > 0 ? (
              <div className="relative w-full h-full">
                <Image
                  src={booking.car.images[0]}
                  alt={`${booking.car.make} ${booking.car.model}`}
                  fill
                  className="object-scale-down"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <Car className="h-12 w-12 text-slate-300" />
              </div>
            )}
            <div className="absolute top-2 right-2 sm:hidden">
              {getStatusBadge(booking.status)}
            </div>
          </div>

          {/* Booking Details - Middle */}
          <div className="p-4 sm:w-1/2 sm:flex-1">
            <div className="hidden sm:block mb-2">
              {getStatusBadge(booking.status)}
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {booking.car.year} {booking.car.make} {booking.car.model}{" "}
            </h3>
            {renderStatusSelector()}

            <div className="space-y-2 my-2">
              <div className="flex items-center text-slate-600 text-sm">
                <Calendar className="h-4 w-4 mr-2 text-[#E4141B]" />
                {format(new Date(booking.bookingDate), "EEEE, MMMM d, yyyy")}
              </div>
              <div className="flex items-center text-slate-600 text-sm">
                <Clock className="h-4 w-4 mr-2 text-[#E4141B]" />
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </div>

              {isAdmin && booking.user && (
                <div className="flex items-center text-slate-600 text-sm">
                  <User className="h-4 w-4 mr-2 text-[#E4141B]" />
                  {booking.user.name || booking.user.email}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Right */}
          {showActions && (
            <div className="p-4 border-t sm:border-t-0 sm:border-l border-slate-100 sm:w-1/4 sm:flex sm:flex-col sm:justify-center sm:items-center sm:space-y-2">
              {booking.notes && (
                <div className="bg-[#F7F7F7] p-2 rounded-xl text-sm w-full">
                  <p className="font-medium text-slate-700">Notes:</p>
                  <p className="text-slate-500">{booking.notes}</p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full my-2 sm:mb-0 rounded-full border-slate-200"
                asChild
              >
                <Link
                  href={`/cars/${booking.carId}`}
                  className="flex items-center justify-center"
                >
                  View Car
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {(booking.status === "PENDING" ||
                booking.status === "CONFIRMED") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full border-slate-300 text-slate-700 hover:bg-slate-100"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1.5" />
                      Cancel
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Cancel Confirmation Dialog */}
      {onCancel && (
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Cancel Test Drive</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your test drive for the{" "}
                {booking.car.year} {booking.car.make} {booking.car.model}? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="space-y-2 text-sm bg-[#F7F7F7] rounded-xl p-3">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-700">Date:</span>
                  <span className="text-slate-600">
                    {format(
                      new Date(booking.bookingDate),
                      "EEEE, MMMM d, yyyy",
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-700">Time:</span>
                  <span className="text-slate-600">
                    {formatTime(booking.startTime)} -{" "}
                    {formatTime(booking.endTime)}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
                disabled={isCancelling}
                className="rounded-full border-slate-200"
              >
                Keep Reservation
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isCancelling}
                className="rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Reservation"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
