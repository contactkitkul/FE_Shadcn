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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Package,
  AlertCircle,
  TrendingDown,
  DollarSign,
  Edit,
  Download,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  size: string;
  patch: string;
  stockQty: number;
  sellPrice: number;
  costPrice: number;
  stockValue: number;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  reorderPoint: number;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editStock, setEditStock] = useState("");

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      const mockInventory: InventoryItem[] = [
        {
          id: "1",
          sku: "MU-HOME-23-M-CL",
          productName: "Manchester United Home 23/24",
          size: "M",
          patch: "CHAMPIONS_LEAGUE",
          stockQty: 45,
          sellPrice: 89.99,
          costPrice: 45.0,
          stockValue: 2025.0,
          status: "IN_STOCK",
          reorderPoint: 10,
        },
        {
          id: "2",
          sku: "RM-AWAY-23-L-NO",
          productName: "Real Madrid Away 23/24",
          size: "L",
          patch: "NO_PATCH",
          stockQty: 8,
          sellPrice: 84.99,
          costPrice: 42.0,
          stockValue: 336.0,
          status: "LOW_STOCK",
          reorderPoint: 10,
        },
        {
          id: "3",
          sku: "BAR-HOME-23-S-LG",
          productName: "Barcelona Home 23/24",
          size: "S",
          patch: "LEAGUE",
          stockQty: 0,
          sellPrice: 89.99,
          costPrice: 45.0,
          stockValue: 0,
          status: "OUT_OF_STOCK",
          reorderPoint: 10,
        },
        {
          id: "4",
          sku: "LIV-HOME-23-XL-NO",
          productName: "Liverpool Home 23/24",
          size: "XL",
          patch: "NO_PATCH",
          stockQty: 32,
          sellPrice: 84.99,
          costPrice: 42.0,
          stockValue: 1344.0,
          status: "IN_STOCK",
          reorderPoint: 10,
        },
        {
          id: "5",
          sku: "BAY-HOME-23-M-CL",
          productName: "Bayern Munich Home 23/24",
          size: "M",
          patch: "CHAMPIONS_LEAGUE",
          stockQty: 5,
          sellPrice: 89.99,
          costPrice: 45.0,
          stockValue: 225.0,
          status: "LOW_STOCK",
          reorderPoint: 10,
        },
      ];
      setInventory(mockInventory);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { variant: any; label: string; className: string }
    > = {
      IN_STOCK: {
        variant: "default",
        label: "In Stock",
        className: "bg-green-100 text-green-800",
      },
      LOW_STOCK: {
        variant: "secondary",
        label: "Low Stock",
        className: "bg-yellow-100 text-yellow-800",
      },
      OUT_OF_STOCK: {
        variant: "destructive",
        label: "Out of Stock",
        className: "bg-red-100 text-red-800",
      },
    };
    return config[status] || config.IN_STOCK;
  };

  const handleUpdateStock = () => {
    if (!selectedItem || !editStock) return;

    const newQty = parseInt(editStock);
    setInventory(
      inventory.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              stockQty: newQty,
              stockValue: newQty * item.costPrice,
              status:
                newQty === 0
                  ? "OUT_OF_STOCK"
                  : newQty < item.reorderPoint
                  ? "LOW_STOCK"
                  : "IN_STOCK",
            }
          : item
      )
    );
    toast.success("Stock updated successfully");
    setIsEditOpen(false);
    setSelectedItem(null);
    setEditStock("");
  };

  const handleBulkExport = () => {
    toast.success("Exporting inventory to CSV...");
    // Implement CSV export
  };

  const totalValue = inventory.reduce((sum, item) => sum + item.stockValue, 0);
  const lowStockCount = inventory.filter(
    (item) => item.status === "LOW_STOCK"
  ).length;
  const outOfStockCount = inventory.filter(
    (item) => item.status === "OUT_OF_STOCK"
  ).length;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Inventory Management
          </h2>
          <p className="text-muted-foreground">
            Track and manage stock levels
          </p>
        </div>
        <Button onClick={handleBulkExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Inventory
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">Active SKUs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">Need reorder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {outOfStockCount}
            </div>
            <p className="text-xs text-muted-foreground">Urgent action needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stock Levels</CardTitle>
              <CardDescription>
                Monitor and update product inventory
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by SKU or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="IN_STOCK">In Stock</SelectItem>
                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Patch</TableHead>
                  <TableHead>Stock Qty</TableHead>
                  <TableHead>Sell Price</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Stock Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No inventory items found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => {
                    const statusConfig = getStatusBadge(item.status);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">
                          {item.sku}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.productName}
                        </TableCell>
                        <TableCell>{item.size}</TableCell>
                        <TableCell>
                          {item.patch.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              item.stockQty < item.reorderPoint
                                ? "text-yellow-600 font-semibold"
                                : item.stockQty === 0
                                ? "text-red-600 font-semibold"
                                : "font-semibold"
                            }
                          >
                            {item.stockQty}
                          </span>
                        </TableCell>
                        <TableCell>€{item.sellPrice.toFixed(2)}</TableCell>
                        <TableCell>€{item.costPrice.toFixed(2)}</TableCell>
                        <TableCell className="font-semibold">
                          €{item.stockValue.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.className}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setEditStock(item.stockQty.toString());
                              setIsEditOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Stock Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              {selectedItem?.productName} - {selectedItem?.sku}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Stock</Label>
              <div className="text-2xl font-bold">{selectedItem?.stockQty}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newStock">New Stock Quantity</Label>
              <Input
                id="newStock"
                type="number"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                placeholder="Enter new quantity"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Reorder point: {selectedItem?.reorderPoint} units
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStock}>Update Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
