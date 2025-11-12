"use client";

import { useState } from "react";
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
} from "lucide-react";
import { startOfMonth, format } from "date-fns";

export default function DashboardPage() {
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState<string>("7days");

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
            onClick={() => setDateFilter("7days")}
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
            onClick={() => setDateFilter("14days")}
          >
            Last 14 Days
          </Button>
          <Button
            variant={dateFilter === "30days" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter("30days")}
          >
            Last 30 Days
          </Button>
          <Button
            variant={dateFilter === "mtd" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter("mtd")}
          >
            Month to Date
          </Button>

          <CalendarDateRangePicker />
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
      <div className="grid gap-4 grid-cols-5">
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">€45,231.89</p>
                <p className="text-xs ">+20.1% from comparison period</p>
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
                <p className="text-2xl font-bold text-gray-900">2,350</p>
                <p className="text-xs text-gray-500">
                  +12.5% from comparison period
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
                <p className="text-sm font-medium text-gray-600">Shirts Sold</p>
                <p className="text-2xl font-bold text-gray-900">3,234</p>
                <p className="text-xs text-gray-500">
                  +19% from comparison period
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
                <p className="text-2xl font-bold text-gray-900">73</p>
                <p className="text-xs text-gray-500">Awaiting fulfillment</p>
              </div>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => router.push("/dashboard/refunds")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Returns</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-gray-500">Pending returns</p>
              </div>
              <RotateCcw className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

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
