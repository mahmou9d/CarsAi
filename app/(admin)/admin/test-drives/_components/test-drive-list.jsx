// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  CalendarRange,
  AlertCircle,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Sparkles,
  Phone,
  MessageCircle,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { TestDriveCard } from "@/components/cars/test-drive-card";
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

const DATE_OPTIONS = [
  { value: "ALL", label: "All Dates" },
  { value: "TODAY", label: "Today's Drives" },
  { value: "UPCOMING", label: "Upcoming (Future)" },
  { value: "PAST", label: "Past Dates" },
];

export const TestDrivesList = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

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

  // Export Test Drives CSV
  const handleExportCSV = () => {
    const list = filteredBookings || [];
    if (list.length === 0) {
      toast.error("No test drives to export");
      return;
    }

    const headers = [
      "Booking ID",
      "Car",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Booking Date",
      "Time Slot",
      "Status",
      "Notes",
    ];

    const rows = list.map((b) => [
      `"${b.id}"`,
      `"${b.car ? `${b.car.year} ${b.car.make} ${b.car.model}` : "Car"}"`,
      `"${b.user?.name || "Customer"}"`,
      `"${b.user?.email || ""}"`,
      `"${b.user?.phone || ""}"`,
      `"${new Date(b.bookingDate).toLocaleDateString()}"`,
      `"${b.startTime || ""}"`,
      `"${b.status || ""}"`,
      `"${(b.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `test_drives_schedule_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${list.length} test drives to CSV`);
  };

  const bookings = testDrivesData?.data || [];
  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter by date client-side
  const filteredBookings = bookings.filter((b) => {
    const bDate = new Date(b.bookingDate).toISOString().slice(0, 10);
    if (dateFilter === "TODAY") return bDate === todayStr;
    if (dateFilter === "UPCOMING") return bDate >= todayStr;
    if (dateFilter === "PAST") return bDate < todayStr;
    return true;
  });

  const todayBookings = bookings.filter((b) => {
    const bDate = new Date(b.bookingDate).toISOString().slice(0, 10);
    return bDate === todayStr;
  });

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;

  return (
    <div className="space-y-5">
      {/* ── Today's Scheduled Appointments Alert Banner ── */}
      {todayBookings.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-200 text-amber-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>{todayBookings.length} Test Drives Scheduled for TODAY!</span>
                <Badge className="bg-amber-600 text-white border-0 text-[10px]">
                  Today
                </Badge>
              </div>
              <p className="text-xs text-amber-800/80 mt-0.5">
                Staff should prepare vehicles and verify fuel/charge levels prior to appointment times.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setDateFilter("TODAY")}
            className="rounded-full text-xs bg-amber-600 hover:bg-amber-700 text-white shrink-0"
          >
            Filter Today's Schedule
          </Button>
        </div>
      )}

      {/* ── Quick Summary Pill Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">All Bookings</div>
            <div className="text-xl font-bold text-slate-900">{bookings.length}</div>
          </div>
          <CalendarRange className="h-5 w-5 text-slate-400" />
        </div>
        <div className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-600 font-medium">Pending Confirmation</div>
            <div className="text-xl font-bold text-amber-700">{pendingCount}</div>
          </div>
          <Clock className="h-5 w-5 text-amber-500" />
        </div>
        <div className="bg-white p-3 rounded-xl border border-blue-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-600 font-medium">Confirmed</div>
            <div className="text-xl font-bold text-blue-700">{confirmedCount}</div>
          </div>
          <CheckCircle className="h-5 w-5 text-blue-500" />
        </div>
        <div className="bg-white p-3 rounded-xl border border-emerald-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-600 font-medium">Completed</div>
            <div className="text-xl font-bold text-emerald-700">{completedCount}</div>
          </div>
          <CheckCircle className="h-5 w-5 text-emerald-500" />
        </div>
      </div>

      {/* ── Filters, Actions and Search ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white border border-slate-200 shadow-sm rounded-xl p-3">
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full sm:w-auto flex-1">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 border-slate-200">
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

          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-40 border-slate-200">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
              <SelectValue placeholder="All Dates" />
            </SelectTrigger>
            <SelectContent>
              {DATE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search by vehicle or client..."
                className="pl-9 w-full border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>
        </div>

        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={!filteredBookings.length}
          className="border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4 mr-1.5 text-slate-500" />
          Export Schedule
        </Button>
      </div>

      {/* ── Test Drives List ── */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-slate-900 text-lg">
            <div className="p-1.5 rounded-lg bg-red-50">
              <CalendarRange className="h-5 w-5 text-[#E4141B]" />
            </div>
            Test Drive Appointments ({filteredBookings.length})
          </CardTitle>
          <CardDescription>
            Manage and update client test drive reservations in real-time
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {fetchingTestDrives && !testDrivesData ? (
            <div className="flex justify-center items-center py-16">
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
          ) : !filteredBookings.length ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <CalendarRange className="h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                No test drives found
              </h3>
              <p className="text-sm text-slate-500">
                {search || statusFilter !== "ALL" || dateFilter !== "ALL"
                  ? "No bookings match your current search or date filter."
                  : "There are currently no test drive bookings in the system."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <TestDriveCard
                  key={booking.id}
                  booking={booking}
                  onUpdateStatus={handleUpdateStatus}
                  onCancel={handleCancel}
                  isAdmin={true}
                  isUpdating={updatingStatus || cancelling}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
