"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
// Card components removed - using simple divs for compact layout
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// Textarea removed - using Input for compact comment
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
import {
  Order,
  EnumOrderStatus,
  EnumRiskChargeback,
  EnumCurrency,
} from "@/types";
import { useAuth } from "@/hooks/useAuth";
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
import { OrderTrackingCard } from "@/components/orders";

// Currency symbol helper
const getCurrencySymbol = (currency: EnumCurrency): string => {
  const symbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    INR: "₹",
    JPY: "¥",
    CHF: "CHF ",
    AED: "AED ",
    AUD: "A$",
    CAD: "C$",
    CNY: "¥",
    HKD: "HK$",
    SGD: "S$",
  };
  return symbols[currency] || `${currency} `;
};

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { getUser } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [showFulfillDialog, setShowFulfillDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productVariants, setProductVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [addingItem, setAddingItem] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [orderNotes, setOrderNotes] = useState<any[]>([]);
  const [addingNote, setAddingNote] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
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
  const [productSearch, setProductSearch] = useState("");
  const [duplicatingItem, setDuplicatingItem] = useState<string | null>(null);

  // Local state for order items - for instant UI updates
  const [localItems, setLocalItems] = useState<any[]>([]);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newItemProduct, setNewItemProduct] = useState<any>(null);
  const [newItemVariant, setNewItemVariant] = useState<string>("");
  const [newItemVariants, setNewItemVariants] = useState<any[]>([]);
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemCustomisation, setNewItemCustomisation] = useState("");
  const [loadingNewVariants, setLoadingNewVariants] = useState(false);
  const [savingItems, setSavingItems] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemQty, setEditItemQty] = useState(1);
  const [editItemCustomisation, setEditItemCustomisation] = useState("");

  // Fetch products for Add Item dialog - with search support
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.products.getAll({ limit: 500 });
        if (response.success && response.data) {
          setProducts(response.data.data || response.data || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by search (name or SKU)
  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const search = productSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(search) ||
      p.sku?.toLowerCase().includes(search)
    );
  });

  // Sync local items with order items when order loads
  useEffect(() => {
    if (order?.orderItems) {
      setLocalItems(
        order.orderItems.map((item: any) => ({
          ...item,
          _isNew: false,
          _tempId: item.id,
        }))
      );
    }
  }, [order?.orderItems]);

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

          // Fetch notes for this order
          try {
            const notesResponse = await api.orderLogs.getAll({
              orderId: orderData.id,
              event: "NOTE_ADDED",
              limit: 50,
              sortOrder: "desc",
            });
            if (notesResponse.success && notesResponse.data) {
              setOrderNotes(
                notesResponse.data.data || notesResponse.data || []
              );
            }
          } catch (notesError) {
            console.error("Error fetching notes:", notesError);
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

  const handleAddComment = async () => {
    if (!comment.trim() || !order) return;

    setAddingNote(true);
    try {
      const user = getUser();
      const response = await api.orderLogs.create({
        orderId: order.id,
        event: "NOTE_ADDED",
        actorType: "ADMIN",
        actorId: user?.id,
        details: { note: comment.trim() },
      });

      if (response.success) {
        // Add to local notes list
        setOrderNotes((prev) => [
          {
            id: response.data?.id || Date.now().toString(),
            createdAt: new Date(),
            details: { note: comment.trim() },
            actorId: user?.id,
          },
          ...prev,
        ]);
        toast.success("Note added successfully");
        setComment("");
      } else {
        toast.error(response.error || "Failed to add note");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add note");
    } finally {
      setAddingNote(false);
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

  // Handle address save
  const handleSaveAddress = async () => {
    if (!order) return;
    setSavingAddress(true);
    try {
      await api.orders.update(order.id, addressForm);
      setOrder({ ...order, ...addressForm });
      setEditingAddress(false);
      toast.success("Address updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update address");
    } finally {
      setSavingAddress(false);
    }
  };

  // Start editing address
  const startEditingAddress = () => {
    if (!order) return;
    setAddressForm({
      shippingName: order.shippingName || "",
      shippingLine1: order.shippingLine1 || "",
      shippingLine2: order.shippingLine2 || "",
      shippingCity: order.shippingCity || "",
      shippingState: order.shippingState || "",
      shippingPostalCode: order.shippingPostalCode || "",
      shippingCountry: order.shippingCountry || "",
      shippingPhone: order.shippingPhone || "",
      shippingEmail: order.shippingEmail || "",
    });
    setEditingAddress(true);
  };

  // Handle instant duplicate item (COPY button) - adds to local state immediately
  const handleInstantCopy = (item: any) => {
    const newItem = {
      ...item,
      id: `temp-${Date.now()}`,
      _tempId: `temp-${Date.now()}`,
      _isNew: true,
      productVariantId: item.productVariantId,
    };
    setLocalItems((prev) => [...prev, newItem]);
    toast.success("Item copied - click SAVE to persist");
  };

  // Handle instant add item from inline row
  const handleInstantAdd = () => {
    if (!newItemProduct || !newItemVariant) {
      toast.error("Please select a product and variant");
      return;
    }

    const variant = newItemVariants.find((v: any) => v.id === newItemVariant);
    const newItem = {
      id: `temp-${Date.now()}`,
      _tempId: `temp-${Date.now()}`,
      _isNew: true,
      productVariantId: newItemVariant,
      quantity: newItemQty,
      customisationString: newItemCustomisation || null,
      customisationPrice: 0,
      status: "ACTIVE",
      productVariant: {
        ...variant,
        product: newItemProduct,
      },
    };

    setLocalItems((prev) => [...prev, newItem]);

    // Reset add row
    setNewItemProduct(null);
    setNewItemVariant("");
    setNewItemVariants([]);
    setNewItemQty(1);
    setNewItemCustomisation("");
    setShowAddRow(false);
    setProductSearch("");
    toast.success("Item added - click SAVE to persist");
  };

  // Handle remove item from local state
  const handleRemoveItem = (itemId: string) => {
    setLocalItems((prev) =>
      prev.filter((item) => item.id !== itemId && item._tempId !== itemId)
    );
    toast.success("Item removed - click SAVE to persist");
  };

  // Save all changes to backend
  const handleSaveAllItems = async () => {
    if (!order) return;
    setSavingItems(true);

    try {
      // Find new items to create
      const newItems = localItems.filter((item) => item._isNew);
      // Find removed items (items in order but not in local)
      const originalIds = new Set(
        order.orderItems?.map((i: any) => i.id) || []
      );
      const currentIds = new Set(
        localItems.filter((i) => !i._isNew).map((i) => i.id)
      );
      const removedIds = Array.from(originalIds).filter(
        (id) => !currentIds.has(id)
      );

      // Create new items
      for (const item of newItems) {
        await api.orderItems.create({
          orderId: order.id,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          customisationString: item.customisationString || undefined,
          customisationPrice: item.customisationPrice || 0,
        });
      }

      // Remove deleted items
      for (const id of removedIds) {
        await api.orderItems.delete(id);
      }

      // Refresh order data
      const orderResponse = await api.orders.getById(order.id);
      if (orderResponse.success && orderResponse.data) {
        const orderData = orderResponse.data;
        setOrder({
          ...orderData,
          createdAt: new Date(orderData.createdAt),
          updatedAt: new Date(orderData.updatedAt),
          orderItems: orderData.orderItems?.map((i: any) => ({
            ...i,
            createdAt: new Date(i.createdAt),
            updatedAt: new Date(i.updatedAt),
          })),
        });
      }

      toast.success("Changes saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes");
    } finally {
      setSavingItems(false);
    }
  };

  // Handle selecting a product for new item
  const handleSelectNewProduct = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setNewItemProduct(product);
    setNewItemVariant("");
    setNewItemVariants([]);

    if (product) {
      setLoadingNewVariants(true);
      try {
        const response = await api.products.getById(productId);
        if (response.success && response.data) {
          setNewItemVariants(response.data.ProductVariant || []);
        }
      } catch (error) {
        console.error("Error fetching variants:", error);
      } finally {
        setLoadingNewVariants(false);
      }
    }
  };

  // Start editing an item
  const startEditItem = (item: any) => {
    setEditingItemId(item._tempId || item.id);
    setEditItemQty(item.quantity);
    setEditItemCustomisation(item.customisationString || "");
  };

  // Save edited item
  const saveEditItem = async (item: any) => {
    // Update local state
    setLocalItems((prev) =>
      prev.map((i) =>
        (i._tempId || i.id) === (item._tempId || item.id)
          ? {
              ...i,
              quantity: editItemQty,
              customisationString: editItemCustomisation,
            }
          : i
      )
    );

    // Update in DB if not a new item
    if (!item._isNew && item.id) {
      try {
        await api.orderItems.update(item.id, {
          quantity: editItemQty,
          customisationString: editItemCustomisation || null,
        });
        toast.success("Item updated");
      } catch (error: any) {
        toast.error("Failed to update item");
      }
    }

    setEditingItemId(null);
  };

  if (loading || !order) {
    return <div className="flex-1 p-8">Loading...</div>;
  }

  const statusConfig = getStatusBadge(order.orderStatus);
  const riskConfig = getRiskBadge(order.riskChargeback);

  return (
    <div className="flex-1 p-4 lg:p-6">
      {/* Compact Header - responsive */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg lg:text-xl font-bold">{order.orderID}</h2>
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Paid
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs lg:text-sm text-muted-foreground hidden sm:inline">
            {format(new Date(order.createdAt), "MMM d, yyyy")}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCancelDialog(true)}
          >
            Cancel
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

      {/* Compact 3-column layout - responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column - Order Items + Timeline */}
        <div className="lg:col-span-6 space-y-4">
          {/* Order Items - State-based for instant updates */}
          <div className="border rounded-lg p-4">
            <div className="space-y-2">
              {localItems.map((item) => {
                const product = item.productVariant?.product;
                const productImage = product?.ProductImage?.[0];
                const imageUrl = productImage?.imageUrl;
                const thumbnailUrl = imageUrl?.includes("imagedelivery.net")
                  ? imageUrl.replace("/public", "/thumbnail")
                  : imageUrl;
                const isStrikethrough =
                  item.status === "OUT_OF_STOCK" || item.status === "CANCELLED";
                const isNew = item._isNew;
                const isEditing = editingItemId === (item._tempId || item.id);

                return (
                  <div
                    key={item._tempId || item.id}
                    className={`flex items-center gap-2 p-2 rounded ${
                      isStrikethrough ? "opacity-60" : ""
                    } ${
                      isNew
                        ? "bg-green-50 border border-green-200"
                        : isEditing
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-muted/30"
                    }`}
                  >
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt=""
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-muted rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-mono text-muted-foreground ${
                            isStrikethrough ? "line-through" : ""
                          }`}
                        >
                          {product?.sku || "N/A"}
                        </span>
                        <span
                          className={`text-sm font-medium truncate ${
                            isStrikethrough ? "line-through" : ""
                          }`}
                        >
                          {product?.name || "Unknown"}
                        </span>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            min="1"
                            value={editItemQty}
                            onChange={(e) =>
                              setEditItemQty(parseInt(e.target.value) || 1)
                            }
                            className="w-14 h-6 text-xs"
                          />
                          <Input
                            placeholder="Customisation"
                            value={editItemCustomisation}
                            onChange={(e) =>
                              setEditItemCustomisation(e.target.value)
                            }
                            className="flex-1 h-6 text-xs"
                          />
                          <Button
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => saveEditItem(item)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setEditingItemId(null)}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div
                          className={`flex items-center gap-2 text-xs text-muted-foreground ${
                            isStrikethrough ? "line-through" : ""
                          }`}
                        >
                          <span>
                            {item.productVariant?.size} /{" "}
                            {item.productVariant?.patch || "Sin parche"}
                          </span>
                          <span>× {item.quantity}</span>
                          {item.customisationString && (
                            <span className="text-blue-600">
                              ✏️ {item.customisationString}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {!isEditing && (
                      <>
                        {/* Status Dropdown */}
                        <Select
                          value={item.status || "ACTIVE"}
                          onValueChange={async (value) => {
                            // Update local state immediately
                            setLocalItems((prev) =>
                              prev.map((i) =>
                                (i._tempId || i.id) ===
                                (item._tempId || item.id)
                                  ? { ...i, status: value }
                                  : i
                              )
                            );
                            // Update in DB if not a new item
                            if (!item._isNew && item.id) {
                              try {
                                await api.orderItems.updateStatus(
                                  item.id,
                                  value
                                );
                                toast.success(`Status updated to ${value}`);
                              } catch (error: any) {
                                toast.error("Failed to update status");
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="w-[100px] h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="OUT_OF_STOCK">
                              Out of Stock
                            </SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => startEditItem(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleInstantCopy(item)}
                        >
                          COPY
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-destructive"
                          onClick={() =>
                            handleRemoveItem(item._tempId || item.id)
                          }
                        >
                          ✕
                        </Button>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Inline Add Row - Responsive */}
              {showAddRow && (
                <div className="p-2 border-2 border-dashed border-blue-300 rounded bg-blue-50 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <div className="relative flex-1 min-w-[150px]">
                      <Input
                        placeholder="Search by name or SKU..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="h-8 text-sm"
                      />
                      {productSearch &&
                        filteredProducts.length > 0 &&
                        !newItemProduct && (
                          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg max-h-[200px] overflow-auto">
                            {filteredProducts.slice(0, 15).map((p) => (
                              <div
                                key={p.id}
                                className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                                onClick={() => {
                                  handleSelectNewProduct(p.id);
                                  setProductSearch(p.name);
                                }}
                              >
                                <span className="font-medium">{p.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                    {newItemProduct && (
                      <Select
                        value={newItemVariant}
                        onValueChange={setNewItemVariant}
                        disabled={loadingNewVariants}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue
                            placeholder={loadingNewVariants ? "..." : "Variant"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {newItemVariants.map((v: any) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.size}
                              {v.patch ? ` / ${v.patch}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Input
                      type="number"
                      min="1"
                      value={newItemQty}
                      onChange={(e) =>
                        setNewItemQty(parseInt(e.target.value) || 1)
                      }
                      className="w-12 h-8 text-sm text-center"
                    />
                    <Input
                      placeholder="Customisation"
                      value={newItemCustomisation}
                      onChange={(e) => setNewItemCustomisation(e.target.value)}
                      className="flex-1 min-w-[100px] h-8 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      className="h-8 px-4"
                      onClick={handleInstantAdd}
                      disabled={!newItemVariant}
                    >
                      Add
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        setShowAddRow(false);
                        setNewItemProduct(null);
                        setNewItemVariant("");
                        setNewItemVariants([]);
                        setProductSearch("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {!showAddRow && (
              <div className="mt-3 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddRow(true)}
                >
                  + ADD
                </Button>
              </div>
            )}
          </div>

          {/* Compact Timeline */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Timeline</h3>
            <div className="flex gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold">
                {getUser()?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <Input
                placeholder="Leave a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && comment.trim()) {
                    handleAddComment();
                  }
                }}
                className="flex-1 h-8 text-sm"
              />
              <Button
                size="sm"
                className="h-8"
                onClick={handleAddComment}
                disabled={addingNote || !comment.trim()}
              >
                {addingNote ? "..." : "Post"}
              </Button>
            </div>

            {/* Display saved notes */}
            {orderNotes.length > 0 && (
              <div className="space-y-2 mb-3">
                {orderNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex gap-2 p-2 bg-yellow-50 rounded text-xs"
                  >
                    <span className="text-yellow-600">📝</span>
                    <div>
                      <p>{note.details?.note}</p>
                      <p className="text-muted-foreground">
                        {format(new Date(note.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator className="my-3" />
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Today
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <div>
                  <p>
                    Order confirmation email was sent to {order.shippingName} (
                    {order.shippingEmail})
                  </p>
                  <p className="text-muted-foreground">
                    {format(new Date(order.createdAt), "h:mm a")}
                  </p>
                  <Button variant="link" className="h-auto p-0 text-xs">
                    View email
                  </Button>
                </div>
              </div>
              {order.payments && order.payments.length > 0 && (
                <>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">•</span>
                    <div>
                      <p>
                        {getCurrencySymbol(order.currencyPayment)}
                        {order.totalAmount.toFixed(2)} {order.currencyPayment}{" "}
                        will be added to your payout
                      </p>
                      <p className="text-muted-foreground">
                        {format(new Date(order.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">•</span>
                    <div>
                      <p>
                        A {getCurrencySymbol(order.currencyPayment)}
                        {order.totalAmount.toFixed(2)} {order.currencyPayment}{" "}
                        payment was processed using{" "}
                        {order.payments[0].paymentGateway}
                      </p>
                      <p className="text-muted-foreground">
                        {format(
                          new Date(order.payments[0].createdAt),
                          "h:mm a"
                        )}
                      </p>
                    </div>
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <div>
                  <p>
                    Confirmation #{order.orderID.split("@")[1]} was generated
                    for this order
                  </p>
                  <p className="text-muted-foreground">
                    {format(new Date(order.createdAt), "h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Notes, Conversion, Risk */}
        <div className="lg:col-span-3 space-y-4">
          {/* Notes */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground">
              {order.notes || "No notes from customer"}
            </p>
          </div>

          {/* Conversion Summary */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Conversion summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>This is their 1st order</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-muted-foreground" />
                <span>1st session from an unknown source</span>
              </div>
            </div>
          </div>

          {/* Order Risk */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Order risk</h3>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div className="h-full bg-green-500 w-1/4" />
            </div>
            <p className="text-xs text-muted-foreground">
              Chargeback risk is low.
            </p>
          </div>

          {/* Payment Summary */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4" />
              <h3 className="font-medium">Paid</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal (EUR)</span>
                <span>€{order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping (EUR)</span>
                <span>€{(order.shippingFees ?? 0).toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total ({order.currencyPayment})</span>
                <span>
                  {getCurrencySymbol(order.currencyPayment)}
                  {order.payableAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Paid</span>
                <span>
                  {getCurrencySymbol(order.currencyPayment)}
                  {order.payableAmount.toFixed(2)}
                </span>
              </div>
              {order.payments && order.payments.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="text-xs space-y-1">
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
          </div>
        </div>

        {/* Right Column - Customer + Address */}
        <div className="lg:col-span-3 space-y-4">
          {/* Customer */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Customer</h3>
            <p className="text-sm text-blue-600 font-medium">
              {order.shippingName}
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              {order.customer?.totalOrders ?? 1} order
              {(order.customer?.totalOrders ?? 1) !== 1 ? "s" : ""}
            </p>
            <Separator className="my-2" />
            <p className="text-xs font-medium mb-1">Contact information</p>
            <p className="text-sm text-blue-600">{order.shippingEmail}</p>
            {order.shippingPhone && (
              <p className="text-sm">{order.shippingPhone}</p>
            )}
          </div>

          {/* Shipping Address - Editable */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Shipping Address</h3>
              {!editingAddress ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={startEditingAddress}
                >
                  Edit
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setEditingAddress(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={handleSaveAddress}
                    disabled={savingAddress}
                  >
                    {savingAddress ? "..." : "Save"}
                  </Button>
                </div>
              )}
            </div>
            {editingAddress ? (
              <div className="space-y-2 text-sm">
                <Input
                  placeholder="Name"
                  value={addressForm.shippingName}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      shippingName: e.target.value,
                    })
                  }
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="Address Line 1"
                  value={addressForm.shippingLine1}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      shippingLine1: e.target.value,
                    })
                  }
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="Address Line 2"
                  value={addressForm.shippingLine2}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      shippingLine2: e.target.value,
                    })
                  }
                  className="h-8 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="City"
                    value={addressForm.shippingCity}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        shippingCity: e.target.value,
                      })
                    }
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="Postal Code"
                    value={addressForm.shippingPostalCode}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        shippingPostalCode: e.target.value,
                      })
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="State"
                    value={addressForm.shippingState}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        shippingState: e.target.value,
                      })
                    }
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="Country"
                    value={addressForm.shippingCountry}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        shippingCountry: e.target.value,
                      })
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <Input
                  placeholder="Phone"
                  value={addressForm.shippingPhone}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      shippingPhone: e.target.value,
                    })
                  }
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="Email"
                  value={addressForm.shippingEmail}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      shippingEmail: e.target.value,
                    })
                  }
                  className="h-8 text-sm"
                />
              </div>
            ) : (
              <div className="text-sm space-y-0.5">
                <p className="font-medium">{order.shippingName}</p>
                <p>{order.shippingLine1}</p>
                {order.shippingLine2 && <p>{order.shippingLine2}</p>}
                <p>{order.shippingCity}</p>
                <p>{order.shippingPostalCode}</p>
                <p>{order.shippingCountry}</p>
              </div>
            )}
          </div>

          {/* Tracking */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Tracking</h3>
            <OrderTrackingCard
              orderId={order.id}
              onTrackingSaved={async () => {
                const response = await api.orders.getById(params.id);
                if (response.success && response.data) {
                  setOrder(response.data);
                }
              }}
            />
          </div>
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
            <AlertDialogDescription className="space-y-2">
              <p>
                This will cancel order <strong>{order?.orderID}</strong> and
                perform the following actions:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>
                  Process a <strong>full refund</strong> via Airwallex (if
                  payment was made)
                </li>
                <li>
                  Update order status to <strong>Cancelled/Refunded</strong>
                </li>
                <li>Log the cancellation in order history</li>
              </ul>
              <p className="text-destructive font-medium mt-2">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  const response = await api.orders.cancel(
                    order!.id,
                    "Cancelled by admin",
                    true
                  );
                  if (response.success) {
                    toast.success(
                      response.message || "Order cancelled successfully"
                    );
                    // Refresh order data
                    const orderResponse = await api.orders.getById(order!.id);
                    if (orderResponse.success && orderResponse.data) {
                      setOrder(orderResponse.data);
                    }
                  } else {
                    toast.error(response.error || "Failed to cancel order");
                  }
                } catch (error: any) {
                  toast.error(error.message || "Failed to cancel order");
                }
                setShowCancelDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Order & Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Item Dialog */}
      <Dialog
        open={showAddItemDialog}
        onOpenChange={(open) => {
          setShowAddItemDialog(open);
          if (!open) {
            setSelectedProduct(null);
            setSelectedVariant("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item to Order</DialogTitle>
            <DialogDescription>
              Add a new item to order #{order?.orderID}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedVariant || !order) {
                toast.error("Please select a product and variant");
                return;
              }

              const formData = new FormData(e.currentTarget);
              setAddingItem(true);

              try {
                // Call API to create order item (customisationPrice not required)
                const customisation = (
                  formData.get("customisation") as string
                )?.trim();
                const response = await api.orderItems.create({
                  orderId: order.id,
                  productVariantId: selectedVariant,
                  quantity: parseInt(formData.get("quantity") as string) || 1,
                  customisationString: customisation || undefined,
                  customisationPrice: 0, // Price handled by backend based on product
                });

                if (response.success) {
                  // Refresh order data
                  const orderResponse = await api.orders.getById(order.id);
                  if (orderResponse.success && orderResponse.data) {
                    const orderData = orderResponse.data;
                    setOrder({
                      ...orderData,
                      createdAt: new Date(orderData.createdAt),
                      updatedAt: new Date(orderData.updatedAt),
                      orderItems: orderData.orderItems?.map((item: any) => ({
                        ...item,
                        createdAt: new Date(item.createdAt),
                        updatedAt: new Date(item.updatedAt),
                      })),
                    });
                  }
                  toast.success("Item added to order successfully");
                  setShowAddItemDialog(false);
                  setSelectedProduct(null);
                  setSelectedVariant("");
                } else {
                  toast.error(response.error || "Failed to add item");
                }
              } catch (error: any) {
                toast.error(error.message || "Failed to add item");
              } finally {
                setAddingItem(false);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="product">Product (search by name or SKU)</Label>
              <Input
                placeholder="Search products by name or SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="mb-2"
              />
              <Select
                value={selectedProduct?.id || ""}
                onValueChange={async (value) => {
                  const product = products.find((p) => p.id === value);
                  setSelectedProduct(product);
                  setSelectedVariant("");
                  setProductVariants([]);

                  // Fetch full product with variants
                  if (product) {
                    setLoadingVariants(true);
                    try {
                      const response = await api.products.getById(value);
                      if (response.success && response.data) {
                        setProductVariants(response.data.ProductVariant || []);
                      }
                    } catch (error) {
                      console.error("Error fetching variants:", error);
                    } finally {
                      setLoadingVariants(false);
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredProducts.slice(0, 50).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <span className="font-mono text-xs text-muted-foreground mr-2">
                        {product.sku}
                      </span>
                      {product.name}
                    </SelectItem>
                  ))}
                  {filteredProducts.length > 50 && (
                    <div className="px-2 py-1 text-xs text-muted-foreground">
                      Showing 50 of {filteredProducts.length} results. Refine
                      your search.
                    </div>
                  )}
                  {filteredProducts.length === 0 && (
                    <div className="px-2 py-1 text-xs text-muted-foreground">
                      No products found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            {selectedProduct && (
              <div className="space-y-2">
                <Label htmlFor="variant">Size / Variant</Label>
                <Select
                  value={selectedVariant}
                  onValueChange={setSelectedVariant}
                  disabled={loadingVariants}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingVariants
                          ? "Loading variants..."
                          : "Select variant"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {productVariants.map((variant: any) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.size}
                        {variant.patch ? ` / ${variant.patch}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
            <div className="space-y-2">
              <Label htmlFor="customisation">Customisation (Optional)</Label>
              <Input
                id="customisation"
                name="customisation"
                placeholder="Player name, number, etc."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddItemDialog(false);
                  setSelectedProduct(null);
                  setSelectedVariant("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addingItem || !selectedVariant}>
                {addingItem ? "Adding..." : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
