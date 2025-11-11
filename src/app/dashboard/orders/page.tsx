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
import { Search, Eye, Package, TrendingUp } from "lucide-react";
import { Order, EnumOrderStatus, EnumCurrency } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                orders.filter((o) => o.orderStatus === EnumOrderStatus.RECEIVED)
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting fulfillment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fulfilled</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                orders.filter(
                  (o) => o.orderStatus === EnumOrderStatus.FULFILLED
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £{orders.reduce((sum, o) => sum + o.payableAmount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total order value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order Management</CardTitle>
            </div>
            <div className="flex items-center gap-2">
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
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
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
                      <TableCell className="font-medium">
                        {order.orderID}
                      </TableCell>
                      <TableCell>{order.shippingName}</TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {order.currencyPayment === EnumCurrency.GBP ? "£" : "€"}
                        {order.payableAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
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
