"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Car,
  Calendar,
  TrendingUp,
  Info,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
} from "lucide-react";

// Safe percentage helper — avoids NaN / Infinity when the denominator is 0
const pct = (numerator, denominator, digits = 1) => {
  if (!denominator) return "0";
  return ((numerator / denominator) * 100).toFixed(digits);
};

// Reusable status bar row (label, count, percentage bar)
function StatusBar({ label, value, total, colorClass }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">
          {value} ({pct(value, total)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${colorClass} h-2.5 rounded-full`}
          style={{ width: `${total ? (value / total) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}

export function Dashboard({ initialData }) {
  const [activeTab, setActiveTab] = useState("overview");

  // Show error if data fetch failed
  if (!initialData || !initialData.success) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {initialData?.error || "Failed to load dashboard data"}
        </AlertDescription>
      </Alert>
    );
  }

  const { cars, testDrives } = initialData.data;

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="test-drives">Test drives</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total cars
                </CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cars.total}</div>
                <p className="text-xs text-muted-foreground">
                  {cars.available} available, {cars.sold} sold
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Test drives
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.total}</div>
                <p className="text-xs text-muted-foreground">
                  {testDrives.pending} pending, {testDrives.confirmed} confirmed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversion rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {testDrives.conversionRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  From test drives to sales
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cars sold</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cars.sold}</div>
                <p className="text-xs text-muted-foreground">
                  {pct(cars.sold, cars.total)}% of inventory
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Overview Content */}
          <Card>
            <CardHeader>
              <CardTitle>Dealership summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-sm mb-2">Car inventory</h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-red-600 h-2.5 rounded-full"
                          style={{
                            width: `${
                              cars.total ? (cars.available / cars.total) * 100 : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="ml-2 text-sm">
                        {pct(cars.available, cars.total, 0)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Available inventory capacity
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-sm mb-2">
                      Test drive success
                    </h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-red-400 h-2.5 rounded-full"
                          style={{
                            width: `${
                              testDrives.total
                                ? (testDrives.completed / testDrives.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="ml-2 text-sm">
                        {pct(testDrives.completed, testDrives.total, 0)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Completed test drives
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-red-600">
                      {cars.sold}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">Cars sold</p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-amber-600">
                      {testDrives.pending + testDrives.confirmed}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Upcoming test drives
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-green-600">
                      {pct(cars.available, cars.total, 0)}%
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Inventory utilization
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Drives Tab */}
        <TabsContent value="test-drives" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total bookings
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.pending}</div>
                <p className="text-xs text-muted-foreground">
                  {pct(testDrives.pending, testDrives.total)}% of bookings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.confirmed}</div>
                <p className="text-xs text-muted-foreground">
                  {pct(testDrives.confirmed, testDrives.total)}% of bookings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.completed}</div>
                <p className="text-xs text-muted-foreground">
                  {pct(testDrives.completed, testDrives.total)}% of bookings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testDrives.cancelled}</div>
                <p className="text-xs text-muted-foreground">
                  {pct(testDrives.cancelled, testDrives.total)}% of bookings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Test Drive Status Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Test drive statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Conversion Rate Card */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">
                      Conversion rate
                    </h3>
                    <div className="text-3xl font-bold text-red-600">
                      {testDrives.conversionRate}%
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Test drives resulting in car purchases
                    </p>
                  </div>

                  {/* Test Drive Success Rate */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">
                      Completion rate
                    </h3>
                    <div className="text-3xl font-bold text-green-600">
                      {pct(testDrives.completed, testDrives.total)}%
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Test drives successfully completed
                    </p>
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="space-y-4 mt-4">
                  <h3 className="font-medium">Booking status breakdown</h3>

                  <StatusBar
                    label="Pending"
                    value={testDrives.pending}
                    total={testDrives.total}
                    colorClass="bg-amber-500"
                  />
                  <StatusBar
                    label="Confirmed"
                    value={testDrives.confirmed}
                    total={testDrives.total}
                    colorClass="bg-green-500"
                  />
                  <StatusBar
                    label="Completed"
                    value={testDrives.completed}
                    total={testDrives.total}
                    colorClass="bg-red-600"
                  />
                  <StatusBar
                    label="Cancelled"
                    value={testDrives.cancelled}
                    total={testDrives.total}
                    colorClass="bg-red-400"
                  />
                  <StatusBar
                    label="No show"
                    value={testDrives.noShow}
                    total={testDrives.total}
                    colorClass="bg-gray-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}