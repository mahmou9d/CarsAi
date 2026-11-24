"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Car,
  Search,
  CheckCircle,
  Clock,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Edit,
  Save,
  Loader2,
  X,
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
import { updateTradeInStatus } from "@/actions/trade-in";
import { toast } from "sonner";

export function TradeInList({ initialData = [] }) {
  const [items, setItems] = useState(initialData);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [editStatus, setEditStatus] = useState("PENDING");
  const [editOffer, setEditOffer] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isUpdating, startTransition] = useTransition();

  const handleOpenDialog = (item) => {
    setSelectedItem(item);
    setEditStatus(item.status);
    setEditOffer(item.finalOffer || item.tradeInCredit || item.instantCash || "");
    setEditNotes(item.adminNotes || "");
  };

  const handleSaveStatus = () => {
    if (!selectedItem) return;

    startTransition(async () => {
      const res = await updateTradeInStatus(selectedItem.id, {
        status: editStatus,
        finalOffer: editOffer ? Number(editOffer) : undefined,
        adminNotes: editNotes,
      });

      if (res.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === selectedItem.id ? res.data : i)),
        );
        toast.success("Appraisal record updated successfully!");
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
      item.fullName.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.includes(search) ||
      `${item.year} ${item.make} ${item.model}`.toLowerCase().includes(search.toLowerCase());
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
            { id: "IN_REVIEW", label: "In Review" },
            { id: "OFFER_MADE", label: "Offer Made" },
            { id: "ACCEPTED", label: "Accepted" },
            { id: "REJECTED", label: "Rejected" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
                filterStatus === f.id
                  ? "bg-[#E4141B] text-white shadow-xs font-bold"
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
            placeholder="Search code, car, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Requests table / list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
          No trade-in appraisal requests match your filter.
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
                        item.status === "OFFER_MADE"
                          ? "bg-amber-500 text-white"
                          : item.status === "ACCEPTED"
                            ? "bg-emerald-600 text-white"
                            : item.status === "IN_REVIEW"
                              ? "bg-blue-600 text-white"
                              : item.status === "REJECTED"
                                ? "bg-red-500 text-white"
                                : "bg-slate-600 text-white"
                      }`}
                    >
                      {item.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {item.year} {item.make} {item.model}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Odo: <strong>{Number(item.mileage).toLocaleString()} km</strong></span>
                    <span>Condition: <strong>{item.condition}</strong></span>
                    <span>City: <strong>{item.city}</strong></span>
                    <span className="text-emerald-700 font-semibold">
                      Estimate: {formatCurrency(item.estimatedMarket || 0)}
                    </span>
                    {item.finalOffer && (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                        Offered: {formatCurrency(item.finalOffer)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                    <span className="font-medium text-slate-800">{item.fullName}</span>
                    <a href={`tel:${item.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {item.phone}
                    </a>
                    <a href={`mailto:${item.email}`} className="text-slate-500 hover:underline flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {item.email}
                    </a>
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
                    Review & Offer
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

      {/* Edit / Review Modal */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                Review Appraisal: {selectedItem.year} {selectedItem.make} {selectedItem.model}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Ref: {selectedItem.referenceNumber} · Customer: {selectedItem.fullName} ({selectedItem.phone})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block font-medium">Initial Algorithmic Estimate</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {formatCurrency(selectedItem.estimatedMarket || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Instant Cash Baseline</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {formatCurrency(selectedItem.instantCash || 0)}
                  </span>
                </div>
              </div>

              {selectedItem.notes && (
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-amber-900">
                  <span className="font-bold block mb-0.5">Customer Notes:</span>
                  <p>{selectedItem.notes}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">Update Status:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-800"
                >
                  <option value="PENDING">PENDING - قيد المراجعة</option>
                  <option value="IN_REVIEW">IN_REVIEW - جاري الفحص والمعاينة</option>
                  <option value="OFFER_MADE">OFFER_MADE - تقديم عرض مالي رسمي للعميل</option>
                  <option value="ACCEPTED">ACCEPTED - وافق العميل على الصفقة</option>
                  <option value="REJECTED">REJECTED - رفض العرض</option>
                  <option value="COMPLETED">COMPLETED - تمت الصفقة واستلام السيارة</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">
                  Official Final Cash / Trade Offer ($):
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 28500"
                  value={editOffer}
                  onChange={(e) => setEditOffer(e.target.value)}
                  className="h-10 text-sm font-bold"
                />
                <span className="text-[11px] text-slate-400">
                  This offer will be displayed immediately to the customer on their live tracking page and account.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">Dealership Message to Customer:</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. We inspected your vehicle and are pleased to offer $28,500 cash or $30,000 trade credit..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-1 focus:ring-red-600 outline-none"
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
                className="bg-[#E4141B] hover:bg-[#c81219] text-white rounded-xl text-xs font-semibold gap-1.5"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save & Update Offer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

