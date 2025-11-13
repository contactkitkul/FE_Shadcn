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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Percent,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Discount,
  EnumDiscountStatus,
  EnumDiscountType,
  EnumDiscountReason,
} from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
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
        toast.error(getEntityMessages('discounts').loadError);
      }
    } catch (error: any) {
      console.error("Error fetching discounts:", error);
      toast.error(error.message || getEntityMessages('discounts').loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortColumn, sortDirection, debouncedSearch]);

  // Old mock data
  const oldMockEffect = () => {
    setTimeout(() => {
      const mockDiscounts: Discount[] = [
        {
          id: "1",
          createdAt: new Date("2024-11-10"),
          updatedAt: new Date(),
          code: "SUMMER2024",
          status: EnumDiscountStatus.ACTIVE,
          expiryDate: new Date("2024-08-31"),
          usageLimit: 100,
          maxDiscountAmount: 50,
          minCartValue: 100,
          description: "Summer sale discount",
          discountType: EnumDiscountType.PERCENTAGE,
          timesUsed: 25,
          discountPercentage: 20,
        },
        {
          id: "2",
          createdAt: new Date("2024-11-11"),
          updatedAt: new Date(),
          code: "WELCOME10",
          status: EnumDiscountStatus.ACTIVE,
          expiryDate: new Date("2024-12-31"),
          usageLimit: 500,
          minCartValue: 50,
          description: "Welcome discount for new customers",
          discountType: EnumDiscountType.FIXED_AMOUNT,
          timesUsed: 150,
          discountAmount: 10,
        },
        {
          id: "3",
          createdAt: new Date("2024-11-09"),
          updatedAt: new Date(),
          code: "EXPIRED2023",
          status: EnumDiscountStatus.EXPIRED,
          expiryDate: new Date("2023-12-31"),
          usageLimit: 200,
          description: "Old year discount",
          discountType: EnumDiscountType.PERCENTAGE,
          timesUsed: 200,
          discountPercentage: 15,
        },
      ];
      setDiscounts(mockDiscounts);
      setLoading(false);
    }, 1000);
  };

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

  const filteredAndSortedDiscounts = discounts
    .filter(
      (discount) =>
        discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        discount.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any = a[sortColumn as keyof Discount];
      let bValue: any = b[sortColumn as keyof Discount];

      if (sortColumn === "createdAt" || sortColumn === "expiryDate") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

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

  const handleDelete = (id: string) => {
    toast.success("Discount deleted successfully");
    setDiscounts(discounts.filter((d) => d.id !== id));
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    toast.success(
      editingDiscount
        ? "Discount updated successfully"
        : "Discount created successfully"
    );
    setIsDialogOpen(false);
    setEditingDiscount(null);
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
            <Button onClick={() => setEditingDiscount(null)}>
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
                  <Input id="code" placeholder="e.g., SUMMER2024" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select
                    value={selectedDiscountType}
                    onValueChange={(value) =>
                      setSelectedDiscountType(value as EnumDiscountType)
                    }
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Max Discount Amount (€)</Label>
                    <Input id="maxDiscount" type="number" placeholder="50" />
                  </div>
                </div>
              )}

              {selectedDiscountType === EnumDiscountType.FIXED_AMOUNT && (
                <div className="space-y-2">
                  <Label htmlFor="fixedAmount">Discount Amount (€)</Label>
                  <Input id="fixedAmount" type="number" placeholder="10" />
                </div>
              )}

              {selectedDiscountType ===
                EnumDiscountType.X_FREE_ON_Y_PURCHASE && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyQty">Buy Quantity (X)</Label>
                    <Input id="buyQty" type="number" placeholder="2" min="1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="freeQty">Get Free Quantity (Y)</Label>
                    <Input id="freeQty" type="number" placeholder="1" min="1" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minCartValue">Min Cart Value (€)</Label>
                  <Input id="minCartValue" type="number" defaultValue={50} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    placeholder="1"
                    defaultValue={1}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input id="expiryDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue={EnumDiscountStatus.ACTIVE}>
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
                <Select defaultValue={EnumDiscountReason.OTHERS}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("code")}
                      className="h-auto p-0 font-semibold"
                    >
                      Code
                      {getSortIcon("code")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("discountType")}
                      className="h-auto p-0 font-semibold"
                    >
                      Type
                      {getSortIcon("discountType")}
                    </Button>
                  </TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("timesUsed")}
                      className="h-auto p-0 font-semibold"
                    >
                      Usage
                      {getSortIcon("timesUsed")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("expiryDate")}
                      className="h-auto p-0 font-semibold"
                    >
                      Expiry
                      {getSortIcon("expiryDate")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("status")}
                      className="h-auto p-0 font-semibold"
                    >
                      Status
                      {getSortIcon("status")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("createdAt")}
                      className="h-auto p-0 font-semibold"
                    >
                      Created
                      {getSortIcon("createdAt")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedDiscounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Tag className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        No discounts found
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedDiscounts.map((discount: Discount) => (
                    <TableRow key={discount.id}>
                      <TableCell className="font-medium font-mono">
                        {discount.code}
                      </TableCell>
                      <TableCell>
                        {discount.discountType.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>
                        {discount.discountPercentage
                          ? `${discount.discountPercentage}%`
                          : `£${discount.discountAmount}`}
                      </TableCell>
                      <TableCell>
                        {discount.timesUsed} / {discount.usageLimit}
                      </TableCell>
                      <TableCell>
                        {format(new Date(discount.expiryDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(discount.status)}</TableCell>
                      <TableCell>
                        {format(new Date(discount.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
