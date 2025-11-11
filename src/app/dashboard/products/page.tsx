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
import { Plus, Search, Edit, Trash2, Package, Upload, Copy } from "lucide-react";
import {
  Product,
  EnumProductStatus,
  EnumProductType,
  EnumLeague,
  EnumShirtType,
  EnumHomeAway,
} from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockProducts: Product[] = [
        {
          id: "1",
          createdAt: new Date("2024-11-10"),
          updatedAt: new Date(),
          sku: "MU-HOME-23-24",
          productStatus: EnumProductStatus.ACTIVE,
          year: "2023/24",
          team: "Manchester_United_FC",
          league: EnumLeague.PREMIER_LEAGUE,
          productType: EnumProductType.SHIRT,
          featuresShirt: EnumShirtType.NORMAL,
          featuresCurrentSeason: true,
          featuresLongSleeve: false,
          name: "Manchester United Home Shirt 2023/24",
          homeAway: EnumHomeAway.HOME,
          productVariantId: "var1",
        },
        {
          id: "2",
          createdAt: new Date("2024-11-11"),
          updatedAt: new Date(),
          sku: "RM-AWAY-23-24",
          productStatus: EnumProductStatus.ACTIVE,
          year: "2023/24",
          team: "Real_Madrid_CF",
          league: EnumLeague.LA_LIGA,
          productType: EnumProductType.SHIRT,
          featuresShirt: EnumShirtType.PLAYER,
          featuresCurrentSeason: true,
          featuresLongSleeve: false,
          name: "Real Madrid Away Shirt 2023/24",
          homeAway: EnumHomeAway.AWAY,
          productVariantId: "var2",
        },
      ];
      // Sort by newest first (createdAt DESC)
      const sortedProducts = mockProducts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setProducts(sortedProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: EnumProductStatus) => {
    const variants: Record<
      EnumProductStatus,
      "default" | "secondary" | "destructive"
    > = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      OUT_OF_STOCK: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.success("Product deleted successfully");
  };

  const handleDuplicate = (product: Product) => {
    const duplicatedProduct: Product = {
      ...product,
      id: `${product.id}-copy-${Date.now()}`,
      sku: `${product.sku}-COPY`,
      name: `${product.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProducts([duplicatedProduct, ...products]);
    toast.success("Product duplicated successfully");
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    toast.success(
      editingProduct
        ? "Product updated successfully"
        : "Product created successfully"
    );
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/products/bulk-upload")}
          >
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingProduct(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <DialogDescription>
                  Fill in the product details below
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" placeholder="Enter product name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" placeholder="Enter SKU" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="team">Team</Label>
                    <Input id="team" placeholder="Enter team name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input id="year" placeholder="2023/24" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="league">League</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select league" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PREMIER_LEAGUE">
                          Premier League
                        </SelectItem>
                        <SelectItem value="LA_LIGA">La Liga</SelectItem>
                        <SelectItem value="SERIE_A">Serie A</SelectItem>
                        <SelectItem value="BUNDESLIGA">Bundesliga</SelectItem>
                        <SelectItem value="LIGUE_1">Ligue 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="homeAway">Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOME">Home</SelectItem>
                        <SelectItem value="AWAY">Away</SelectItem>
                        <SelectItem value="THIRD">Third</SelectItem>
                        <SelectItem value="GOALKEEPER">Goalkeeper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="OUT_OF_STOCK">
                          Out of Stock
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shirtType">Shirt Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shirt type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="PLAYER">Player</SelectItem>
                        <SelectItem value="RETRO">Retro</SelectItem>
                        <SelectItem value="KID">Kid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
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
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>League</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No products found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.sku}
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.team?.replace(/_/g, " ")}</TableCell>
                      <TableCell>
                        {product.league?.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>{product.year}</TableCell>
                      <TableCell>{product.homeAway}</TableCell>
                      <TableCell>
                        {getStatusBadge(product.productStatus)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDuplicate(product)}
                            title="Duplicate product"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
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
