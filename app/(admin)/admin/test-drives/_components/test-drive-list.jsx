// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Loader2, CalendarRange, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TestDriveCard } from "@/components/test-drive-card";
import useFetch from "@/hooks/use-fetch";
import { getAdminTestDrives, updateTestDriveStatus } from "@/actions/admin";
import { cancelTestDrive } from "@/actions/test-drive";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No Show" },
];

export const TestDrivesList = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const {
    loading: fetchingTestDrives,
    fn: fetchTestDrives,
    data: testDrivesData,
    error: testDrivesError,
  } = useFetch(getAdminTestDrives);

  const {
    loading: updatingStatus,
    fn: updateStatusFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateTestDriveStatus);

  const {
    loading: cancelling,
    fn: cancelTestDriveFn,
    data: cancelResult,
    error: cancelError,
  } = useFetch(cancelTestDrive);

  useEffect(() => {
    fetchTestDrives({
      search,
      status: statusFilter === "ALL" ? "" : statusFilter,
    });
  }, [search, statusFilter]);

  useEffect(() => {
    if (testDrivesError) toast.error("Failed to load test drives");
    if (updateError) toast.error("Failed to update test drive status");
    if (cancelError) toast.error("Failed to cancel test drive");
  }, [testDrivesError, updateError, cancelError]);

  useEffect(() => {
    if (updateResult?.success) {
      toast.success("Test drive status updated successfully");
      fetchTestDrives({
        search,
        status: statusFilter === "ALL" ? "" : statusFilter,
      });
    }
    if (cancelResult?.success) {
      toast.success("Test drive cancelled successfully");
      fetchTestDrives({
        search,
        status: statusFilter === "ALL" ? "" : statusFilter,
      });
    }
  }, [updateResult, cancelResult]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTestDrives({
      search,
      status: statusFilter === "ALL" ? "" : statusFilter,
    });
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (newStatus) await updateStatusFn(bookingId, newStatus);
  };

  const handleCancel = async (bookingId) => {
    await cancelTestDriveFn(bookingId);
  };

  return (
    <div className="space-y-5">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white border-0 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 rounded-full border-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <form onSubmit={handleSearchSubmit} className="flex w-full">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search by car or customer..."
                className="pl-9 w-full rounded-full border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="ml-2 rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white"
            >
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Test Drives List */}
      <Card className="border-0 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] rounded-2xl">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <div className="p-1.5 rounded-full bg-red-50">
              <CalendarRange className="h-5 w-5 text-[#E4141B]" />
            </div>
            Test Drive Bookings
          </CardTitle>
          <CardDescription>
            Manage all test drive reservations and update their status
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {fetchingTestDrives && !testDrivesData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#E4141B]" />
            </div>
          ) : testDrivesError ? (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Error</p>
                <p className="text-sm text-amber-700">
                  Failed to load test drives. Please try again.
                </p>
              </div>
            </div>
          ) : testDrivesData?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <CalendarRange className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                No test drives found
              </h3>
              <p className="text-slate-500 mb-4">
                {statusFilter !== "ALL" || search
                  ? "No test drives match your search criteria"
                  : "There are no test drive bookings yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {testDrivesData?.data?.map((booking) => (
                <div key={booking.id} className="relative">
                  <TestDriveCard
                    booking={booking}
                    onCancel={handleCancel}
                    showActions={["PENDING", "CONFIRMED"].includes(
                      booking.status,
                    )}
                    isAdmin={true}
                    isCancelling={cancelling}
                    cancelError={cancelError}
                    renderStatusSelector={() => (
                      <Select
                        value={booking.status}
                        onValueChange={(value) =>
                          handleUpdateStatus(booking.id, value)
                        }
                        disabled={updatingStatus}
                      >
                        <SelectTrigger className="w-full h-8 rounded-full border-slate-200">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          <SelectItem value="NO_SHOW">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
