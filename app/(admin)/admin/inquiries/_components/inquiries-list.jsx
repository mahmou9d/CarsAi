"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Car,
  FileText,
  ExternalLink,
  Loader2,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/helpers";
import { format } from "date-fns";
import { getAdminInquiries, updateInquiryStatus, deleteInquiry } from "@/actions/admin";
import useFetch from "@/hooks/use-fetch";

const STATUS_FILTERS = [
  { value: "ALL", label: "All Statuses" },
  { value: "NEW", label: "New Leads" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

export function InquiriesList({ initialData }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [inquiries, setInquiries] = useState(initialData?.data || []);

  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);

  const {
    loading: fetching,
    fn: fetchInquiriesFn,
    data: fetchedData,
  } = useFetch(getAdminInquiries);

  const {
    loading: updating,
    fn: updateStatusFn,
    data: updateResult,
  } = useFetch(updateInquiryStatus);

  const {
    loading: deleting,
    fn: deleteInquiryFn,
    data: deleteResult,
  } = useFetch(deleteInquiry);

  useEffect(() => {
    fetchInquiriesFn({
      search,
      status: statusFilter === "ALL" ? "" : statusFilter,
    });
  }, [search, statusFilter]);

  useEffect(() => {
    if (fetchedData?.success) {
      setInquiries(fetchedData.data);
    }
  }, [fetchedData]);

  useEffect(() => {
    if (updateResult?.success) {
      toast.success("Inquiry updated successfully");
      fetchInquiriesFn({ search, status: statusFilter === "ALL" ? "" : statusFilter });
      setNotesDialogOpen(false);
    }
    if (deleteResult?.success) {
      toast.success("Inquiry deleted successfully");
      fetchInquiriesFn({ search, status: statusFilter === "ALL" ? "" : statusFilter });
      setDeleteDialogOpen(false);
    }
  }, [updateResult, deleteResult]);

  const handleStatusChange = async (id, newStatus) => {
    await updateStatusFn(id, newStatus);
  };

  const handleSaveNotes = async () => {
    if (!activeInquiry) return;
    await updateStatusFn(activeInquiry.id, activeInquiry.status, adminNotes);
  };

  const handleDelete = async () => {
    if (!inquiryToDelete) return;
    await deleteInquiryFn(inquiryToDelete.id);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (inquiries.length === 0) {
      toast.error("No inquiries to export");
      return;
    }

    const headers = ["ID", "Customer Name", "Email", "Phone", "Car", "Preferred Contact", "Status", "Date", "Message", "Admin Notes"];
    const rows = inquiries.map((inq) => [
      `"${inq.id}"`,
      `"${inq.name}"`,
      `"${inq.email}"`,
      `"${inq.phone || ""}"`,
      `"${inq.car ? `${inq.car.year} ${inq.car.make} ${inq.car.model}` : "General"}"`,
      `"${inq.preferredContact}"`,
      `"${inq.status}"`,
      `"${format(new Date(inq.createdAt), "yyyy-MM-dd HH:mm")}"`,
      `"${inq.message.replace(/"/g, '""')}"`,
      `"${(inq.adminNotes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `carsai-inquiries-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Inquiries exported to CSV successfully");
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "NEW":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0">New Lead</Badge>;
      case "CONTACTED":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0">Contacted</Badge>;
      case "RESOLVED":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0">Resolved</Badge>;
      case "CLOSED":
        return <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 border-0">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const newCount = inquiries.filter((i) => i.status === "NEW").length;
  const contactedCount = inquiries.filter((i) => i.status === "CONTACTED").length;
  const resolvedCount = inquiries.filter((i) => i.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-0 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-medium">Total Inquiries</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{inquiries.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
          <CardContent className="p-4">
            <span className="text-xs text-blue-600 font-medium">New Leads</span>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">{newCount}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
          <CardContent className="p-4">
            <span className="text-xs text-amber-600 font-medium">Contacted</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{contactedCount}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
          <CardContent className="p-4">
            <span className="text-xs text-emerald-600 font-medium">Resolved / Won</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-2xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44 rounded-full border-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by customer, phone, or car..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full border-slate-200"
            />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="rounded-full gap-2 text-xs font-semibold shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Inquiries Stream */}
      {fetching && !inquiries.length ? (
        <div className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#E4141B] mx-auto" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
          <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Inquiries Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {search || statusFilter !== "ALL"
              ? "No customer inquiries match your current filter."
              : "Customer inquiries submitted on cars will show up here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <Card
              key={inq.id}
              className="rounded-2xl border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white"
            >
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Customer Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-extrabold text-base text-slate-900">{inq.name}</span>
                      {getStatusBadge(inq.status)}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(inq.createdAt), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                      <a
                        href={`mailto:${inq.email}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>{inq.email}</span>
                      </a>
                      {inq.phone && (
                        <a
                          href={`tel:${inq.phone}`}
                          className="flex items-center gap-1 text-slate-700 hover:text-[#E4141B]"
                        >
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{inq.phone}</span>
                        </a>
                      )}
                      <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                        Prefers: {inq.preferredContact}
                      </span>
                    </div>

                    {/* Customer Message Box */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed mt-2">
                      <p className="font-medium text-slate-900 mb-0.5 text-[11px] uppercase tracking-wide">
                        Customer Message:
                      </p>
                      {inq.message}
                    </div>

                    {/* Admin internal notes preview */}
                    {inq.adminNotes && (
                      <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900">
                        <span className="font-bold">Staff Note: </span>
                        {inq.adminNotes}
                      </div>
                    )}
                  </div>

                  {/* Associated Car Preview + Actions */}
                  <div className="lg:w-72 shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-5 space-y-3">
                    {inq.car ? (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                          {inq.car.images?.[0] ? (
                            <Image
                              src={inq.car.images[0]}
                              alt={`${inq.car.make} ${inq.car.model}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Car className="h-5 w-5 text-slate-400 m-auto" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {inq.car.year} {inq.car.make} {inq.car.model}
                          </p>
                          <p className="text-xs font-extrabold text-[#E4141B]">
                            {formatCurrency(inq.car.price)}
                          </p>
                          <Link
                            href={`/cars/${inq.car.id}`}
                            target="_blank"
                            className="text-[10px] text-blue-600 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                          >
                            <span>View car</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">General inventory inquiry</div>
                    )}

                    {/* Status updater */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500">Update Lead Status:</span>
                      <Select
                        value={inq.status}
                        onValueChange={(val) => handleStatusChange(inq.id, val)}
                        disabled={updating}
                      >
                        <SelectTrigger className="h-8 rounded-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">New Lead</SelectItem>
                          <SelectItem value="CONTACTED">Contacted</SelectItem>
                          <SelectItem value="RESOLVED">Resolved / Won</SelectItem>
                          <SelectItem value="CLOSED">Closed / Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quick Contact & Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {inq.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="flex-1 rounded-full text-xs h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          <a
                            href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `Hi ${inq.name}, thank you for contacting CarsAi regarding the ${
                                inq.car ? `${inq.car.year} ${inq.car.make} ${inq.car.model}` : "vehicle"
                              }. How can we assist you?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            WhatsApp
                          </a>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs h-8 gap-1"
                        onClick={() => {
                          setActiveInquiry(inq);
                          setAdminNotes(inq.adminNotes || "");
                          setNotesDialogOpen(true);
                        }}
                      >
                        <FileText className="h-3 w-3" />
                        <span>Note</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-xs h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setInquiryToDelete(inq);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Admin Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Internal Staff Note</DialogTitle>
            <DialogDescription>
              Record conversation details, offered discount, or follow-up schedule for {activeInquiry?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Textarea
              rows={4}
              placeholder="e.g., Called customer on Nov 22. Offered $500 discount if confirmed this weekend."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-full bg-[#E4141B] hover:bg-[#c81219] text-white"
              onClick={handleSaveNotes}
              disabled={updating}
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Inquiry</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this inquiry from {inquiryToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-full bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

