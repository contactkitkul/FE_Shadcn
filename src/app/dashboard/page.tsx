"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker";
import { Overview } from "@/components/dashboard/overview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Download,
  DollarSign,
  ShoppingCart,
  Package,
  Clock,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { startOfMonth, format, subDays } from "date-fns";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";

interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentOrders: any[];
  topProducts: any[];
  ordersByStatus: any[];
  revenueTrend: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState<string>("7days");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate date range based on filter
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;

    switch (dateFilter) {
      case "7days":
        startDate = subDays(now, 7);
        break;
      case "14days":
        startDate = subDays(now, 14);
        break;
      case "30days":
        startDate = subDays(now, 30);
        break;
      case "mtd":
        startDate = startOfMonth(now);
        break;
      case "custom":
        if (customDateRange?.from && customDateRange?.to) {
          return {
            startDate: format(customDateRange.from, "yyyy-MM-dd"),
            endDate: format(customDateRange.to, "yyyy-MM-dd"),
          };
        }
        startDate = subDays(now, 7);
        break;
      default:
        startDate = subDays(now, 7);
    }

    return {
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(now, "yyyy-MM-dd"),
    };
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();
      const response = await api.dashboard.getStats(startDate, endDate);
      
      if (response.success) {
        setStats(response.data);
      } else {
        toast.error("Failed to load dashboard stats");
      }
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      toast.error(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats on mount and when date filter changes
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, customDateRange]);

  // Handle date filter change
  const handleDateFilterChange = (filter: string) => {
    setDateFilter(filter);
    if (filter !== "custom") {
      setCustomDateRange(undefined);
    }
  };

  // Handle custom date range change
  const handleCustomDateChange = (range: DateRange | undefined) => {
    setCustomDateRange(range);
    if (range?.from && range?.to) {
      setDateFilter("custom");
    }
  };

  // Calculate pending orders count
  const pendingOrdersCount = stats?.ordersByStatus?.find(
    (s) => s.status === "RECEIVED" || s.status === "PROCESSING"
  )?.count || 0;

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2">
          {/* Date Filter Buttons */}
          <Button
            variant={dateFilter === "7days" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDateFilterChange("7days")}
            className={
              dateFilter === "7days"
                ? "bg-gray-800 text-white"
                : " text-gray-700 border-gray-300"
            }
          >
            Last 7 Days
          </Button>
          <Button
            variant={dateFilter === "14days" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDateFilterChange("14days")}
          >
            Last 14 Days
          </Button>
          <Button
            variant={dateFilter === "30days" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDateFilterChange("30days")}
          >
            Last 30 Days
          </Button>
          <Button
            variant={dateFilter === "mtd" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDateFilterChange("mtd")}
          >
            Month to Date
          </Button>

          <CalendarDateRangePicker 
            date={customDateRange}
            onDateChange={handleCustomDateChange}
          />
          <Button
            size="sm"
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid gap-4 grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-28" />
                  </div>
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-5">
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold">
                    €{stats?.totalRevenue?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg: €{stats?.averageOrderValue?.toFixed(2) || "0.00"} per order
                  </p>
                </div>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => router.push("/dashboard/orders")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalOrders || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    In selected period
                  </p>
                </div>
                <ShoppingCart className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => router.push("/dashboard/products")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalProducts || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    Active products
                  </p>
                </div>
                <Package className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => router.push("/dashboard/orders")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingOrdersCount}
                  </p>
                  <p className="text-xs text-gray-500">Awaiting fulfillment</p>
                </div>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => router.push("/dashboard/customers")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalCustomers || 0}
                  </p>
                  <p className="text-xs text-gray-500">Registered users</p>
                </div>
                <RotateCcw className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Two Chart Layout */}
      <div className="grid gap-6 grid-cols-2">
        <Card className=" border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Recent Days Performance
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Day-wise data with comparison to same period 30 days ago
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-pink-500 rounded-sm mr-2"></div>
                  <span className="text-gray-600">Revenue (€)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
                  <span className="text-gray-600">Orders</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                  <span className="text-gray-600">Shirts Sold</span>
                </div>
              </div>
            </div>
            <div className="h-64 rounded-lg p-4">
              <Overview
                data={stats?.revenueTrend || []}
                dateFilter={dateFilter}
                dashboardType="days"
                isComparison={false}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Daily performance with 30-day comparison • Revenue (columns) •
              Orders & Shirts (lines)
            </div>
          </CardContent>
        </Card>

        <Card className=" border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Comparison Analysis
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Monthly aggregated data (Nov, Oct, Sep, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-pink-500 rounded-sm mr-2"></div>
                  <span className="text-gray-600">Revenue (€)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
                  <span className="text-gray-600">Orders</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                  <span className="text-gray-600">Shirts Sold</span>
                </div>
              </div>
            </div>
            <div className="h-64 rounded-lg p-4">
              <Overview
                dateFilter={dateFilter}
                dashboardType="months"
                isComparison={false}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Monthly performance • Revenue (columns) • Orders & Shirts (lines)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
