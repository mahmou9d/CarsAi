// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Search,
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  Heart,
  MessageSquare,
  Download,
  Loader2,
  CheckCircle,
  UserCheck,
  UserX,
  User,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import { getAdminUsers, updateUserRoleAdmin } from "@/actions/admin";

export function UsersList({ initialData }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Role dialogs
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [targetRole, setTargetRole] = useState("USER");

  const {
    loading: fetchingUsers,
    fn: fetchUsersFn,
    data: usersData,
    error: usersError,
  } = useFetch(getAdminUsers);

  const {
    loading: updatingRole,
    fn: updateRoleFn,
    data: roleResult,
    error: roleError,
  } = useFetch(updateUserRoleAdmin);

  // Re-fetch on filter or search changes
  useEffect(() => {
    fetchUsersFn({
      search,
      role: roleFilter === "ALL" ? "" : roleFilter,
    });
  }, [search, roleFilter]);

  useEffect(() => {
    if (usersError) toast.error("Failed to load users");
    if (roleError) toast.error(roleError.message || "Failed to update role");
  }, [usersError, roleError]);

  useEffect(() => {
    if (roleResult?.success) {
      toast.success("User role updated successfully");
      setRoleDialogOpen(false);
      setUserToUpdate(null);
      fetchUsersFn({
        search,
        role: roleFilter === "ALL" ? "" : roleFilter,
      });
    }
  }, [roleResult]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsersFn({
      search,
      role: roleFilter === "ALL" ? "" : roleFilter,
    });
  };

  const handleOpenRoleModal = (user, newRole) => {
    setUserToUpdate(user);
    setTargetRole(newRole);
    setRoleDialogOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!userToUpdate) return;
    await updateRoleFn(userToUpdate.id, targetRole);
  };

  // Export Users CSV
  const handleExportCSV = () => {
    const list = usersData?.data?.users || initialData?.data?.users || [];
    if (list.length === 0) {
      toast.error("No users to export");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Role",
      "Test Drives Count",
      "Saved Cars Count",
      "Inquiries Count",
      "Joined Date",
    ];

    const rows = list.map((u) => [
      `"${u.id}"`,
      `"${u.name || "Customer"}"`,
      `"${u.email || ""}"`,
      `"${u.phone || ""}"`,
      u.role || "USER",
      u.testDrivesCount || 0,
      u.savedCarsCount || 0,
      u.inquiriesCount || 0,
      `"${new Date(u.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `CarsAi_Users_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${list.length} users to CSV`);
  };

  const currentData = usersData?.data || initialData?.data || { users: [], stats: { total: 0, admins: 0, clients: 0 } };
  const users = currentData.users || [];
  const stats = currentData.stats || { total: 0, admins: 0, clients: 0 };

  return (
    <div className="space-y-5">
      {/* ── KPI Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">
              Total Registered Users
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">
              {stats.total}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active customer accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">
              Staff & Administrators
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-50 text-[#E4141B]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-[#E4141B]">
              {stats.admins}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Full admin management permissions
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase font-semibold text-slate-500">
              Customers & Buyers
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-700">
              {stats.clients}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Regular showroom clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters and Search ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40 border-slate-200">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="USER">Customers (Users)</SelectItem>
              <SelectItem value="ADMIN">Administrators</SelectItem>
            </SelectContent>
          </Select>

          <form onSubmit={handleSearchSubmit} className="flex flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search by name, email, or phone..."
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
          disabled={users.length === 0}
          className="border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4 mr-1.5 text-slate-500" />
          Export Customers CSV
        </Button>
      </div>

      {/* ── Users Table ── */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {fetchingUsers && !usersData ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#E4141B]" />
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>User / Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Activity</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Manage Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const initials = (u.name || u.email || "U")
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <TableRow
                        key={u.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-bold text-slate-900">
                                {u.name || "Customer"}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="text-xs text-slate-700 flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <a
                                href={`mailto:${u.email}`}
                                className="hover:underline text-blue-600 truncate max-w-[160px]"
                              >
                                {u.email}
                              </a>
                            </div>
                            {u.phone && (
                              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <a
                                  href={`tel:${u.phone}`}
                                  className="hover:underline"
                                >
                                  {u.phone}
                                </a>
                                <a
                                  href={`https://wa.me/${u.phone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 ml-1"
                                  title="WhatsApp"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {u.role === "ADMIN" ? (
                            <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200 font-bold text-[11px]">
                              <ShieldCheck className="h-3 w-3 mr-1 text-red-600" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-slate-600 border-slate-200 text-[11px]"
                            >
                              <User className="h-3 w-3 mr-1 text-slate-400" />
                              Customer
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <span
                              title={`${u.testDrivesCount} Test Drives`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold"
                            >
                              <Calendar className="h-3 w-3 text-amber-600" />
                              {u.testDrivesCount}
                            </span>
                            <span
                              title={`${u.savedCarsCount} Wishlisted Cars`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200/60 font-semibold"
                            >
                              <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
                              {u.savedCarsCount}
                            </span>
                            <span
                              title={`${u.inquiriesCount} Inquiries`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/60 font-semibold"
                            >
                              <MessageSquare className="h-3 w-3 text-blue-600" />
                              {u.inquiriesCount}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-xs text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="text-right">
                          {u.role === "ADMIN" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updatingRole}
                              onClick={() => handleOpenRoleModal(u, "USER")}
                              className="text-xs text-slate-600 hover:text-red-700 hover:bg-red-50 border-slate-200"
                            >
                              Demote to User
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updatingRole}
                              onClick={() => handleOpenRoleModal(u, "ADMIN")}
                              className="text-xs text-red-600 hover:text-white hover:bg-[#E4141B] border-red-200"
                            >
                              Promote to Admin
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Users className="h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                No users found
              </h3>
              <p className="text-xs text-slate-500">
                {search || roleFilter !== "ALL"
                  ? "No accounts match your current filter or search criteria."
                  : "No registered users in the database."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Change Confirmation Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Confirm Permission Change
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to change the role of{" "}
              <strong>{userToUpdate?.name || userToUpdate?.email}</strong> to{" "}
              <Badge
                className={
                  targetRole === "ADMIN"
                    ? "bg-red-600 text-white font-bold"
                    : "bg-slate-200 text-slate-800"
                }
              >
                {targetRole}
              </Badge>
              ?
              {targetRole === "ADMIN" && (
                <span className="block text-red-600 text-xs mt-2 font-medium">
                  ⚠️ This user will receive full administrative access to edit
                  cars, pricing, test drives, and customer inquiries.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              disabled={updatingRole}
            >
              Cancel
            </Button>
            <Button
              disabled={updatingRole}
              onClick={handleConfirmRoleChange}
              className={
                targetRole === "ADMIN"
                  ? "bg-[#E4141B] hover:bg-[#c81219] text-white"
                  : "bg-slate-800 hover:bg-slate-900 text-white"
              }
            >
              {updatingRole ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                `Confirm ${targetRole}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

