// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MoreHorizontal,
  Star,
  StarOff,
  Trash2,
  Eye,
  Pencil,
  Loader2,
  Car as CarIcon,
  Download,
  DollarSign,
  Tag,
  Copy,
  CheckSquare,
  Square,
  ArrowUpDown,
  CheckCircle2,
  ClipboardCheck,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import {
  getCars,
  deleteCar,
  updateCarStatus,
  updateCarPrice,
  bulkUpdateCarStatus,
  bulkDeleteCars,
  cloneCar,
} from "@/actions/cars";
import { formatCurrency } from "@/lib/helpers";
import Image from "next/image";

const STATUS_FILTERS = [
  { value: "ALL", label: "All Statuses" },
  { value: "AVAILABLE", label: "Available" },
  { value: "UNAVAILABLE", label: "Unavailable" },
  { value: "SOLD", label: "Sold" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Listed" },
  { value: "oldest", label: "Oldest Listed" },
  { value: "priceAsc", label: "Price: Low to High" },
  { value: "priceDesc", label: "Price: High to Low" },
  { value: "yearDesc", label: "Year: Newest" },
  { value: "mileageAsc", label: "Mileage: Lowest" },
];

export const CarsList = () => {
  const router = useRouter();

  // State for search, filter, sort and selection
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCarIds, setSelectedCarIds] = useState([]);

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Quick price edit dialog
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [carToEditPrice, setCarToEditPrice] = useState(null);
  const [newPrice, setNewPrice] = useState("");

  // Custom hooks for API calls
  const {
    loading: loadingCars,
    fn: fetchCars,
    data: carsData,
    error: carsError,
  } = useFetch(getCars);

  const {
    loading: deletingCar,
    fn: deleteCarFn,
    data: deleteResult,
    error: deleteError,
  } = useFetch(deleteCar);

  const {
    loading: updatingCar,
    fn: updateCarStatusFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateCarStatus);

  const {
    loading: updatingPrice,
    fn: updatePriceFn,
    data: priceResult,
    error: priceError,
  } = useFetch(updateCarPrice);

  const {
    loading: executingBulkStatus,
    fn: bulkStatusFn,
    data: bulkStatusResult,
    error: bulkStatusError,
  } = useFetch(bulkUpdateCarStatus);

  const {
    loading: executingBulkDelete,
    fn: bulkDeleteFn,
    data: bulkDeleteResult,
    error: bulkDeleteError,
  } = useFetch(bulkDeleteCars);

  const {
    loading: executingClone,
    fn: cloneCarFn,
    data: cloneResult,
    error: cloneError,
  } = useFetch(cloneCar);

  // Initial fetch and refetch on search, filter, or sort changes
  useEffect(() => {
    fetchCars({
      search,
      status: statusFilter === "ALL" ? "" : statusFilter,
      sortBy,
    });
  }, [search, statusFilter, sortBy]);

  // Handle errors
  useEffect(() => {
    if (carsError) toast.error("Failed to load cars");
    if (deleteError) toast.error("Failed to delete car");
    if (updateError) toast.error("Failed to update car");
    if (priceError) toast.error(priceError.message || "Failed to update price");
    if (bulkStatusError) toast.error("Bulk status update failed");
    if (bulkDeleteError) toast.error("Bulk delete failed");
    if (cloneError) toast.error("Failed to duplicate car");
  }, [
    carsError,
    deleteError,
    updateError,
    priceError,
    bulkStatusError,
    bulkDeleteError,
    cloneError,
  ]);

  // Handle successful operations
  useEffect(() => {
    if (deleteResult?.success) {
      toast.success("Car deleted successfully");
      fetchCars({ search, status: statusFilter === "ALL" ? "" : statusFilter, sortBy });
    }

    if (updateResult?.success) {
      toast.success("Car updated successfully");
      fetchCars({ search, status: statusFilter === "ALL" ? "" : statusFilter, sortBy });
    }

    if (priceResult?.success) {
      toast.success("Price updated successfully");
      setPriceDialogOpen(false);
      setCarToEditPrice(null);
      setNewPrice("");
      fetchCars({ search, status: statusFilter === "ALL" ? "" : statusFilter, sortBy });
    }

    if (bulkStatusResult?.success) {
      toast.success(`Updated ${bulkStatusResult.count} vehicles successfully`);
      setSelectedCarIds([]);
      fetchCars({ search, status: statusFilter === "ALL" ? "" : statusFilter, sortBy });
    }

    if (bulkDeleteResult?.success) {
      toast.success(`Deleted ${bulkDeleteResult.count} vehicles successfully`);
      setSelectedCarIds([]);
      setBulkDeleteDialogOpen(false);
      fetchCars({ search, status: statusFilter === "ALL" ? "" : statusFilter, sortBy });
    }

    if (cloneResult?.success) {
      toast.success("Vehicle duplicated successfully as copy!");
      fetchCars({ search, status: statusFilter === "ALL" ? "" : statusFilter, sortBy });
    }
  }, [
    deleteResult,
    updateResult,
    priceResult,
    bulkStatusResult,
    bulkDeleteResult,
    cloneResult,
  ]);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCars({ search, status: statusFilter === "ALL" ? "" : statusFilter, sortBy });
  };

  // Selection handlers
  const handleSelectAll = () => {
    const list = carsData?.data || [];
    if (selectedCarIds.length === list.length) {
      setSelectedCarIds([]);
    } else {
      setSelectedCarIds(list.map((c) => c.id));
    }
  };

  const handleToggleSelectCar = (carId) => {
    setSelectedCarIds((prev) =>
      prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId],
    );
  };

  // Bulk actions
  const handleBulkStatus = async (status) => {
    if (selectedCarIds.length === 0) return;
    await bulkStatusFn(selectedCarIds, status);
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedCarIds.length === 0) return;
    await bulkDeleteFn(selectedCarIds);
  };

  // Clone car
  const handleCloneCar = async (carId) => {
    await cloneCarFn(carId);
  };

  // Handle delete car
  const handleDeleteCar = async () => {
    if (!carToDelete) return;
    await deleteCarFn(carToDelete.id);
    setDeleteDialogOpen(false);
    setCarToDelete(null);
  };

  // Handle toggle featured status
  const handleToggleFeatured = async (car) => {
    await updateCarStatusFn(car.id, { featured: !car.featured });
  };

  // Handle status change
  const handleStatusUpdate = async (car, newStatus) => {
    await updateCarStatusFn(car.id, { status: newStatus });
  };

  // Open price quick edit dialog
  const handleOpenPriceDialog = (car) => {
    setCarToEditPrice(car);
    setNewPrice(car.price?.toString() || "");
    setPriceDialogOpen(true);
  };

  // Save quick price
  const handleSavePrice = async (e) => {
    e.preventDefault();
    if (!carToEditPrice) return;
    const num = parseFloat(newPrice);
    if (isNaN(num) || num <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    await updatePriceFn(carToEditPrice.id, num);
  };

  // Export Inventory CSV
  const handleExportCSV = () => {
    const list = carsData?.data || [];
    if (list.length === 0) {
      toast.error("No cars available to export");
      return;
    }

    const headers = [
      "ID",
      "Make",
      "Model",
      "Year",
      "Price",
      "Mileage",
      "FuelType",
      "Transmission",
      "BodyType",
      "Color",
      "Status",
      "Featured",
      "Created At",
    ];

    const rows = list.map((c) => [
      `"${c.id}"`,
      `"${c.make || ""}"`,
      `"${c.model || ""}"`,
      c.year || "",
      c.price || 0,
      c.mileage || 0,
      `"${c.fuelType || ""}"`,
      `"${c.transmission || ""}"`,
      `"${c.bodyType || ""}"`,
      `"${c.color || ""}"`,
      `"${c.status || ""}"`,
      c.featured ? "Yes" : "No",
      `"${new Date(c.createdAt || Date.now()).toLocaleDateString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${list.length} cars to CSV`);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">
            Available
          </Badge>
        );
      case "UNAVAILABLE":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0">
            Unavailable
          </Badge>
        );
      case "SOLD":
        return (
          <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 border-0">
            Sold
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isAllSelected =
    carsData?.data?.length > 0 && selectedCarIds.length === carsData.data.length;

  return (
    <div className="space-y-4">
      {/* ── Actions, Sorting, Filters and Search Bar ── */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => router.push("/admin/cars/create")}
            className="flex items-center bg-[#E4141B] hover:bg-[#c81219] text-white shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Car
          </Button>

          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
            disabled={!carsData?.data?.length}
          >
            <Download className="h-4 w-4 mr-1.5 text-slate-500" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/admin/cars/inspection")}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <ClipboardCheck className="h-4 w-4 mr-1.5 text-emerald-600" />
            Inspection Studio
          </Button>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2.5 items-center">
          {/* Sort By Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44 border-slate-200 bg-white">
              <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 border-slate-200 bg-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex w-full sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search make, model..."
                className="pl-9 w-full sm:w-52 focus-visible:ring-red-600 border-slate-200 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>
        </div>
      </div>

      {/* ── Floating / Sticky Bulk Actions Toolbar ── */}
      {selectedCarIds.length > 0 && (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Badge className="bg-red-600 text-white border-0 font-bold">
              {selectedCarIds.length}
            </Badge>
            <span>vehicles selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <Button
              size="sm"
              variant="outline"
              disabled={executingBulkStatus}
              onClick={() => handleBulkStatus("AVAILABLE")}
              className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" />
              Set Available
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={executingBulkStatus}
              onClick={() => handleBulkStatus("UNAVAILABLE")}
              className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <XCircle className="h-3.5 w-3.5 mr-1 text-amber-400" />
              Set Unavailable
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={executingBulkStatus}
              onClick={() => handleBulkStatus("SOLD")}
              className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <ShoppingBag className="h-3.5 w-3.5 mr-1 text-blue-400" />
              Mark Sold
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={executingBulkDelete}
              onClick={() => setBulkDeleteDialogOpen(true)}
              className="h-8 text-xs bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete Selected
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedCarIds([])}
              className="h-8 text-xs text-slate-400 hover:text-white hover:bg-white/10"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* ── Cars Table ── */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loadingCars && !carsData ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#E4141B]" />
            </div>
          ) : carsData?.success && carsData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="w-10 text-center">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carsData.data.map((car) => {
                    const isSelected = selectedCarIds.includes(car.id);
                    return (
                      <TableRow
                        key={car.id}
                        className={`transition-colors ${
                          isSelected ? "bg-red-50/50" : "hover:bg-red-50/20"
                        }`}
                      >
                        <TableCell className="text-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleSelectCar(car.id)}
                            aria-label={`Select ${car.make} ${car.model}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="w-10 h-10 rounded-md overflow-hidden border border-slate-200 relative bg-slate-100">
                            {car.images && car.images.length > 0 ? (
                              <Image
                                src={car.images[0]}
                                alt={`${car.make} ${car.model}`}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <CarIcon className="h-5 w-5 text-slate-300" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900">
                          {car.make} {car.model}
                          <div className="text-[11px] text-slate-400 font-normal">
                            {car.mileage
                              ? `${car.mileage.toLocaleString()} km`
                              : "0 km"}{" "}
                            • {car.fuelType || "Petrol"} • {car.transmission || "Auto"}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium">
                          {car.year}
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => handleOpenPriceDialog(car)}
                            className="font-bold text-slate-900 hover:text-[#E4141B] flex items-center gap-1 group text-left"
                            title="Click to quick-edit price"
                          >
                            {formatCurrency(car.price)}
                            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                          </button>
                        </TableCell>
                        <TableCell>{getStatusBadge(car.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-9 w-9 hover:bg-amber-50"
                            onClick={() => handleToggleFeatured(car)}
                            disabled={updatingCar}
                            title={
                              car.featured
                                ? "Remove featured"
                                : "Mark as featured"
                            }
                          >
                            {car.featured ? (
                              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                            ) : (
                              <StarOff className="h-5 w-5 text-slate-300" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-8 w-8 hover:bg-slate-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/cars/${car.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View on Site
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenPriceDialog(car)}
                              >
                                <Tag className="mr-2 h-4 w-4 text-emerald-600" />
                                Quick Edit Price
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/admin/cars/${car.id}/edit`)
                                }
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Full Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCloneCar(car.id)}
                                disabled={executingClone}
                              >
                                <Copy className="mr-2 h-4 w-4 text-blue-600" />
                                Duplicate / Clone Car
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/admin/cars/inspection?carId=${car.id}`)}
                              >
                                <ClipboardCheck className="mr-2 h-4 w-4 text-emerald-600" />
                                Multi-Point Inspection
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Status</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(car, "AVAILABLE")
                                }
                                disabled={
                                  car.status === "AVAILABLE" || updatingCar
                                }
                              >
                                Set Available
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(car, "UNAVAILABLE")
                                }
                                disabled={
                                  car.status === "UNAVAILABLE" || updatingCar
                                }
                              >
                                Set Unavailable
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(car, "SOLD")}
                                disabled={car.status === "SOLD" || updatingCar}
                              >
                                Mark as Sold
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => {
                                  setCarToDelete(car);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <CarIcon className="h-8 w-8 text-red-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-1">
                No cars found
              </h3>
              <p className="text-slate-500 mb-4 text-sm">
                {search || statusFilter !== "ALL"
                  ? "No cars match your search or filter criteria"
                  : "Your inventory is empty. Add cars to get started."}
              </p>
              <Button
                onClick={() => router.push("/admin/cars/create")}
                className="bg-[#E4141B] hover:bg-[#c81219] text-white"
              >
                Add Your First Car
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Price Edit Dialog */}
      <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSavePrice}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Quick Edit Price
              </DialogTitle>
              <DialogDescription>
                Update the listing price for {carToEditPrice?.year}{" "}
                {carToEditPrice?.make} {carToEditPrice?.model}.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-2">
              <label className="text-sm font-medium text-slate-700">
                New Price ($)
              </label>
              <Input
                type="number"
                step="any"
                min="1"
                placeholder="e.g. 25000"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                autoFocus
                className="text-lg font-semibold"
                required
              />
              <p className="text-xs text-slate-500">
                Current price:{" "}
                {carToEditPrice?.price
                  ? formatCurrency(carToEditPrice.price)
                  : "$0"}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPriceDialogOpen(false)}
                disabled={updatingPrice}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatingPrice}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {updatingPrice ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Price"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Single Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {carToDelete?.make}{" "}
              {carToDelete?.model} ({carToDelete?.year})? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingCar}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCar}
              disabled={deletingCar}
              className="bg-[#E4141B] hover:bg-[#c81219]"
            >
              {deletingCar ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Car"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all{" "}
              <strong>{selectedCarIds.length}</strong> selected vehicles? This
              action cannot be undone and will permanently remove them from
              inventory.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
              disabled={executingBulkDelete}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmBulkDelete}
              disabled={executingBulkDelete}
              className="bg-[#E4141B] hover:bg-[#c81219]"
            >
              {executingBulkDelete ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedCarIds.length} Cars`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
