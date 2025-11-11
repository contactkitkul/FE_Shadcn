"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Package, TrendingUp, Download, Calendar, DollarSign, XCircle, ArrowUpDown, ArrowUp, ArrowDown, Settings2 } from "lucide-react";
import { Order, EnumOrderStatus, EnumCurrency } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [statusChangeDialog, setStatusChangeDialog] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    orderId: string;
    newStatus: EnumOrderStatus;
  } | null>(null);

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      const mockOrders: Order[] = [
        {
          id: "1",
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date(),
          shippingName: "John Doe",
          shippingPhone: "+1234567890",
          shippingLine1: "123 Main St",
          shippingCity: "London",
          shippingState: "England",
          shippingPostalCode: "SW1A 1AA",
          shippingCountry: "UK",
          shippingEmail: "john@example.com",
          orderID: "ORD-2024-001",
          orderStatus: EnumOrderStatus.RECEIVED,
          customerId: "cust1",
          totalAmount: 89.99,
          discountAmount: 0,
          payableAmount: 89.99,
          currencyPayment: EnumCurrency.GBP,
          riskChargeback: "SAFE" as any,
        },
        {
          id: "2",
          createdAt: new Date("2024-01-14"),
          updatedAt: new Date(),
          shippingName: "Jane Smith",
          shippingPhone: "+1234567891",
          shippingLine1: "456 Oak Ave",
          shippingCity: "Manchester",
          shippingState: "England",
          shippingPostalCode: "M1 1AA",
          shippingCountry: "UK",
          shippingEmail: "jane@example.com",
          orderID: "ORD-2024-002",
          orderStatus: EnumOrderStatus.FULFILLED,
          customerId: "cust2",
          totalAmount: 129.99,
          discountAmount: 10,
          payableAmount: 119.99,
          currencyPayment: EnumCurrency.GBP,
          riskChargeback: "EXTREMELY_SAFE" as any,
        },
      ];
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const toggleColumn = (column: string) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column as keyof typeof prev] }));
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.orderStatus === statusFilter;
    
    // Date filtering
    let matchesDate = true;
    if (dateFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      
      if (dateFilter === "today") {
        matchesDate = orderDate.getTime() === today.getTime();
      } else if (dateFilter === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        matchesDate = orderDate.getTime() === yesterday.getTime();
      } else if (dateFilter === "last7days") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = orderDate >= weekAgo;
      } else if (dateFilter === "last30days") {
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        matchesDate = orderDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case "orderID":
        aValue = a.orderID;
        bValue = b.orderID;
        break;
      case "customer":
        aValue = a.shippingName;
        bValue = b.shippingName;
        break;
      case "amount":
        aValue = a.payableAmount;
        bValue = b.payableAmount;
        break;
      case "status":
        aValue = a.orderStatus;
        bValue = b.orderStatus;
        break;
      case "createdAt":
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

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

  const handleStatusChange = (orderId: string, newStatus: EnumOrderStatus) => {
    setPendingStatusChange({ orderId, newStatus });
    setStatusChangeDialog(true);
  };

  const confirmStatusChange = () => {
    if (!pendingStatusChange) return;

    setOrders(
      orders.map((order) =>
        order.id === pendingStatusChange.orderId
          ? { ...order, orderStatus: pendingStatusChange.newStatus }
          : order
      )
    );
    toast.success("Order status updated successfully");
    setStatusChangeDialog(false);
    setPendingStatusChange(null);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleDownloadOrders = () => {
    // Create CSV content
    const headers = ["Order ID", "Customer", "Amount", "Status", "Date"];
    const rows = filteredOrders.map(order => [
      order.orderID,
      order.shippingName,
      `${order.currencyPayment === EnumCurrency.GBP ? "£" : "€"}${order.payableAmount.toFixed(2)}`,
      order.orderStatus,
      format(order.createdAt, "yyyy-MM-dd HH:mm:ss")
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Download file
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{receivedOrders}</div>
            <p className="text-xs text-muted-foreground">Pending fulfillment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fulfilled</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fulfilledOrders}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{cancelledOrders}</div>
            <p className="text-xs text-muted-foreground">Cancelled orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
        <Button onClick={handleDownloadOrders} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Orders
        </Button>
      </div>

      {/* Date Filters */}
      <div className="flex gap-2">
        <Button 
          variant={dateFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateFilter("all")}
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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
        <Button onClick={handleDownloadOrders} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Orders
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order Management</CardTitle>
            </div>
            <div className="flex items-center gap-2">
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
                </DropdownMenuContent>
              </DropdownMenu>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="RECEIVED">Received</SelectItem>
                  <SelectItem value="PARTIALLY_FULFILLED">
                    Partially Fulfilled
                  </SelectItem>
                  <SelectItem value="FULFILLED">Fulfilled</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-8 w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.orderID && (
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                        onClick={() => handleSort("orderID")}
                      >
                        Order ID
                        {sortColumn === "orderID" && (
                          sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortColumn !== "orderID" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                  )}
                  {visibleColumns.customer && (
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                        onClick={() => handleSort("customer")}
                      >
                        Customer
                        {sortColumn === "customer" && (
                          sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortColumn !== "customer" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                  )}
                  {visibleColumns.amount && (
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                        onClick={() => handleSort("amount")}
                      >
                        Amount
                        {sortColumn === "amount" && (
                          sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortColumn !== "amount" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                  )}
                  {visibleColumns.status && (
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                        onClick={() => handleSort("status")}
                      >
                        Status
                        {sortColumn === "status" && (
                          sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortColumn !== "status" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                  )}
                  {visibleColumns.date && (
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                        onClick={() => handleSort("createdAt")}
                      >
                        Date & Time
                        {sortColumn === "createdAt" && (
                          sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortColumn !== "createdAt" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                  )}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No orders found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        router.push(`/dashboard/orders/${order.id}`)
                      }
                    >
                      {visibleColumns.orderID && (
                        <TableCell className="font-medium">
                          {order.orderID}
                        </TableCell>
                      )}
                      {visibleColumns.customer && (
                        <TableCell>{order.shippingName}</TableCell>
                      )}
                      {visibleColumns.amount && (
                        <TableCell>
                          {order.currencyPayment === EnumCurrency.GBP ? "£" : "€"}
                          {order.payableAmount.toFixed(2)}
                        </TableCell>
                      )}
                      {visibleColumns.status && (
                        <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                      )}
                      {visibleColumns.date && (
                        <TableCell>
                          {format(order.createdAt, "MMM dd, yyyy")}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {format(order.createdAt, "h:mm a")}
                          </span>
                        </TableCell>
                      )}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/orders/${order.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={order.orderStatus}
                            onValueChange={(value) =>
                              handleStatusChange(
                                order.id,
                                value as EnumOrderStatus
                              )
                            }
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="RECEIVED">Received</SelectItem>
                              <SelectItem value="PARTIALLY_FULFILLED">
                                Partially Fulfilled
                              </SelectItem>
                              <SelectItem value="FULFILLED">
                                Fulfilled
                              </SelectItem>
                              <SelectItem value="CANCELLED">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>{selectedOrder?.orderID}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <p className="text-sm text-muted-foreground">
                    Name: {selectedOrder.shippingName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Email: {selectedOrder.shippingEmail}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Phone: {selectedOrder.shippingPhone}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Shipping Address</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.shippingLine1}
                  </p>
                  {selectedOrder.shippingLine2 && (
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.shippingLine2}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.shippingCity}, {selectedOrder.shippingState}{" "}
                    {selectedOrder.shippingPostalCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.shippingCountry}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Order Summary</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>£{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span>-£{selectedOrder.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>£{selectedOrder.payableAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={statusChangeDialog} onOpenChange={setStatusChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the order status to{" "}
              <span className="font-semibold">
                {pendingStatusChange?.newStatus.replace(/_/g, " ")}
              </span>
              ? This action will update the order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatusChange(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
