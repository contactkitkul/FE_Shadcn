"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CrudPage,
  useCrudPageState,
  CrudColumn,
} from "@/components/crud/crud-page";
import { StatItem } from "@/components/ui/stats-grid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingCart, Mail, TrendingUp, DollarSign, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface AbandonedCart {
  id: string;
  customerId?: string;
  email?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    productId?: string;
    variantId?: string;
  }>;
  totalPrice: number;
  currency: string;
  createdAt: Date;
  recoveredOrderId?: string;
  recoveredAt?: Date;
  source?: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingLine1?: string;
  shippingCity?: string;
  shippingCountry?: string;
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { searchTerm, setSearchTerm } = useCrudPageState();

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const response = await api.abandonedCarts.getAll({
        page: 1,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (response.success && response.data?.data) {
        const formattedCarts = response.data.data.map((cart: any) => ({
          ...cart,
          createdAt: new Date(cart.createdAt),
          recoveredAt: cart.recoveredAt
            ? new Date(cart.recoveredAt)
            : undefined,
        }));
        setCarts(formattedCarts);
      }
    } catch (error: any) {
      console.error("Error fetching abandoned carts:", error);
      toast.error(error.message || "Failed to load abandoned carts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  // Filter carts
  const filteredCarts = useMemo(() => {
    return carts.filter(
      (cart) =>
        (cart.shippingName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (cart.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [carts, searchTerm]);

  const handleSendRecoveryEmail = (cart: AbandonedCart) => {
    if (!cart.email) {
      toast.error("No email address available for this cart");
      return;
    }
    toast.success(`Recovery email sent to ${cart.email}`);
  };

  const handleViewDetails = (cart: AbandonedCart) => {
    setSelectedCart(cart);
    setIsDetailOpen(true);
  };

  // Stats
  const totalValue = carts.reduce((sum, cart) => sum + cart.totalPrice, 0);
  const recoveredCount = carts.filter((cart) => !!cart.recoveredOrderId).length;
  const recoveryRate =
    carts.length > 0 ? (recoveredCount / carts.length) * 100 : 0;

  const stats: StatItem[] = [
    {
      label: "Total Abandoned",
      value: carts.length,
      subLabel: "Active carts",
      icon: ShoppingCart,
      borderColor: "border-l-orange-400",
    },
    {
      label: "Total Value",
      value: `€${totalValue.toFixed(2)}`,
      subLabel: "Potential revenue",
      icon: DollarSign,
      iconColor: "text-yellow-500",
      borderColor: "border-l-yellow-400",
    },
    {
      label: "Recovered",
      value: recoveredCount,
      subLabel: "Converted to orders",
      icon: TrendingUp,
      iconColor: "text-green-500",
      borderColor: "border-l-green-400",
    },
    {
      label: "Recovery Rate",
      value: `${recoveryRate.toFixed(1)}%`,
      subLabel: "Success rate",
      icon: TrendingUp,
      iconColor: "text-blue-500",
      borderColor: "border-l-blue-400",
    },
  ];

  // Columns
  const columns: CrudColumn<AbandonedCart>[] = [
    {
      key: "customer",
      header: "Customer",
      isPrimary: true,
      render: (cart) => cart.shippingName || "Unknown",
    },
    {
      key: "email",
      header: "Email",
      mobileLabel: "Email",
      render: (cart) => cart.email || "-",
    },
    {
      key: "items",
      header: "Items",
      mobileLabel: "Items",
      render: (cart) => `${cart.items?.length || 0} items`,
    },
    {
      key: "totalPrice",
      header: "Cart Value",
      isSecondary: true,
      render: (cart) => (
        <span className="font-semibold">€{cart.totalPrice.toFixed(2)}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Abandoned",
      minWidth: "md",
      render: (cart) => (
        <div>
          {format(cart.createdAt, "MMM dd, yyyy")}
          <br />
          <span className="text-xs text-muted-foreground">
            {format(cart.createdAt, "h:mm a")}
          </span>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      minWidth: "lg",
      render: (cart) => cart.source || "-",
    },
    {
      key: "status",
      header: "Status",
      mobileLabel: "Status",
      render: (cart) =>
        cart.recoveredOrderId ? (
          <Badge className="bg-green-100 text-green-800">Recovered</Badge>
        ) : (
          <Badge variant="secondary">Pending</Badge>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      hideOnMobile: true,
      render: (cart) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(cart);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {!cart.recoveredOrderId && cart.email && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSendRecoveryEmail(cart);
              }}
            >
              <Mail className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Export config
  const exportConfig = {
    filename: "abandoned-carts",
    headers: [
      "Customer",
      "Email",
      "Items",
      "Cart Value",
      "Abandoned",
      "Status",
    ],
    rowMapper: (cart: AbandonedCart) => [
      cart.shippingName || "Unknown",
      cart.email || "-",
      cart.items?.length || 0,
      `€${cart.totalPrice.toFixed(2)}`,
      format(cart.createdAt, "MMM dd, yyyy"),
      cart.recoveredOrderId ? "Recovered" : "Pending",
    ],
  };

  return (
    <>
      <CrudPage<AbandonedCart>
        title="Abandoned Carts"
        description="Recover lost sales and boost conversions"
        data={filteredCarts}
        loading={loading}
        getRowKey={(cart) => cart.id}
        columns={columns}
        stats={stats}
        statsColumns={4}
        searchPlaceholder="Search by customer name or email..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        actions={{
          onRowClick: handleViewDetails,
          customActions: (cart) => (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(cart);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {!cart.recoveredOrderId && cart.email && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendRecoveryEmail(cart);
                  }}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              )}
            </div>
          ),
        }}
        exportConfig={exportConfig}
        emptyIcon={<ShoppingCart className="h-12 w-12 text-muted-foreground" />}
        emptyMessage="No abandoned carts found"
      />

      {/* Cart Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cart Details</DialogTitle>
            <DialogDescription>
              {selectedCart?.shippingName || "Unknown"} -{" "}
              {selectedCart?.email || "No email"}
            </DialogDescription>
          </DialogHeader>
          {selectedCart && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <p className="text-sm text-muted-foreground">
                    Name: {selectedCart.shippingName || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Email: {selectedCart.email || "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Phone: {selectedCart.shippingPhone || "-"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Cart Information</h4>
                  <p className="text-sm text-muted-foreground">
                    Source: {selectedCart.source || "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Abandoned: {format(selectedCart.createdAt, "PPP")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status:{" "}
                    {selectedCart.recoveredOrderId ? "Recovered" : "Pending"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Cart Items</h4>
                <div className="space-y-2">
                  {selectedCart.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-3 bg-muted rounded"
                    >
                      <div>
                        <p className="font-medium">{item.name || "Product"}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        €{(item.price || 0).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg">
                    €{selectedCart.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {!selectedCart.recoveredOrderId && selectedCart.email && (
                <Button
                  className="w-full"
                  onClick={() => handleSendRecoveryEmail(selectedCart)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Recovery Email
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
