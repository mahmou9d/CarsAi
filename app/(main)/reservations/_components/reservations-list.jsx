"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { TestDriveCard } from "@/components/test-drive-card";
import useFetch from "@/hooks/use-fetch";
import { cancelTestDrive } from "@/actions/test-drive";

export function ReservationsList({ initialData }) {
  const {
    loading: cancelling,
    fn: cancelBookingFn,
    error: cancelError,
  } = useFetch(cancelTestDrive);

  // Handle cancellation
  const handleCancelBooking = async (bookingId) => {
    await cancelBookingFn(bookingId);
  };

  const bookings = initialData?.data ?? [];

  // Group bookings by status
  const upcomingBookings = bookings.filter((booking) =>
    ["PENDING", "CONFIRMED"].includes(booking.status)
  );

  const pastBookings = bookings.filter((booking) =>
    ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status)
  );

  // No reservations
  if (bookings.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-red-100 rounded-lg bg-red-50">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <Calendar className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No reservations found</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          You don&apos;t have any test drive reservations yet. Browse our
          cars and book a test drive to get started.
        </p>
        <Button
          variant="default"
          className="bg-red-600 hover:bg-red-700"
          asChild
        >
          <Link href="/cars">Browse cars</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {cancelError && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          {cancelError?.message || "Failed to cancel the reservation. Please try again."}
        </div>
      )}

      {/* Upcoming Bookings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Upcoming test drives{" "}
          <span className="text-red-500">({upcomingBookings.length})</span>
        </h2>
        {upcomingBookings.length === 0 ? (
          <p className="text-gray-500 italic">No upcoming test drives.</p>
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

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Past test drives{" "}
            <span className="text-gray-400">({pastBookings.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastBookings.map((booking) => (
              <TestDriveCard
                key={booking.id}
                booking={booking}
                showActions={false}
                isPast
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}