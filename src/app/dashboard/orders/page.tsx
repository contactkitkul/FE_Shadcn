"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Search, Eye, Package, Download, CheckCircle, AlertCircle, Clock, DollarSign, Settings2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Order, EnumOrderStatus, EnumCurrency } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
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
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.orders.getAll({
        page: 1,
        limit: 100,
        sortBy: sortColumn,
        sortOrder: sortDirection,
        search: searchTerm,
      });

      if (response.success) {
        setOrders(response.data.data || []);
      } else {
        toast.error(getEntityMessages('orders').loadError);
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error(error.message || getEntityMessages('orders').loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortColumn, sortDirection, debouncedSearch]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const toggleColumn = (column: string) => {
    setVisibleColumns(prev => ({ 
      ...prev, 
      [column]: !prev[column as keyof typeof prev] 
    }));
  };

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortColumn as keyof Order];
      const bValue = b[sortColumn as keyof Order];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc" 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      return 0;
    });

  const getStatusBadge = (status: EnumOrderStatus) => {
    const variants: Record<EnumOrderStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      RECEIVED: { variant: "default", label: "Received" },
      PARTIALLY_FULFILLED: { variant: "secondary", label: "Partially Fulfilled" },
      FULFILLED: { variant: "default", label: "Fulfilled" },
      CANCELLED: { variant: "destructive", label: "Cancelled" },
      FULLY_REFUNDED: { variant: "outline", label: "Refunded" },
    };
    return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
  };

  const handleDownloadOrders = () => {
    const headers = ["Order ID", "Customer", "Amount", "Status", "Date"];
    const rows = filteredOrders.map(order => [
      order.orderID,
      order.shippingName,
      `€${order.payableAmount.toFixed(2)}`,
      order.orderStatus,
      format(order.createdAt, "MMM dd, yyyy")
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success(`Downloaded ${filteredOrders.length} orders`);
  };

  // Calculate stats
  const totalOrders = orders.length;
  const receivedOrders = orders.filter(o => o.orderStatus === EnumOrderStatus.RECEIVED).length;
  const fulfilledOrders = orders.filter(o => o.orderStatus === EnumOrderStatus.FULFILLED).length;
  const cancelledOrders = orders.filter(o => o.orderStatus === EnumOrderStatus.CANCELLED).length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.payableAmount, 0);

  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage and track customer orders</p>
        </div>
      </div>

      {/* Date Filter Buttons */}
      <div className="flex gap-1">
        <Button 
          variant={dateFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateFilter("all")}
          className={dateFilter === "all" ? "bg-pink-500 hover:bg-pink-600 text-white border-0" : ""}
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
      <div className="grid gap-3 grid-cols-5">
        <Card className="border-l-4 border-l-gray-300">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Orders</p>
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
                <p className="text-xs font-medium text-muted-foreground">Received</p>
                <div className="text-xl font-bold text-blue-600">{receivedOrders}</div>
                <p className="text-xs text-muted-foreground">Pending fulfillment</p>
              </div>
              <Clock className="h-4 w-4 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-400">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Fulfilled</p>
                <div className="text-xl font-bold text-green-600">{fulfilledOrders}</div>
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
                <p className="text-xs font-medium text-muted-foreground">Cancelled</p>
                <div className="text-xl font-bold text-red-600">{cancelledOrders}</div>
                <p className="text-xs text-muted-foreground">Cancelled orders</p>
              </div>
              <AlertCircle className="h-4 w-4 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-400">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Revenue</p>
                <div className="text-xl font-bold">€{totalRevenue.toFixed(2)}</div>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order Management</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-8 w-[300px]"
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
              <Button onClick={handleDownloadOrders} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Orders
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.orderID && (
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("orderID")}
                        className="h-auto p-0 font-semibold"
                      >
                        Order ID
                        {getSortIcon("orderID")}
                      </Button>
                    </TableHead>
                  )}
                  {visibleColumns.customer && (
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("shippingName")}
                        className="h-auto p-0 font-semibold"
                      >
                        Customer
                        {getSortIcon("shippingName")}
                      </Button>
                    </TableHead>
                  )}
                  {visibleColumns.amount && (
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("payableAmount")}
                        className="h-auto p-0 font-semibold"
                      >
                        Amount
                        {getSortIcon("payableAmount")}
                      </Button>
                    </TableHead>
                  )}
                  {visibleColumns.status && (
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("orderStatus")}
                        className="h-auto p-0 font-semibold"
                      >
                        Status
                        {getSortIcon("orderStatus")}
                      </Button>
                    </TableHead>
                  )}
                  {visibleColumns.date && (
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("createdAt")}
                        className="h-auto p-0 font-semibold"
                      >
                        Date & Time
                        {getSortIcon("createdAt")}
                      </Button>
                    </TableHead>
                  )}
                  {visibleColumns.actions && (
                    <TableHead>Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {visibleColumns.orderID && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                      {visibleColumns.customer && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                      {visibleColumns.amount && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                      {visibleColumns.status && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                      {visibleColumns.date && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                      {visibleColumns.actions && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                    </TableRow>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length} className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No orders found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                      {visibleColumns.orderID && <TableCell className="font-medium">{order.orderID}</TableCell>}
                      {visibleColumns.customer && <TableCell>{order.shippingName}</TableCell>}
                      {visibleColumns.amount && <TableCell>€{order.payableAmount.toFixed(2)}</TableCell>}
                      {visibleColumns.status && <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>}
                      {visibleColumns.date && (
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(order.createdAt, "MMM dd, yyyy")}</div>
                            <div className="text-muted-foreground">{format(order.createdAt, "h:mm a")}</div>
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.actions && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
