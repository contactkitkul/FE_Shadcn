"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudDataTable, Column } from "@/components/ui/crud-data-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Eye,
  Package,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Settings2,
} from "lucide-react";
import { Order, EnumOrderStatus, EnumCurrency } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { getEntityMessages } from "@/config/messages";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [visibleColumns, setVisibleColumns] = useState({
    orderID: true,
    customer: true,
    amount: true,
    status: true,
    date: true,
    actions: true,
  });

  // Fetch orders from API
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const PAGE_SIZE = 50;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch without sort params - sorting done client-side for speed
      const response = await api.orders.getAll({
        page,
        limit: PAGE_SIZE,
        search: searchTerm,
      });

      if (response.success) {
        const data = response.data;
        setOrders(data?.data || []);
        setPagination(data?.pagination || null);
      } else {
        toast.error(getEntityMessages("orders").loadError);
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error(error.message || getEntityMessages("orders").loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page]); // Removed sortColumn/sortDirection - sorting is client-side

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column as keyof typeof prev],
    }));
  };

  // Filter and sort orders client-side for better performance
  const filteredAndSortedOrders = useMemo(() => {
    let result = orders.filter((order) => {
      return statusFilter === "all" || order.orderStatus === statusFilter;
    });

    // Client-side sorting
    result.sort((a, b) => {
      let aVal: any = a[sortColumn as keyof Order];
      let bVal: any = b[sortColumn as keyof Order];

      // Handle nested fields and dates
      if (sortColumn === "createdAt" || sortColumn === "updatedAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase() || "";
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [orders, statusFilter, sortColumn, sortDirection]);

  const getStatusBadge = (status: EnumOrderStatus) => {
    const variants: Record<
      EnumOrderStatus,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      RECEIVED: { variant: "default", label: "Received" },
      PARTIALLY_FULFILLED: {
        variant: "secondary",
        label: "Partially Fulfilled",
      },
      FULFILLED: { variant: "default", label: "Fulfilled" },
      CANCELLED: { variant: "destructive", label: "Cancelled" },
      FULLY_REFUNDED: { variant: "outline", label: "Refunded" },
    };
    return (
      <Badge variant={variants[status].variant}>{variants[status].label}</Badge>
    );
  };

  const handleDownloadOrders = () => {
    const headers = ["Order ID", "Customer", "Amount", "Status", "Date"];
    const rows = filteredAndSortedOrders.map((order) => [
      order.orderID,
      order.shippingName,
      `€${order.payableAmount.toFixed(2)}`,
      order.orderStatus,
      format(order.createdAt, "MMM dd, yyyy"),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`Downloaded ${filteredAndSortedOrders.length} orders`);
  };

  // Calculate stats - payableAmount is always in EUR (base currency)
  const totalOrders = orders.length;
  const receivedOrders = orders.filter(
    (o) => o.orderStatus === EnumOrderStatus.RECEIVED
  ).length;
  const fulfilledOrders = orders.filter(
    (o) => o.orderStatus === EnumOrderStatus.FULFILLED
  ).length;
  const cancelledOrders = orders.filter(
    (o) => o.orderStatus === EnumOrderStatus.CANCELLED
  ).length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.payableAmount, 0);

  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
      </div>

      {/* Date Filter Buttons */}
      <div className="flex flex-wrap gap-1">
        <Button
          variant={dateFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateFilter("all")}
          className={
            dateFilter === "all"
              ? "bg-pink-500 hover:bg-pink-600 text-white border-0"
              : ""
          }
        >
          All Time
        </Button>
        <Button
          variant={dateFilter === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateFilter("today")}
        >
          Today
        </Button>
        <Button
          variant={dateFilter === "yesterday" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateFilter("yesterday")}
        >
          Yesterday
        </Button>
        <Button
          variant={dateFilter === "last7days" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateFilter("last7days")}
        >
          Last 7 Days
        </Button>
        <Button
          variant={dateFilter === "last30days" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateFilter("last30days")}
        >
          Last 30 Days
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="border-l-4 border-l-gray-300">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Total Orders
                </p>
                <div className="text-xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </div>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Received
                </p>
                <div className="text-xl font-bold text-blue-600">
                  {receivedOrders}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pending fulfillment
                </p>
              </div>
              <Clock className="h-4 w-4 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-400">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Fulfilled
                </p>
                <div className="text-xl font-bold text-green-600">
                  {fulfilledOrders}
                </div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-400">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Cancelled
                </p>
                <div className="text-xl font-bold text-red-600">
                  {cancelledOrders}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cancelled orders
                </p>
              </div>
              <AlertCircle className="h-4 w-4 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-400">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Revenue
                </p>
                <div className="text-xl font-bold">
                  €{totalRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Total revenue</p>
              </div>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Order Management</CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings2 className="mr-2 h-4 w-4" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.orderID}
                    onCheckedChange={() => toggleColumn("orderID")}
                  >
                    Order ID
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.customer}
                    onCheckedChange={() => toggleColumn("customer")}
                  >
                    Customer
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.amount}
                    onCheckedChange={() => toggleColumn("amount")}
                  >
                    Amount
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.status}
                    onCheckedChange={() => toggleColumn("status")}
                  >
                    Status
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.date}
                    onCheckedChange={() => toggleColumn("date")}
                  >
                    Date & Time
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.actions}
                    onCheckedChange={() => toggleColumn("actions")}
                  >
                    Actions
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm">
                All Orders
              </Button>
              <Button
                onClick={handleDownloadOrders}
                variant="outline"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Orders
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CrudDataTable<Order>
            data={filteredAndSortedOrders}
            loading={loading}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            getRowKey={(order) => order.id}
            emptyIcon={<Package className="h-12 w-12 text-muted-foreground" />}
            emptyMessage="No orders found"
            pagination={
              pagination && pagination.totalPages > 1
                ? {
                    page: pagination.page,
                    totalPages: pagination.totalPages,
                    onPageChange: setPage,
                  }
                : undefined
            }
            columns={[
              ...(visibleColumns.orderID
                ? [
                    {
                      key: "orderID",
                      header: "Order ID",
                      sortable: true,
                      render: (order: Order) => (
                        <span className="font-medium">{order.orderID}</span>
                      ),
                    },
                  ]
                : []),
              ...(visibleColumns.customer
                ? [
                    {
                      key: "shippingName",
                      header: "Customer",
                      sortable: true,
                    },
                  ]
                : []),
              ...(visibleColumns.amount
                ? [
                    {
                      key: "payableAmount",
                      header: "Amount",
                      sortable: true,
                      render: (order: Order) => {
                        const symbol =
                          order.currencyPayment === "EUR"
                            ? "€"
                            : order.currencyPayment === "GBP"
                            ? "£"
                            : order.currencyPayment === "USD"
                            ? "$"
                            : order.currencyPayment === "INR"
                            ? "₹"
                            : `${order.currencyPayment} `;
                        return `${symbol}${order.payableAmount.toFixed(2)}`;
                      },
                    },
                  ]
                : []),
              ...(visibleColumns.status
                ? [
                    {
                      key: "orderStatus",
                      header: "Status",
                      sortable: true,
                      render: (order: Order) =>
                        getStatusBadge(order.orderStatus),
                    },
                  ]
                : []),
              ...(visibleColumns.date
                ? [
                    {
                      key: "createdAt",
                      header: "Date & Time",
                      sortable: true,
                      render: (order: Order) => {
                        const date = new Date(order.createdAt);
                        if (isNaN(date.getTime())) {
                          return (
                            <div className="text-sm text-muted-foreground">
                              Invalid date
                            </div>
                          );
                        }
                        return (
                          <div className="text-sm">
                            <div>{format(date, "MMM dd, yyyy")}</div>
                            <div className="text-muted-foreground">
                              {format(date, "h:mm a")}
                            </div>
                          </div>
                        );
                      },
                    },
                  ]
                : []),
              ...(visibleColumns.actions
                ? [
                    {
                      key: "actions",
                      header: "Actions",
                      render: (order: Order) => (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/dashboard/orders/${order.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
