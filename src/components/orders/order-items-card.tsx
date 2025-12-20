"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Plus, Trash2, Check, Copy, Edit, X } from "lucide-react";
import {
  Order,
  OrderItem,
  EnumNoStockStatus,
  EnumOrderStatus,
  EnumOrderItemStatus,
} from "@/types";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface OrderItemsCardProps {
  order: Order;
  onOrderUpdate: (order: Order) => void;
  onAddItem: () => void;
  onDuplicateOrder: () => void;
}

export function OrderItemsCard({
  order,
  onOrderUpdate,
  onAddItem,
  onDuplicateOrder,
}: OrderItemsCardProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemValues, setEditingItemValues] = useState<{
    quantity: number;
    customisationString?: string;
    customisationPrice: number;
  }>({ quantity: 1, customisationPrice: 0 });

  const statusConfig = getStatusConfig(order.orderStatus);

  const handleEditItem = (item: OrderItem) => {
    setEditingItemId(item.id);
    setEditingItemValues({
      quantity: item.quantity,
      customisationString: item.customisationString,
      customisationPrice: item.customisationPrice || 0,
    });
  };

  const handleSaveItem = async (itemId: string) => {
    try {
      await api.orderItems.update(itemId, editingItemValues);
      const updatedItems = order.orderItems?.map((i) =>
        i.id === itemId
          ? {
              ...i,
              quantity: editingItemValues.quantity,
              customisationString: editingItemValues.customisationString,
              customisationPrice: editingItemValues.customisationPrice,
            }
          : i
      );
      onOrderUpdate({ ...order, orderItems: updatedItems });
      setEditingItemId(null);
      toast.success("Item updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update item");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await api.orderItems.updateStatus(itemId, "REMOVED");
      const updatedItems = order.orderItems?.map((i) =>
        i.id === itemId ? { ...i, status: EnumOrderItemStatus.REMOVED } : i
      );
      onOrderUpdate({ ...order, orderItems: updatedItems });
      toast.success("Item removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove item");
    }
  };

  const handleStockStatusChange = async (
    itemId: string,
    status: EnumNoStockStatus
  ) => {
    try {
      await api.orderItems.update(itemId, { noStockStatus: status });
      const updatedItems = order.orderItems?.map((i) =>
        i.id === itemId ? { ...i, noStockStatus: status } : i
      );
      onOrderUpdate({ ...order, orderItems: updatedItems });
      toast.success("Stock status updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update stock status");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <CardTitle className="text-base">{statusConfig.label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-3">
            {order.orderItems?.map((item, index) => (
              <OrderItemRow
                key={item.id}
                item={item}
                isEditing={editingItemId === item.id}
                editingValues={editingItemValues}
                onEditingValuesChange={setEditingItemValues}
                onEdit={() => handleEditItem(item)}
                onSave={() => handleSaveItem(item.id)}
                onCancel={() => setEditingItemId(null)}
                onRemove={() => handleRemoveItem(item.id)}
                onStockStatusChange={(status) =>
                  handleStockStatusChange(item.id, status)
                }
                showSeparator={index < (order.orderItems?.length || 0) - 1}
              />
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={onAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
            <Button variant="outline" size="sm" onClick={onDuplicateOrder}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate Order
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface OrderItemRowProps {
  item: OrderItem;
  isEditing: boolean;
  editingValues: {
    quantity: number;
    customisationString?: string;
    customisationPrice: number;
  };
  onEditingValuesChange: (values: {
    quantity: number;
    customisationString?: string;
    customisationPrice: number;
  }) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onRemove: () => void;
  onStockStatusChange: (status: EnumNoStockStatus) => void;
  showSeparator: boolean;
}

function OrderItemRow({
  item,
  isEditing,
  editingValues,
  onEditingValuesChange,
  onEdit,
  onSave,
  onCancel,
  onRemove,
  onStockStatusChange,
  showSeparator,
}: OrderItemRowProps) {
  const product = item.productVariant?.product;
  const productImage = product?.ProductImage?.[0];
  const imageUrl = productImage?.imageUrl;
  const thumbnailUrl = imageUrl?.includes("imagedelivery.net")
    ? imageUrl.replace("/public", "/thumbnail")
    : imageUrl;
  const productName = product?.name || "Unknown Product";
  const variantInfo = item.productVariant
    ? `${item.productVariant.size || ""} / ${
        item.productVariant.patch || "Sin parche"
      }`
    : "";
  const isRemoved = item.status === "REMOVED" || item.status === "REFUNDED";

  return (
    <>
      <div
        className={`${
          item.noStockStatus === EnumNoStockStatus.OUT_OF_STOCK || isRemoved
            ? "opacity-50"
            : ""
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={productName}
                className="w-12 h-12 object-cover rounded"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className={`font-medium ${isRemoved ? "line-through" : ""}`}>
                {productName}
                {isRemoved && (
                  <Badge variant="outline" className="ml-2 text-red-500">
                    {item.status === "REFUNDED" ? "Refunded" : "Removed"}
                  </Badge>
                )}
                {item.noStockStatus === EnumNoStockStatus.OUT_OF_STOCK &&
                  !isRemoved && (
                    <Badge variant="destructive" className="ml-2">
                      Cancelled
                    </Badge>
                  )}
              </p>
              <p className="text-sm text-muted-foreground">{variantInfo}</p>
              {item.customisationString && (
                <p className="text-sm text-muted-foreground">
                  ✓ {item.customisationString}
                </p>
              )}
              <div className="mt-2">
                <Select
                  value={item.noStockStatus}
                  onValueChange={(value) =>
                    onStockStatusChange(value as EnumNoStockStatus)
                  }
                >
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Stock: None</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <Label className="text-xs">Qty:</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingValues.quantity}
                    onChange={(e) =>
                      onEditingValuesChange({
                        ...editingValues,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-16 h-8"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <Label className="text-xs">Custom:</Label>
                  <Input
                    value={editingValues.customisationString || ""}
                    onChange={(e) =>
                      onEditingValuesChange({
                        ...editingValues,
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
                    value={editingValues.customisationPrice}
                    onChange={(e) =>
                      onEditingValuesChange({
                        ...editingValues,
                        customisationPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-20 h-8"
                  />
                </div>
                <div className="flex gap-1">
                  <Button size="sm" onClick={onSave}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onCancel}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="font-medium">
                  {item.quantity} × €{item.unitPrice?.toFixed(2) || "0.00"}
                </p>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={onEdit}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={onRemove}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {showSeparator && <Separator className="mt-3" />}
    </>
  );
}

function getStatusConfig(status: EnumOrderStatus) {
  const config: Record<
    EnumOrderStatus,
    { variant: string; label: string; color: string }
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
}
