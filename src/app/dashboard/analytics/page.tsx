"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentOrders: Array<{
    id: string;
    orderID: string;
    customerName: string;
    totalAmount: number;
    payableAmount: number;
    orderStatus: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    sku: string;
    imageUrl: string | null;
    orderCount: number;
    totalQuantity: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  revenueTrend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Calculate date range based on timeRange
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const response = await api.dashboard.getStats(
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      toast.error(error.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // Fallback data for charts that don't have API data yet
  const salesByLeague = [
    { name: "Premier League", value: 3500, color: "#8b5cf6" },
    { name: "La Liga", value: 2800, color: "#3b82f6" },
    { name: "Serie A", value: 2200, color: "#10b981" },
    { name: "Bundesliga", value: 1900, color: "#f59e0b" },
    { name: "Ligue 1", value: 1600, color: "#ef4444" },
    { name: "Others", value: 1200, color: "#6b7280" },
  ];

  const salesByType = [
    { type: "Normal", count: 4200 },
    { type: "Player", count: 3100 },
    { type: "Retro", count: 2400 },
    { type: "Kid", count: 1800 },
  ];

  // Format revenue trend data for charts
  const revenueData =
    stats?.revenueTrend?.map((day) => ({
      date: format(new Date(day.date), "MMM dd"),
      revenue: day.revenue,
      orders: day.orders,
    })) || [];

  // Format top products for display
  const topProducts =
    stats?.topProducts?.map((p) => ({
      name: p.name,
      sales: p.orderCount,
      quantity: p.totalQuantity,
      revenue: p.orderCount * 50, // Estimate - replace with actual revenue when API supports it
    })) || [];

  // Customer metrics from API or fallback
  const customerMetrics = {
    total: stats?.totalCustomers || 0,
    new: 0, // TODO: Add to API
    returning: stats?.totalCustomers || 0,
    avgLifetimeValue: stats?.averageOrderValue || 0,
    topCustomers: [] as Array<{ name: string; orders: number; spent: number }>,
  };

  // Inventory metrics from API or fallback
  const inventoryMetrics = {
    totalProducts: stats?.totalProducts || 0,
    lowStock: 0, // TODO: Add to API
    outOfStock: 0, // TODO: Add to API
    totalValue: 0, // TODO: Add to API
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Business insights and performance metrics
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">
                    €{((stats?.totalRevenue || 0) / 100).toLocaleString()}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  For selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">
                    {(stats?.totalOrders || 0).toLocaleString()}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  For selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Order Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">
                    €{((stats?.averageOrderValue || 0) / 100).toFixed(2)}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Average per order
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">
                    {(stats?.totalCustomers || 0).toLocaleString()}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Registered customers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              {/* <CardDescription>Monthly revenue and order volume</CardDescription> */}
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                    name="Revenue (€)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Sales by League */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by League</CardTitle>
                <CardDescription>
                  Distribution of sales across leagues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesByLeague}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {salesByLeague.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sales by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by Shirt Type</CardTitle>
                <CardDescription>Units sold by product type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€245,231</div>
                <p className="text-xs text-muted-foreground">
                  Across all products
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Gross Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€98,092</div>
                <p className="text-xs text-muted-foreground">40% margin</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Net Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€73,569</div>
                <p className="text-xs text-muted-foreground">30% margin</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Monthly revenue analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Revenue (€)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Best sellers by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        €{product.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Units Sold
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">11,500</div>
                <p className="text-xs text-muted-foreground">
                  +19% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Avg Items/Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3</div>
                <p className="text-xs text-muted-foreground">
                  +0.2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Best Seller
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">Man Utd Home</div>
                <p className="text-xs text-muted-foreground">245 units</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Popular Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">M</div>
                <p className="text-xs text-muted-foreground">35% of sales</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Product Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by League</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesByLeague}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {salesByLeague.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Total Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customerMetrics.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{customerMetrics.new} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  New Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerMetrics.new}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Returning Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.8%</div>
                <p className="text-xs text-muted-foreground">
                  {customerMetrics.returning} customers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Avg Lifetime Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{customerMetrics.avgLifetimeValue}
                </div>
                <p className="text-xs text-muted-foreground">Per customer</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Highest spending customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerMetrics.topCustomers.map((customer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.orders} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">€{customer.spent}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {inventoryMetrics.totalProducts}
                </div>
                <p className="text-xs text-muted-foreground">Active SKUs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {inventoryMetrics.lowStock}
                </div>
                <p className="text-xs text-muted-foreground">Need reorder</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Out of Stock
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {inventoryMetrics.outOfStock}
                </div>
                <p className="text-xs text-muted-foreground">Urgent action</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Stock Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{inventoryMetrics.totalValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total inventory</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
