"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Wrench,
  Search,
  CheckCircle,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  Edit,
  Save,
  Loader2,
  CheckCircle2,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/helpers";
import { updateServiceBookingStatus } from "@/actions/service-booking";
import { toast } from "sonner";

export function ServicesList({ initialData = [] }) {
  const [items, setItems] = useState(initialData);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [editStatus, setEditStatus] = useState("PENDING");
  const [editTech, setEditTech] = useState("");
  const [editCost, setEditCost] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editInspection, setEditInspection] = useState(false);
  const [isUpdating, startTransition] = useTransition();

  const handleOpenDialog = (item) => {
    setSelectedItem(item);
    setEditStatus(item.status);
    setEditTech(item.technicianName || "Master Tech");
    setEditCost(item.finalCost || item.estimatedCost || "");
    setEditNotes(item.adminNotes || "");
    setEditInspection(Boolean(item.inspectionPassed));
  };

  const handleSaveStatus = () => {
    if (!selectedItem) return;

    startTransition(async () => {
      const res = await updateServiceBookingStatus(selectedItem.id, {
        status: editStatus,
        technicianName: editTech,
        finalCost: editCost ? Number(editCost) : undefined,
        adminNotes: editNotes,
        inspectionPassed: editInspection,
      });

      if (res.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === selectedItem.id ? res.data : i)),
        );
        toast.success("Service booking updated!");
        setSelectedItem(null);
      } else {
        toast.error(res.error || "Failed to update record");
      }
    });
  };

  const filtered = items.filter((item) => {
    const matchStatus = filterStatus === "ALL" || item.status === filterStatus;
    const matchSearch =
      !search ||
      item.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.customerPhone.includes(search) ||
      `${item.carMake} ${item.carModel || ""}`.toLowerCase().includes(search.toLowerCase()) ||
      item.serviceType.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Filters and search bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          {[
            { id: "ALL", label: `All (${items.length})` },
            { id: "PENDING", label: "Pending" },
            { id: "CONFIRMED", label: "Confirmed" },
            { id: "IN_PROGRESS", label: "In Workshop" },
            { id: "READY_FOR_PICKUP", label: "Ready" },
            { id: "COMPLETED", label: "Completed" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
                filterStatus === f.id
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search code, name, phone, make..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
          No service appointments match your filter.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((item) => (
            <Card key={item.id} className="border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.referenceNumber}
                    </span>
                    <Badge
                      className={`text-[10px] px-2 py-0.5 font-bold ${
                        item.status === "READY_FOR_PICKUP"
                          ? "bg-emerald-600 text-white"
                          : item.status === "IN_PROGRESS"
                            ? "bg-amber-500 text-white"
                            : item.status === "CONFIRMED"
                              ? "bg-blue-600 text-white"
                              : item.status === "COMPLETED"
                                ? "bg-slate-800 text-white"
                                : "bg-slate-500 text-white"
                      }`}
                    >
                      {item.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Scheduled: <strong>{item.preferredDate}</strong> ({item.preferredTime || "Morning"})
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {item.serviceType}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Vehicle: <strong>{item.carMake} {item.carModel || ""}</strong></span>
                    <span>Package: <strong>{item.servicePackage || "Standard"}</strong></span>
                    <span>Tech: <strong>{item.technicianName || "Unassigned"}</strong></span>
                    <span className="text-emerald-700 font-semibold">
                      Cost: {formatCurrency(item.finalCost || item.estimatedCost || 0)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                    <span className="font-medium text-slate-800">{item.customerName}</span>
                    <a href={`tel:${item.customerPhone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {item.customerPhone}
                    </a>
                    {item.customerEmail && (
                      <a href={`mailto:${item.customerEmail}`} className="text-slate-500 hover:underline flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {item.customerEmail}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(item)}
                    className="h-9 rounded-xl text-xs font-semibold gap-1.5"
                  >
                    <Edit className="h-3.5 w-3.5 text-slate-600" />
                    Manage Bay & Status
                  </Button>
                  <Button asChild size="sm" variant="ghost" className="h-9 w-9 p-0 text-slate-400 hover:text-slate-700">
                    <Link href={`/track-request?ref=${item.referenceNumber}`} target="_blank" title="Customer View">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                Service Bay: {selectedItem.serviceType}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Ref: {selectedItem.referenceNumber} · Customer: {selectedItem.customerName} ({selectedItem.customerPhone})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">Workshop Lifecycle Stage:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-800"
                >
                  <option value="PENDING">PENDING - قيد انتظار التأكيد</option>
                  <option value="CONFIRMED">CONFIRMED - موعد مؤكد ومجدول للحضور</option>
                  <option value="IN_PROGRESS">IN_PROGRESS - السيارة حالياً في حارة الصيانة بالورشة</option>
                  <option value="READY_FOR_PICKUP">READY_FOR_PICKUP - جاهزة للاستلام (إشعار للعميل)</option>
                  <option value="COMPLETED">COMPLETED - تم تسليم السيارة للعميل بنجاح</option>
                  <option value="CANCELLED">CANCELLED - إلغاء الموعد</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">Assigned Technician:</label>
                  <Input
                    placeholder="e.g. Master Tech Mahmoud"
                    value={editTech}
                    onChange={(e) => setEditTech(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">Final Service Cost ($):</label>
                  <Input
                    type="number"
                    placeholder="e.g. 180"
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    className="h-10 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  id="inspect-check"
                  checked={editInspection}
                  onChange={(e) => setEditInspection(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="inspect-check" className="font-bold text-slate-800 cursor-pointer text-xs">
                  Pass Multi-Point 150-Point Inspection (اجتياز فحص الـ 150 نقطة)
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">Workshop & Service Notes for Customer:</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Completed synthetic oil change, brake pads at 80% remaining, cabin filter replaced..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedItem(null)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveStatus}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold gap-1.5"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Updates
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

