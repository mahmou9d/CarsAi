"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  Download,
  Car,
  Calendar,
  MessageSquare,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const CATEGORY_TABS = [
  { id: "ALL", label: "All Activity", icon: History },
  { id: "INVENTORY", label: "Inventory", icon: Car },
  { id: "TEST_DRIVE", label: "Test Drives", icon: Calendar },
  { id: "INQUIRY", label: "Leads & Inquiries", icon: MessageSquare },
  { id: "USER", label: "Users & Staff", icon: Users },
];

export function LogsView({ initialEvents = [] }) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter events based on category, severity, and search
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Category check
      if (selectedCategory !== "ALL" && e.category !== selectedCategory) {
        return false;
      }
      // Severity check
      if (severityFilter !== "ALL" && e.severity !== severityFilter) {
        return false;
      }
      // Search check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = e.title?.toLowerCase().includes(q);
        const matchesDesc = e.description?.toLowerCase().includes(q);
        const matchesCategory = e.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [events, selectedCategory, severityFilter, searchQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Activity stream refreshed");
    }, 600);
  };

  const exportCSV = () => {
    try {
      const headers = ["Timestamp", "Category", "Severity", "Event Title", "Details"];
      const rows = filteredEvents.map((e) => [
        new Date(e.timestamp).toLocaleString(),
        e.category,
        e.severity,
        e.title,
        e.description,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers, ...rows]
          .map((row) => row.map((cell) => `"${cell || ""}"`).join(","))
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `Dealership_Activity_Log_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Audit trail CSV downloaded!");
    } catch (e) {
      toast.error("Failed to export audit CSV");
    }
  };

  const getEventIcon = (category, severity) => {
    switch (category) {
      case "INVENTORY":
        return <Car className="h-4 w-4 text-emerald-600" />;
      case "TEST_DRIVE":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "INQUIRY":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case "USER":
        return <Users className="h-4 w-4 text-amber-600" />;
      default:
        return <History className="h-4 w-4 text-slate-500" />;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "success":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] uppercase font-bold">
            Success
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] uppercase font-bold">
            Notice
          </Badge>
        );
      case "alert":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] uppercase font-bold">
            Alert
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] uppercase font-bold">
            Info
          </Badge>
        );
    }
  };

  const getActionLink = (event) => {
    if (event.category === "INVENTORY") {
      return (
        <Link
          href={`/admin/cars`}
          className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
        >
          View Inventory <ExternalLink className="h-3 w-3" />
        </Link>
      );
    }
    if (event.category === "TEST_DRIVE") {
      return (
        <Link
          href="/admin/test-drives"
          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
        >
          View Bookings <ExternalLink className="h-3 w-3" />
        </Link>
      );
    }
    if (event.category === "INQUIRY") {
      return (
        <Link
          href="/admin/inquiries"
          className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
        >
          View Inquiries <ExternalLink className="h-3 w-3" />
        </Link>
      );
    }
    if (event.category === "USER") {
      return (
        <Link
          href="/admin/users"
          className="text-xs text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1"
        >
          View Users <ExternalLink className="h-3 w-3" />
        </Link>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <History className="h-7 w-7 text-[#E4141B]" />
            Dealership Activity & System Audit Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time chronological audit trail of inventory updates, customer appointments, leads, and staff activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-red-600" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={exportCSV}
            size="sm"
            disabled={filteredEvents.length === 0}
            className="flex items-center gap-1.5 bg-[#E4141B] hover:bg-red-700 text-white shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export Audit CSV
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-red-400" : "text-slate-400"}`} />
              {tab.label}
              {tab.id !== "ALL" && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {events.filter((e) => e.category === tab.id).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search activity events, customer names, vehicles, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm border-slate-200 bg-slate-50/50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="ALL">All Severities</option>
            <option value="info">Information</option>
            <option value="success">Success Events</option>
            <option value="warning">Notices</option>
            <option value="alert">Alerts / Cancellations</option>
          </select>
        </div>
      </div>

      {/* Stream List */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader className="py-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#E4141B]" />
              Audit Stream ({filteredEvents.length} events)
            </CardTitle>
            <span className="text-xs text-slate-400 font-medium">Sorted by most recent</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <History className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No activity logs found</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting your filter or search query.</p>
              {(searchQuery || selectedCategory !== "ALL" || severityFilter !== "ALL") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("ALL");
                    setSeverityFilter("ALL");
                  }}
                  className="mt-3 text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredEvents.map((event) => {
                const eventDate = new Date(event.timestamp);
                const timeFormatted = eventDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const dateFormatted = eventDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={event.id}
                    className="p-4 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                        {getEventIcon(event.category, event.severity)}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">{event.title}</span>
                          {getSeverityBadge(event.severity)}
                          <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200 bg-white">
                            {event.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 gap-1 pl-12 sm:pl-0">
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{dateFormatted}</span>
                        <span>•</span>
                        <span>{timeFormatted}</span>
                      </div>
                      <div className="mt-1">{getActionLink(event)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

