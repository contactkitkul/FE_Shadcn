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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  Copy,
  Edit,
  X,
} from "lucide-react";
import {
  Order,
  EnumOrderStatus,
  EnumCurrency,
  EnumRiskChargeback,
  EnumNoStockStatus,
} from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { validateAddress, type Address } from "@/lib/address-validation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [trackingRows, setTrackingRows] = useState([
    { provider: "", trackingNumber: "" },
  ]);
  const [showFulfillDialog, setShowFulfillDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [addressValidation, setAddressValidation] = useState<ReturnType<
    typeof validateAddress
  > | null>(null);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemValues, setEditingItemValues] = useState<{
    quantity: number;
    customisationString?: string;
    customisationPrice: number;
  }>({ quantity: 1, customisationPrice: 0 });
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressValues, setAddressValues] = useState({
    shippingName: "",
    shippingLine1: "",
    shippingLine2: "",
    shippingCity: "",
    shippingState: "",
    shippingPostalCode: "",
    shippingCountry: "",
    shippingPhone: "",
    shippingEmail: "",
  });

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

          // Validate address
          const addressToValidate: Address = {
            line1: formattedOrder.shippingLine1,
            line2: formattedOrder.shippingLine2,
            city: formattedOrder.shippingCity,
            state: formattedOrder.shippingState,
            postalCode: formattedOrder.shippingPostalCode,
            country: formattedOrder.shippingCountry,
            name: formattedOrder.shippingName,
          };
          const validation = validateAddress(addressToValidate);
          setAddressValidation(validation);

          if (!validation.isValid) {
            toast.error("Address validation failed - please review");
          } else if (validation.warnings.length > 0) {
            toast.warning("Address has warnings - please review");
          }
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

  const handleAddTrackingRow = () => {
    setTrackingRows([...trackingRows, { provider: "", trackingNumber: "" }]);
  };

  const handleRemoveTrackingRow = (index: number) => {
    setTrackingRows(trackingRows.filter((_, i) => i !== index));
  };

  const handleTrackingChange = (
    index: number,
    field: "provider" | "trackingNumber",
    value: string
  ) => {
    const updated = [...trackingRows];
    updated[index][field] = value;
    setTrackingRows(updated);
  };

  const handleSaveTracking = async () => {
    const validTracking = trackingRows.filter(
      (row) => row.provider && row.trackingNumber
    );
    if (validTracking.length === 0) {
      toast.error("Please add at least one tracking detail");
      return;
    }

    try {
      let successCount = 0;
      for (const row of validTracking) {
        try {
          await api.orders.addTracking(params.id, row.trackingNumber);
          successCount++;
        } catch (error: any) {
          // Skip if tracking already exists
          if (!error.message?.includes("already exists")) {
            throw error;
          }
        }
      }
      if (successCount > 0) {
        toast.success(`${successCount} tracking detail(s) saved`);
      } else {
        toast.info("All tracking numbers already exist");
      }
    } catch (error: any) {
      console.error("Error saving tracking:", error);
      toast.error(error.message || "Failed to save tracking");
    }
  };

  const getTrackingUrl = (provider: string, trackingNumber: string): string => {
    const urls: Record<string, string> = {
      DHL: `https://www.dhl.com/track?tracking-id=${trackingNumber}`,
      FedEx: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      UPS: `https://www.ups.com/track?tracknum=${trackingNumber}`,
      "Royal Mail": `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`,
      USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    };
    return urls[provider] || "#";
  };

  const handleMarkAsFulfilled = () => {
    const validTracking = trackingRows.filter(
      (row) => row.provider && row.trackingNumber
    );
    if (validTracking.length === 0) {
      toast.error(
        "Please add tracking information before marking as fulfilled"
      );
      return;
    }
    setShowFulfillDialog(true);
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
          {/* Fulfillment Status */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <CardTitle className="text-base">
                  {statusConfig.label}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {order.orderItems?.map((item, index) => (
                    <div
                      key={item.id}
                      className={
                        item.noStockStatus === EnumNoStockStatus.OUT_OF_STOCK
                          ? "opacity-50"
                          : ""
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">
                              2004 Portugal 2a Equipacion
                              {item.noStockStatus ===
                                EnumNoStockStatus.OUT_OF_STOCK && (
                                <Badge variant="destructive" className="ml-2">
                                  Cancelled
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              S / Sin parche
                            </p>
                            {item.customisationString && (
                              <p className="text-sm text-muted-foreground">
                                ✓ {item.customisationString}
                              </p>
                            )}
                            {/* Stock Status Dropdown */}
                            <div className="mt-2">
                              <Select
                                value={item.noStockStatus}
                                onValueChange={(value) => {
                                  if (!order) return;
                                  const updatedItems = order.orderItems?.map(
                                    (i) =>
                                      i.id === item.id
                                        ? {
                                            ...i,
                                            noStockStatus:
                                              value as EnumNoStockStatus,
                                          }
                                        : i
                                  );
                                  setOrder({
                                    ...order,
                                    orderItems: updatedItems,
                                  });
                                  toast.success("Stock status updated");
                                }}
                              >
                                <SelectTrigger className="w-[180px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="NONE">
                                    Stock: None
                                  </SelectItem>
                                  <SelectItem value="OUT_OF_STOCK">
                                    Out of Stock
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          {editingItemId === item.id ? (
                            <div className="space-y-2">
                              <div className="flex gap-2 items-center">
                                <Label className="text-xs">Qty:</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={editingItemValues.quantity}
                                  onChange={(e) =>
                                    setEditingItemValues({
                                      ...editingItemValues,
                                      quantity: parseInt(e.target.value) || 1,
                                    })
                                  }
                                  className="w-16 h-8"
                                />
                              </div>
                              <div className="flex gap-2 items-center">
                                <Label className="text-xs">Custom:</Label>
                                <Input
                                  value={
                                    editingItemValues.customisationString || ""
                                  }
                                  onChange={(e) =>
                                    setEditingItemValues({
                                      ...editingItemValues,
                                      customisationString: e.target.value,
                                    })
                                  }
                                  className="w-24 h-8"
                                  placeholder="Custom"
                                />
                              </div>
                              <div className="flex gap-2 items-center">
                                <Label className="text-xs">Price:</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editingItemValues.customisationPrice}
                                  onChange={(e) =>
                                    setEditingItemValues({
                                      ...editingItemValues,
                                      customisationPrice:
                                        parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-20 h-8"
                                />
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (!order) return;
                                    const updatedItems = order.orderItems?.map(
                                      (i) =>
                                        i.id === item.id
                                          ? {
                                              ...i,
                                              quantity:
                                                editingItemValues.quantity,
                                              customisationString:
                                                editingItemValues.customisationString,
                                              customisationPrice:
                                                editingItemValues.customisationPrice,
                                            }
                                          : i
                                    );
                                    setOrder({
                                      ...order,
                                      orderItems: updatedItems,
                                    });
                                    setEditingItemId(null);
                                    toast.success("Item updated successfully");
                                  }}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingItemId(null)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="font-medium">
                                  €{item.productVariant?.sellPrice.toFixed(2)} ×{" "}
                                  {item.quantity}
                                </p>
                                <p className="text-sm font-semibold">
                                  €
                                  {(
                                    (item.productVariant?.sellPrice || 0) *
                                    item.quantity
                                  ).toFixed(2)}
                                </p>
                                {(item.customisationPrice || 0) > 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    +€
                                    {(item.customisationPrice || 0).toFixed(
                                      2
                                    )}{" "}
                                    custom
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingItemId(item.id);
                                    setEditingItemValues({
                                      quantity: item.quantity,
                                      customisationString:
                                        item.customisationString,
                                      customisationPrice:
                                        item.customisationPrice || 0,
                                    });
                                  }}
                                  title="Edit item"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    if (!order) return;
                                    const updatedItems = order.orderItems?.map(
                                      (i) =>
                                        i.id === item.id
                                          ? {
                                              ...i,
                                              noStockStatus:
                                                EnumNoStockStatus.OUT_OF_STOCK,
                                            }
                                          : i
                                    );
                                    setOrder({
                                      ...order,
                                      orderItems: updatedItems,
                                    });
                                    toast.success("Item marked as cancelled");
                                  }}
                                  title="Mark item as cancelled"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      {index < (order.orderItems?.length || 0) - 1 && (
                        <Separator className="mt-3" />
                      )}
                    </div>
                  ))}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddItemDialog(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (order) {
                          router.push(
                            `/dashboard/orders/new?duplicate=${order.id}`
                          );
                        }
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate Order
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Tracking Information */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Tracking Information
                  </Label>
                  {trackingRows.map((row, index) => (
                    <div key={index} className="flex gap-2">
                      <Select
                        value={row.provider}
                        onValueChange={(value) =>
                          handleTrackingChange(index, "provider", value)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DHL">DHL</SelectItem>
                          <SelectItem value="FedEx">FedEx</SelectItem>
                          <SelectItem value="UPS">UPS</SelectItem>
                          <SelectItem value="Royal Mail">Royal Mail</SelectItem>
                          <SelectItem value="USPS">USPS</SelectItem>
                          <SelectItem value="La Poste">La Poste</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Tracking number"
                        value={row.trackingNumber}
                        onChange={(e) =>
                          handleTrackingChange(
                            index,
                            "trackingNumber",
                            e.target.value
                          )
                        }
                        className="flex-1"
                      />
                      {row.provider && row.trackingNumber && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            window.open(
                              getTrackingUrl(row.provider, row.trackingNumber),
                              "_blank"
                            )
                          }
                          title="Track shipment"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {trackingRows.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveTrackingRow(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTrackingRow}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tracking
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSaveTracking}
                    className="flex-1"
                  >
                    Save Tracking
                  </Button>
                  <Button onClick={handleMarkAsFulfilled} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Fulfilled
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Shipping address</p>
                  {!editingAddress ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingAddress(true);
                        setAddressValues({
                          shippingName: order.shippingName,
                          shippingLine1: order.shippingLine1,
                          shippingLine2: order.shippingLine2 || "",
                          shippingCity: order.shippingCity,
                          shippingState: order.shippingState,
                          shippingPostalCode: order.shippingPostalCode,
                          shippingCountry: order.shippingCountry,
                          shippingPhone: order.shippingPhone || "",
                          shippingEmail: order.shippingEmail,
                        });
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => {
                          setOrder({
                            ...order,
                            ...addressValues,
                            updatedAt: new Date(),
                          });
                          setEditingAddress(false);
                          toast.success("Address updated successfully");

                          // Re-validate address
                          const addressToValidate = {
                            line1: addressValues.shippingLine1,
                            line2: addressValues.shippingLine2,
                            city: addressValues.shippingCity,
                            state: addressValues.shippingState,
                            postalCode: addressValues.shippingPostalCode,
                            country: addressValues.shippingCountry,
                            name: addressValues.shippingName,
                          };
                          const validation = validateAddress(addressToValidate);
                          setAddressValidation(validation);
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingAddress(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {editingAddress ? (
                  <div className="space-y-2">
                    <Input
                      value={addressValues.shippingName}
                      onChange={(e) =>
                        setAddressValues({
                          ...addressValues,
                          shippingName: e.target.value,
                        })
                      }
                      placeholder="Full Name"
                      className="text-sm"
                    />
                    <Input
                      value={addressValues.shippingLine1}
                      onChange={(e) =>
                        setAddressValues({
                          ...addressValues,
                          shippingLine1: e.target.value,
                        })
                      }
                      placeholder="Address Line 1"
                      className="text-sm"
                    />
                    <Input
                      value={addressValues.shippingLine2}
                      onChange={(e) =>
                        setAddressValues({
                          ...addressValues,
                          shippingLine2: e.target.value,
                        })
                      }
                      placeholder="Address Line 2 (Optional)"
                      className="text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={addressValues.shippingPostalCode}
                        onChange={(e) =>
                          setAddressValues({
                            ...addressValues,
                            shippingPostalCode: e.target.value,
                          })
                        }
                        placeholder="Postal Code"
                        className="text-sm"
                      />
                      <Input
                        value={addressValues.shippingCity}
                        onChange={(e) =>
                          setAddressValues({
                            ...addressValues,
                            shippingCity: e.target.value,
                          })
                        }
                        placeholder="City"
                        className="text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={addressValues.shippingState}
                        onChange={(e) =>
                          setAddressValues({
                            ...addressValues,
                            shippingState: e.target.value,
                          })
                        }
                        placeholder="State/Province"
                        className="text-sm"
                      />
                      <Input
                        value={addressValues.shippingCountry}
                        onChange={(e) =>
                          setAddressValues({
                            ...addressValues,
                            shippingCountry: e.target.value,
                          })
                        }
                        placeholder="Country"
                        className="text-sm"
                      />
                    </div>
                    <Input
                      value={addressValues.shippingPhone}
                      onChange={(e) =>
                        setAddressValues({
                          ...addressValues,
                          shippingPhone: e.target.value,
                        })
                      }
                      placeholder="Phone Number"
                      className="text-sm"
                    />
                    <Input
                      value={addressValues.shippingEmail}
                      onChange={(e) =>
                        setAddressValues({
                          ...addressValues,
                          shippingEmail: e.target.value,
                        })
                      }
                      placeholder="Email Address"
                      className="text-sm"
                    />
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p>{order.shippingName}</p>
                    <p>{order.shippingLine1}</p>
                    {order.shippingLine2 && <p>{order.shippingLine2}</p>}
                    <p>
                      {order.shippingPostalCode} {order.shippingCity}
                    </p>
                    <p>
                      {order.shippingState}, {order.shippingCountry}
                    </p>
                    <p>{order.shippingPhone}</p>
                    <p className="text-blue-600">{order.shippingEmail}</p>
                  </div>
                )}

                {/* Address Validation Results */}
                {addressValidation && (
                  <div className="mt-3 space-y-2">
                    {addressValidation.errors.length > 0 && (
                      <div className="rounded-md bg-destructive/10 p-2">
                        <p className="text-xs font-medium text-destructive mb-1">
                          Address Errors:
                        </p>
                        {addressValidation.errors.map((error, idx) => (
                          <p key={idx} className="text-xs text-destructive">
                            • {error}
                          </p>
                        ))}
                      </div>
                    )}
                    {addressValidation.warnings.length > 0 && (
                      <div className="rounded-md bg-yellow-50 p-2">
                        <p className="text-xs font-medium text-yellow-800 mb-1">
                          Address Warnings:
                        </p>
                        {addressValidation.warnings.map((warning, idx) => (
                          <p key={idx} className="text-xs text-yellow-700">
                            • {warning}
                          </p>
                        ))}
                      </div>
                    )}
                    {addressValidation.isValid &&
                      addressValidation.warnings.length === 0 && (
                        <div className="rounded-md bg-green-50 p-2">
                          <p className="text-xs text-green-700">
                            ✓ Address validated successfully
                          </p>
                        </div>
                      )}
                  </div>
                )}

                <Button variant="link" className="h-auto p-0 text-sm mt-2">
                  View map
                </Button>
              </div>
              <Separator />
            </CardContent>
          </Card>

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
