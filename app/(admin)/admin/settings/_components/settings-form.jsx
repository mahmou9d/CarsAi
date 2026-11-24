// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Save,
  Clock,
  Loader2,
  Users,
  Shield,
  UserX,
  CheckCircle,
  Search,
  Building,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Store,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useFetch from "@/hooks/use-fetch";
import {
  getDealershipInfo,
  saveWorkingHours,
  updateDealershipProfile,
  getUsers,
  updateUserRole,
} from "@/actions/settings";

// Day names for display
const DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

export const SettingsForm = () => {
  // Dealership Profile State
  const [profileName, setProfileName] = useState("CarsAi");
  const [profileAddress, setProfileAddress] = useState("Egypt Cairo");
  const [profilePhone, setProfilePhone] = useState("01009014597");
  const [profileEmail, setProfileEmail] = useState("mohnud0987@gmail.com");

  const [workingHours, setWorkingHours] = useState(
    DAYS.map((day) => ({
      dayOfWeek: day.value,
      openTime: "09:00",
      closeTime: "18:00",
      isOpen: day.value !== "SUNDAY",
    }))
  );

  const [userSearch, setUserSearch] = useState("");
  const [confirmAdminDialog, setConfirmAdminDialog] = useState(false);
  const [userToPromote, setUserToPromote] = useState(null);
  const [confirmRemoveDialog, setConfirmRemoveDialog] = useState(false);
  const [userToDemote, setUserToDemote] = useState(null);

  // Custom hooks for API calls
  const {
    loading: fetchingSettings,
    fn: fetchDealershipInfo,
    data: settingsData,
    error: settingsError,
  } = useFetch(getDealershipInfo);

  const {
    loading: savingHours,
    fn: saveHours,
    data: saveResult,
    error: saveError,
  } = useFetch(saveWorkingHours);

  const {
    loading: savingProfile,
    fn: saveProfileFn,
    data: profileResult,
    error: profileError,
  } = useFetch(updateDealershipProfile);

  const {
    loading: fetchingUsers,
    fn: fetchUsers,
    data: usersData,
    error: usersError,
  } = useFetch(getUsers);

  const {
    loading: updatingRole,
    fn: updateRole,
    data: updateRoleResult,
    error: updateRoleError,
  } = useFetch(updateUserRole);

  // Fetch settings and users on component mount
  useEffect(() => {
    fetchDealershipInfo();
    fetchUsers();
  }, []);

  // Set dealership details when fetched
  useEffect(() => {
    if (settingsData?.success && settingsData.data) {
      const dealership = settingsData.data;
      if (dealership.name) setProfileName(dealership.name);
      if (dealership.address) setProfileAddress(dealership.address);
      if (dealership.phone) setProfilePhone(dealership.phone);
      if (dealership.email) setProfileEmail(dealership.email);

      // Map working hours
      if (dealership.workingHours && dealership.workingHours.length > 0) {
        const mappedHours = DAYS.map((day) => {
          const hourData = dealership.workingHours.find(
            (h) => h.dayOfWeek === day.value
          );

          if (hourData) {
            return {
              dayOfWeek: hourData.dayOfWeek,
              openTime: hourData.openTime,
              closeTime: hourData.closeTime,
              isOpen: hourData.isOpen,
            };
          }

          return {
            dayOfWeek: day.value,
            openTime: "09:00",
            closeTime: "18:00",
            isOpen: day.value !== "SUNDAY",
          };
        });

        setWorkingHours(mappedHours);
      }
    }
  }, [settingsData]);

  // Handle errors
  useEffect(() => {
    if (settingsError) toast.error("Failed to load dealership settings");
    if (saveError) toast.error(`Failed to save working hours: ${saveError.message}`);
    if (profileError) toast.error("Failed to save dealership profile");
    if (usersError) toast.error("Failed to load users");
    if (updateRoleError) toast.error(`Failed to update user role: ${updateRoleError.message}`);
  }, [settingsError, saveError, profileError, usersError, updateRoleError]);

  // Handle successful operations
  useEffect(() => {
    if (saveResult?.success) {
      toast.success("Working hours saved successfully");
      fetchDealershipInfo();
    }

    if (profileResult?.success) {
      toast.success("Dealership profile updated successfully");
      fetchDealershipInfo();
    }

    if (updateRoleResult?.success) {
      toast.success("User role updated successfully");
      fetchUsers();
      setConfirmAdminDialog(false);
      setConfirmRemoveDialog(false);
    }
  }, [saveResult, profileResult, updateRoleResult]);

  // Handle working hours change
  const handleWorkingHourChange = (index, field, value) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value,
    };
    setWorkingHours(updatedHours);
  };

  // Save working hours
  const handleSaveHours = async () => {
    await saveHours(workingHours);
  };

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await saveProfileFn({
      name: profileName,
      address: profileAddress,
      phone: profilePhone,
      email: profileEmail,
    });
  };

  // Make user admin
  const handleMakeAdmin = async () => {
    if (!userToPromote) return;
    await updateRole(userToPromote.id, "ADMIN");
  };

  // Remove admin privileges
  const handleRemoveAdmin = async () => {
    if (!userToDemote) return;
    await updateRole(userToDemote.id, "USER");
  };

  // Filter users by search term
  const filteredUsers = usersData?.success
    ? usersData.data.filter(
        (user) =>
          user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger
            value="profile"
            className="rounded-lg data-[state=active]:bg-[#E4141B] data-[state=active]:text-white text-xs sm:text-sm font-medium"
          >
            <Store className="h-4 w-4 mr-2" />
            Dealership Profile
          </TabsTrigger>
          <TabsTrigger
            value="hours"
            className="rounded-lg data-[state=active]:bg-[#E4141B] data-[state=active]:text-white text-xs sm:text-sm font-medium"
          >
            <Clock className="h-4 w-4 mr-2" />
            Working Hours
          </TabsTrigger>
          <TabsTrigger
            value="admins"
            className="rounded-lg data-[state=active]:bg-[#E4141B] data-[state=active]:text-white text-xs sm:text-sm font-medium"
          >
            <Shield className="h-4 w-4 mr-2" />
            Admin Users
          </TabsTrigger>
        </TabsList>

        {/* ── Dealership Profile Tab ── */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Building className="h-5 w-5 text-[#E4141B]" />
                Showroom & Dealership Information
              </CardTitle>
              <CardDescription>
                Configure the showroom brand name, location address, and official contact channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">
                    Dealership Brand Name
                  </Label>
                  <Input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    placeholder="e.g. CarsAi Egypt"
                    className="mt-1"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Displayed across header branding, customer quotes, and invoices
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">
                    Physical Showroom Address
                  </Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      required
                      placeholder="e.g. 15 El-Tahrir Street, Cairo, Egypt"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Used for client navigation and test drive appointment locations
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">
                      Primary Contact Phone
                    </Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        required
                        placeholder="e.g. +20 100 901 4597"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">
                      Official Contact Email
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        required
                        placeholder="e.g. contact@carsai.com"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-[#E4141B] hover:bg-[#c81219] text-white"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Dealership Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Working Hours Tab ── */}
        <TabsContent value="hours" className="space-y-6 mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>
                Set your showroom's working hours for each day of the week to govern test drive booking slots.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DAYS.map((day, index) => (
                  <div
                    key={day.value}
                    className="grid grid-cols-12 gap-4 items-center py-2.5 px-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="col-span-3 md:col-span-2">
                      <div className="font-semibold text-slate-900 text-sm">
                        {day.label}
                      </div>
                    </div>

                    <div className="col-span-9 md:col-span-2 flex items-center">
                      <Checkbox
                        id={`is-open-${day.value}`}
                        checked={workingHours[index]?.isOpen}
                        onCheckedChange={(checked) => {
                          handleWorkingHourChange(index, "isOpen", checked);
                        }}
                      />
                      <Label
                        htmlFor={`is-open-${day.value}`}
                        className="ml-2 cursor-pointer text-xs font-medium"
                      >
                        {workingHours[index]?.isOpen ? "Open" : "Closed"}
                      </Label>
                    </div>

                    {workingHours[index]?.isOpen && (
                      <>
                        <div className="col-span-5 md:col-span-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-slate-400 mr-2" />
                            <Input
                              type="time"
                              value={workingHours[index]?.openTime}
                              onChange={(e) =>
                                handleWorkingHourChange(
                                  index,
                                  "openTime",
                                  e.target.value
                                )
                              }
                              className="text-xs h-9"
                            />
                          </div>
                        </div>

                        <div className="text-center col-span-1 text-slate-400 text-xs">
                          to
                        </div>

                        <div className="col-span-5 md:col-span-3">
                          <Input
                            type="time"
                            value={workingHours[index]?.closeTime}
                            onChange={(e) =>
                              handleWorkingHourChange(
                                index,
                                "closeTime",
                                e.target.value
                              )
                            }
                            className="text-xs h-9"
                          />
                        </div>
                      </>
                    )}

                    {!workingHours[index]?.isOpen && (
                      <div className="col-span-11 md:col-span-8 text-slate-400 italic text-xs">
                        Closed for walk-ins & appointments
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSaveHours}
                  disabled={savingHours}
                  className="bg-[#E4141B] hover:bg-[#c81219] text-white"
                >
                  {savingHours ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Hours...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Working Hours
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Admin Users Tab ── */}
        <TabsContent value="admins" className="space-y-6 mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Admin Users & Staff</CardTitle>
                <CardDescription>
                  Manage accounts with administrative dealership access.
                </CardDescription>
              </div>
              <Link href="/admin/users">
                <Button variant="outline" size="sm" className="text-xs text-[#E4141B] border-red-200 hover:bg-red-50">
                  Open Customer Directory
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="mb-6 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search staff and users..."
                  className="pl-9 w-full"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              {fetchingUsers ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#E4141B]" />
                </div>
              ) : usersData?.success && filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          className="hover:bg-red-50/20 transition-colors"
                        >
                          <TableCell className="font-semibold text-slate-900">
                            {user.name || "Unnamed User"}
                          </TableCell>
                          <TableCell className="text-slate-600 text-xs">{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                user.role === "ADMIN"
                                  ? "bg-red-100 text-red-800 hover:bg-red-100 border-0"
                                  : "bg-slate-100 text-slate-800 hover:bg-slate-100 border-0"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {user.role === "ADMIN" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                                onClick={() => {
                                  setUserToDemote(user);
                                  setConfirmRemoveDialog(true);
                                }}
                                disabled={updatingRole}
                              >
                                <UserX className="h-3.5 w-3.5 mr-1.5" />
                                Remove Admin
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-700 hover:bg-red-50 text-xs"
                                onClick={() => {
                                  setUserToPromote(user);
                                  setConfirmAdminDialog(true);
                                }}
                                disabled={updatingRole}
                              >
                                <Shield className="h-3.5 w-3.5 mr-1.5" />
                                Make Admin
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No users found
                </div>
              )}
            </CardContent>
          </Card>

          {/* Confirm Make Admin Dialog */}
          <Dialog
            open={confirmAdminDialog}
            onOpenChange={setConfirmAdminDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Admin Privileges</DialogTitle>
                <DialogDescription>
                  Are you sure you want to give admin privileges to{" "}
                  <strong>{userToPromote?.name || userToPromote?.email}</strong>? Admin users can
                  manage all vehicles, pricing, test drives, and inquiries.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmAdminDialog(false)}
                  disabled={updatingRole}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMakeAdmin}
                  disabled={updatingRole}
                  className="bg-[#E4141B] hover:bg-[#c81219] text-white"
                >
                  {updatingRole ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Admin
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Confirm Remove Admin Dialog */}
          <Dialog
            open={confirmRemoveDialog}
            onOpenChange={setConfirmRemoveDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove Admin Privileges</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove admin privileges from{" "}
                  <strong>{userToDemote?.name || userToDemote?.email}</strong>? They will no
                  longer be able to access the admin portal.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmRemoveDialog(false)}
                  disabled={updatingRole}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRemoveAdmin}
                  disabled={updatingRole}
                  className="bg-[#E4141B] hover:bg-[#c81219]"
                >
                  {updatingRole ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    "Remove Admin"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};
