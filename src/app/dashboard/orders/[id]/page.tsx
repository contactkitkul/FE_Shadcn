"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Used in Add Item Dialog
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Check,
} from "lucide-react";
import { Order, EnumOrderStatus, EnumRiskChargeback } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";
// Address validation now handled by OrderAddressCard
// DropdownMenu moved to extracted components
import { Input } from "@/components/ui/input"; // Used in Add Item Dialog
import { Label } from "@/components/ui/label"; // Used in Add Item Dialog
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
import { api } from "@/lib/api";
import {
  OrderItemsCard,
  OrderTrackingCard,
  OrderAddressCard,
} from "@/components/orders";

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [showFulfillDialog, setShowFulfillDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await api.orders.getById(params.id);

        if (response.success && response.data) {
          const orderData = response.data;
          // Convert date strings to Date objects
          const formattedOrder: Order = {
            ...orderData,
            createdAt: new Date(orderData.createdAt),
            updatedAt: new Date(orderData.updatedAt),
            orderItems: orderData.orderItems?.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
              productVariant: item.productVariant
                ? {
                    ...item.productVariant,
                    createdAt: new Date(item.productVariant.createdAt),
                    updatedAt: new Date(item.productVariant.updatedAt),
                  }
                : undefined,
            })),
            payments: orderData.payments?.map((payment: any) => ({
              ...payment,
              createdAt: new Date(payment.createdAt),
              updatedAt: new Date(payment.updatedAt),
            })),
          };
          setOrder(formattedOrder);
        } else {
          toast.error("Failed to load order");
          router.push("/dashboard/orders");
        }
      } catch (error: any) {
        console.error("Error fetching order:", error);
        toast.error(error.message || "Failed to load order");
        router.push("/dashboard/orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id, router]);

  const getStatusBadge = (status: EnumOrderStatus) => {
    const config: Record<
      EnumOrderStatus,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
        color: string;
      }
    > = {
      RECEIVED: {
        variant: "secondary",
        label: "Unfulfilled",
        color: "bg-yellow-100 text-yellow-800",
      },
      PARTIALLY_FULFILLED: {
        variant: "secondary",
        label: "Partially Fulfilled",
        color: "bg-blue-100 text-blue-800",
      },
      FULFILLED: {
        variant: "default",
        label: "Fulfilled",
        color: "bg-green-100 text-green-800",
      },
      CANCELLED: {
        variant: "destructive",
        label: "Cancelled",
        color: "bg-red-100 text-red-800",
      },
      FULLY_REFUNDED: {
        variant: "outline",
        label: "Refunded",
        color: "bg-gray-100 text-gray-800",
      },
    };
    return config[status];
  };

  const getRiskBadge = (risk: EnumRiskChargeback) => {
    const config: Record<EnumRiskChargeback, { label: string; color: string }> =
      {
        EXTREMELY_SAFE: { label: "Low", color: "text-green-600" },
        SAFE: { label: "Low", color: "text-green-600" },
        MEDIUM: { label: "Medium", color: "text-yellow-600" },
        UNSAFE: { label: "High", color: "text-red-600" },
        EXTREMELY_UNSAFE: { label: "High", color: "text-red-600" },
      };
    return config[risk];
  };

  const handleStatusChange = async (newStatus: EnumOrderStatus) => {
    if (!order) return;

    try {
      await api.orders.updateStatus(order.id, newStatus);
      setOrder({ ...order, orderStatus: newStatus });
      toast.success("Order status updated successfully");
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error(error.message || "Failed to update order status");
    }
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      toast.success("Comment added to timeline");
      setComment("");
    }
  };

  const confirmFulfillment = async () => {
    await handleStatusChange(EnumOrderStatus.FULFILLED);
    setShowFulfillDialog(false);
  };

  const confirmCancellation = async () => {
    await handleStatusChange(EnumOrderStatus.CANCELLED);
    setShowCancelDialog(false);
  };

  if (loading || !order) {
    return <div className="flex-1 p-8">Loading...</div>;
  }

  const statusConfig = getStatusBadge(order.orderStatus);
  const riskConfig = getRiskBadge(order.riskChargeback);

  return (
    <div className="flex-1 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{order.orderID}</h2>
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Paid
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")} from
            Online Store
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCancelDialog(true)}
          >
            Cancel Order
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Refund functionality")}
          >
            Refund
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Card - Extracted Component */}
          <OrderItemsCard
            order={order}
            onOrderUpdate={setOrder}
            onAddItem={() => setShowAddItemDialog(true)}
            onDuplicateOrder={() =>
              router.push(`/dashboard/orders/new?duplicate=${order.id}`)
            }
          />

          {/* Tracking Card - Extracted Component */}
          <OrderTrackingCard
            orderId={order.id}
            onTrackingSaved={async () => {
              const response = await api.orders.getById(params.id);
              if (response.success && response.data) {
                setOrder(response.data);
              }
            }}
          />

          {/* Payment Status */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle className="text-base">Paid</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>€{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>€19.90</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>€{order.payableAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Paid</span>
                  <span>€{order.payableAmount.toFixed(2)}</span>
                </div>
                {order.payments && order.payments.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Transaction ID
                        </span>
                        <span className="font-mono">
                          {order.payments[0].transactionId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Payment Date
                        </span>
                        <span>
                          {format(
                            new Date(order.payments[0].createdAt),
                            "MMM d, yyyy h:mm a"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Payment Method
                        </span>
                        <span>{order.payments[0].paymentGateway}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Comment Input */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                    AS
                  </div>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Leave a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-muted-foreground">
                        Only you and other staff can see comments
                      </p>
                      <Button size="sm" onClick={handleAddComment}>
                        Post
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Timeline Events */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold">Today</div>

                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-foreground mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">
                        Order confirmation email was sent to{" "}
                        {order.shippingName} ({order.shippingEmail})
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(order.createdAt), "h:mm a")}
                      </p>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-sm"
                        onClick={() => toast.info("Email preview")}
                      >
                        View email
                      </Button>
                    </div>
                  </div>

                  {order.payments && order.payments.length > 0 && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-foreground mt-2" />
                      <div className="flex-1">
                        <p className="text-sm">
                          €{order.payments[0].amountPaid.toFixed(2)} EUR will be
                          added to your Nov 14, 2025 payout
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(order.createdAt), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.payments && order.payments.length > 0 && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-foreground mt-2" />
                      <div className="flex-1">
                        <p className="text-sm">
                          A €{order.payments[0].amountPaid.toFixed(2)} EUR
                          payment was processed using a{" "}
                          {order.payments[0].paymentGateway} ending in{" "}
                          {order.payments[0].transactionId}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(
                            new Date(order.payments[0].createdAt),
                            "h:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-foreground mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">
                        Confirmation #{order.orderID.split("@")[1]} was
                        generated for this order
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(order.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {order.notes || "No notes from customer"}
              </p>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-blue-600 cursor-pointer hover:underline">
                  {order.shippingName}
                </p>
                <p className="text-sm text-muted-foreground">1 order</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Contact information</p>
                <div className="space-y-1">
                  <p className="text-sm text-blue-600 cursor-pointer hover:underline">
                    {order.shippingEmail}
                  </p>
                  {order.shippingPhone && (
                    <p className="text-sm">{order.shippingPhone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address - Extracted Component */}
          <OrderAddressCard order={order} onOrderUpdate={setOrder} />

          {/* Conversion Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Conversion summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>This is their 1st order</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>1st session from an unknown source</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>1 session over 1 day</span>
              </div>
              <Button variant="link" className="h-auto p-0 text-sm">
                View conversion details
              </Button>
            </CardContent>
          </Card>

          {/* Order Risk */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      order.riskChargeback ===
                        EnumRiskChargeback.EXTREMELY_SAFE ||
                      order.riskChargeback === EnumRiskChargeback.SAFE
                        ? "bg-green-500 w-1/4"
                        : order.riskChargeback === EnumRiskChargeback.MEDIUM
                        ? "bg-yellow-500 w-1/2"
                        : "bg-red-500 w-3/4"
                    }`}
                  />
                </div>
                <span className={`text-sm font-medium ${riskConfig.color}`}>
                  {riskConfig.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Chargeback risk is low. You can fulfill this order.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog open={showFulfillDialog} onOpenChange={setShowFulfillDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Order as Fulfilled?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the order as fulfilled and notify the customer with
              tracking information. This action can be reversed if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFulfillment}>
              <Check className="h-4 w-4 mr-2" />
              Confirm Fulfillment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action will
              notify the customer and may trigger a refund process.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancellation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item to Order</DialogTitle>
            <DialogDescription>
              Add a new item to order #{order?.orderID}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newItem = {
                id: `new-${Date.now()}`,
                createdAt: new Date(),
                updatedAt: new Date(),
                orderId: order?.id || "",
                productVariantId: "variant-1", // This would come from product selection
                customisationString:
                  (formData.get("customisation") as string) || undefined,
                customisationPrice:
                  parseFloat(formData.get("customisationPrice") as string) || 0,
                noStockStatus: "NONE" as any,
                quantity: parseInt(formData.get("quantity") as string) || 1,
              };

              if (order) {
                setOrder({
                  ...order,
                  orderItems: [...(order.orderItems || []), newItem],
                });
                toast.success("Item added to order successfully");
                setShowAddItemDialog(false);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select name="product" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portugal-2004-away">
                    2004 Portugal 2a Equipacion
                  </SelectItem>
                  <SelectItem value="spain-2010-home">
                    2010 Spain Home Jersey
                  </SelectItem>
                  <SelectItem value="brazil-2002-home">
                    2002 Brazil Home Jersey
                  </SelectItem>
                  <SelectItem value="france-1998-home">
                    1998 France Home Jersey
                  </SelectItem>
                  <SelectItem value="italy-2006-home">
                    2006 Italy Home Jersey
                  </SelectItem>
                  <SelectItem value="germany-2014-home">
                    2014 Germany Home Jersey
                  </SelectItem>
                  <SelectItem value="argentina-1986-home">
                    1986 Argentina Home Jersey
                  </SelectItem>
                  <SelectItem value="netherlands-1988-home">
                    1988 Netherlands Home Jersey
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Select name="size" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue="1"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customisation">Customisation (Optional)</Label>
              <Input
                id="customisation"
                name="customisation"
                placeholder="Player name, number, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customisationPrice">
                Customisation Price (€)
              </Label>
              <Input
                id="customisationPrice"
                name="customisationPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddItemDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
