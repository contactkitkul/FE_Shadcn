"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CrudDataTable, Column } from "@/components/ui/crud-data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Tag, Percent } from "lucide-react";
import {
  Discount,
  EnumDiscountStatus,
  EnumDiscountType,
  EnumDiscountReason,
} from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { getEntityMessages } from "@/config/messages";

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [selectedDiscountType, setSelectedDiscountType] =
    useState<EnumDiscountType>(EnumDiscountType.FIXED_AMOUNT);
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    discountType: EnumDiscountType.FIXED_AMOUNT,
    discountPercentage: 0,
    maxDiscountAmount: 0,
    discountAmount: 0,
    offerBuyQty: 0,
    offerFreeQty: 0,
    minCartValue: 50,
    usageLimit: 1,
    expiryDate: "",
    status: EnumDiscountStatus.ACTIVE,
    discountReason: EnumDiscountReason.OTHERS,
    description: "",
  });

  // Fetch discounts from API
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await api.discounts.getAll({
        page: 1,
        limit: 100,
        sortBy: sortColumn,
        sortOrder: sortDirection,
        search: searchTerm,
      });

      if (response.success) {
        setDiscounts(response.data.data || []);
      } else {
        toast.error(getEntityMessages("discounts").loadError);
      }
    } catch (error: any) {
      console.error("Error fetching discounts:", error);
      toast.error(error.message || getEntityMessages("discounts").loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
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

  const getStatusBadge = (status: EnumDiscountStatus) => {
    const variants: Record<
      EnumDiscountStatus,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      EXPIRED: "destructive",
      REDEEMED_OUT: "outline",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const handleDelete = async (id: string) => {
    try {
      await api.discounts.delete(id);
      toast.success("Discount deleted successfully");
      setDiscounts(discounts.filter((d) => d.id !== id));
    } catch (error: any) {
      console.error("Error deleting discount:", error);
      toast.error(error.message || "Failed to delete discount");
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      discountType: discount.discountType,
      discountPercentage: discount.discountPercentage || 0,
      maxDiscountAmount: discount.maxDiscountAmount || 0,
      discountAmount: discount.discountAmount || 0,
      offerBuyQty: discount.offerBuyQty || 0,
      offerFreeQty: discount.offerFreeQty || 0,
      minCartValue: discount.minCartValue || 50,
      usageLimit: discount.usageLimit,
      expiryDate: new Date(discount.expiryDate).toISOString().split("T")[0],
      status: discount.status,
      discountReason: discount.discountReason || EnumDiscountReason.OTHERS,
      description: discount.description || "",
    });
    setSelectedDiscountType(discount.discountType);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: EnumDiscountType.FIXED_AMOUNT,
      discountPercentage: 0,
      maxDiscountAmount: 0,
      discountAmount: 0,
      offerBuyQty: 0,
      offerFreeQty: 0,
      minCartValue: 50,
      usageLimit: 1,
      expiryDate: "",
      status: EnumDiscountStatus.ACTIVE,
      discountReason: EnumDiscountReason.OTHERS,
      description: "",
    });
    setSelectedDiscountType(EnumDiscountType.FIXED_AMOUNT);
  };

  const handleSave = async () => {
    try {
      if (editingDiscount) {
        // Update existing discount
        await api.discounts.update(editingDiscount.id, formData);
        toast.success("Discount updated successfully");
      } else {
        // Create new discount
        await api.discounts.create(formData);
        toast.success("Discount created successfully");
      }

      // Refresh the list
      await fetchDiscounts();

      setIsDialogOpen(false);
      setEditingDiscount(null);
      resetForm();
    } catch (error: any) {
      console.error("Error saving discount:", error);
      toast.error(error.message || "Failed to save discount");
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Discounts</h2>
          <p className="text-muted-foreground">
            Manage promotional codes and discounts
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingDiscount(null);
                resetForm();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDiscount ? "Edit Discount" : "Create New Discount"}
              </DialogTitle>
              <DialogDescription>
                Set up a discount code for your customers
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Discount Code</Label>
                  <Input
                    id="code"
                    placeholder="e.g., SUMMER2024"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) => {
                      const type = value as EnumDiscountType;
                      setSelectedDiscountType(type);
                      setFormData({ ...formData, discountType: type });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                      <SelectItem value="X_FREE_ON_Y_PURCHASE">
                        Buy X Get Y Free
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Conditional Fields Based on Discount Type */}
              {selectedDiscountType === EnumDiscountType.PERCENTAGE && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="percentage">Discount Percentage (%)</Label>
                    <Input
                      id="percentage"
                      type="number"
                      placeholder="20"
                      min="0"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountPercentage: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Max Discount Amount (€)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      placeholder="50"
                      value={formData.maxDiscountAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxDiscountAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {selectedDiscountType === EnumDiscountType.FIXED_AMOUNT && (
                <div className="space-y-2">
                  <Label htmlFor="fixedAmount">Discount Amount (€)</Label>
                  <Input
                    id="fixedAmount"
                    type="number"
                    placeholder="10"
                    value={formData.discountAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              )}

              {selectedDiscountType ===
                EnumDiscountType.X_FREE_ON_Y_PURCHASE && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyQty">Buy Quantity (X)</Label>
                    <Input
                      id="buyQty"
                      type="number"
                      placeholder="2"
                      min="1"
                      value={formData.offerBuyQty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          offerBuyQty: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="freeQty">Get Free Quantity (Y)</Label>
                    <Input
                      id="freeQty"
                      type="number"
                      placeholder="1"
                      min="1"
                      value={formData.offerFreeQty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          offerFreeQty: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minCartValue">Min Cart Value (€)</Label>
                  <Input
                    id="minCartValue"
                    type="number"
                    value={formData.minCartValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minCartValue: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    placeholder="1"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usageLimit: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as EnumDiscountStatus,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Discount Reason</Label>
                <Select
                  value={formData.discountReason}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      discountReason: value as EnumDiscountReason,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROMOTION">Promotion</SelectItem>
                    <SelectItem value="CHINA_MISTAKE">China Mistake</SelectItem>
                    <SelectItem value="EUROPE_MISTAKE">
                      Europe Mistake
                    </SelectItem>
                    <SelectItem value="OTHERS">Others</SelectItem>
                    <SelectItem value="NO_MISTAKE_EQUAL_HIT">
                      No Mistake / Equal Hit
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter discount description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Discount</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Discounts
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discounts.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                discounts.filter((d) => d.status === EnumDiscountStatus.ACTIVE)
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {discounts.reduce((sum, d) => sum + d.timesUsed, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Redemptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Usage</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                discounts.reduce(
                  (sum, d) => sum + (d.timesUsed / d.usageLimit) * 100,
                  0
                ) / discounts.length
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">Of usage limit</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Discount Codes</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search discounts..."
                  className="pl-8 w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CrudDataTable<Discount>
            data={discounts}
            loading={loading}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            getRowKey={(discount) => discount.id}
            emptyIcon={<Tag className="h-12 w-12 text-muted-foreground" />}
            emptyMessage="No discounts found"
            columns={[
              {
                key: "code",
                header: "Code",
                sortable: true,
                render: (discount) => (
                  <span className="font-medium font-mono">{discount.code}</span>
                ),
              },
              {
                key: "discountType",
                header: "Type",
                sortable: true,
                render: (discount) => discount.discountType.replace(/_/g, " "),
              },
              {
                key: "value",
                header: "Value",
                render: (discount) =>
                  discount.discountPercentage
                    ? `${discount.discountPercentage}%`
                    : `€${discount.discountAmount}`,
              },
              {
                key: "timesUsed",
                header: "Usage",
                sortable: true,
                render: (discount) =>
                  `${discount.timesUsed} / ${discount.usageLimit}`,
              },
              {
                key: "expiryDate",
                header: "Expiry",
                sortable: true,
                render: (discount) =>
                  format(new Date(discount.expiryDate), "MMM dd, yyyy"),
              },
              {
                key: "status",
                header: "Status",
                sortable: true,
                render: (discount) => getStatusBadge(discount.status),
              },
              {
                key: "createdAt",
                header: "Created",
                sortable: true,
                render: (discount) =>
                  format(new Date(discount.createdAt), "MMM dd, yyyy"),
              },
              {
                key: "actions",
                header: "Actions",
                className: "text-right",
                render: (discount) => (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(discount)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(discount.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
