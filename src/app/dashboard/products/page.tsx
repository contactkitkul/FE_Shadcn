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
import {
  Search,
  Plus,
  Package,
  Edit,
  MoreHorizontal,
  Copy,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Upload,
  Trash2,
} from "lucide-react";
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
import { useDebounce } from "@/hooks/useDebounce";
import { TOAST_MESSAGES, getEntityMessages } from "@/config/messages";
import {
  getAllTeams,
  getLeagueForTeam,
  formatTeamName,
  getTeamIdentifier,
} from "@/lib/team-league-mapping";
import { VariantManager } from "@/components/products/variant-manager";
import { api } from "@/lib/api";
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

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [autoLeague, setAutoLeague] = useState<EnumLeague | undefined>(
    undefined
  );
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    team: "",
    year: "2025",
    yearEnd: 26,
    league: "",
    homeAway: "HOME" as EnumHomeAway,
    status: "ACTIVE" as EnumProductStatus,
    shirtType: "NORMAL" as EnumShirtType,
    productType: "SHIRT" as EnumProductType,
  });
  const [variantManagerOpen, setVariantManagerOpen] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] =
    useState<Product | null>(null);
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    productId: string;
    newStatus: EnumProductStatus;
    productName: string;
  } | null>(null);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.products.getAll({
        page: 1,
        limit: 100,
        sortBy: sortColumn,
        sortOrder: sortDirection,
        search: searchTerm,
      });

      if (response.success) {
        setProducts(response.data.data || []);
      } else {
        toast.error(getEntityMessages("products").loadError);
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error(error.message || getEntityMessages("products").loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortColumn, sortDirection, debouncedSearch]);

  // Auto-generation functions
  const generateSKU = async (team: string, year: string): Promise<string> => {
    // Generate SKU format: MANU250001 (team identifier + last 2 digits of year + 4-digit sequential)
    // Uses /api/products/validate-sku endpoint for sequential numbering per team-year

    try {
      const response = await api.products.validateSKU(team, year);
      if (response.success && response.data.sku) {
        return response.data.sku; // Returns: MANU250001, MANU250002, etc.
      }
    } catch (error) {
      console.error("Failed to validate SKU from API:", error);

      // Fallback: Use old endpoint
      try {
        const teamIdentifier = getTeamIdentifier(team);
        const yearCode = year.substring(year.length - 2); // Last 2 digits
        const fallbackResponse = await api.products.generateSKU();

        if (fallbackResponse.success && fallbackResponse.data.sku) {
          const randomPart = fallbackResponse.data.sku.substring(
            fallbackResponse.data.sku.length - 4
          );
          return `${teamIdentifier}${yearCode}${randomPart}`;
        }
      } catch (fallbackError) {
        console.error("Fallback SKU generation failed:", fallbackError);
      }
    }

    // Final fallback: generate random SKU
    const teamIdentifier = getTeamIdentifier(team);
    const yearCode = year.substring(year.length - 2);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${teamIdentifier}${yearCode}${randomNum}`;
  };

  const getTeamIdentifier = (team: string): string => {
    // Create 4-letter team identifiers
    const teamMap: Record<string, string> = {
      REAL_MADRID: "REAL",
      FC_BARCELONA: "BARCA",
      MANCHESTER_UNITED: "MANU",
      MANCHESTER_CITY: "MACI",
      LIVERPOOL: "LIVE",
      CHELSEA: "CHEL",
      ARSENAL: "ARSE",
      TOTTENHAM: "TOTT",
      BAYERN_MUNICH: "BAYE",
      BORUSSIA_DORTMUND: "DORT",
      JUVENTUS: "JUVE",
      AC_MILAN: "MILA",
      INTER_MILAN: "INTE",
      PSG: "PSG_",
      ATLETICO_MADRID: "ATLE",
    };
    return teamMap[team] || team.substring(0, 4).toUpperCase();
  };

  const getLeagueIdentifier = (league: EnumLeague): string => {
    const leagueMap: Record<string, string> = {
      PREMIER_LEAGUE: "PL",
      LA_LIGA: "LL",
      BUNDESLIGA: "BL",
      SERIE_A: "SA",
      LIGUE_1: "L1",
    };
    return leagueMap[league] || "XX";
  };

  const generateProductName = (
    team: string,
    year: string,
    yearEnd: number,
    homeAway: EnumHomeAway
  ): string => {
    // Format: "Manchester United 2023-24 Home Shirt"
    const teamName = formatTeamName(team);
    const yearFormatted = `${year}-${yearEnd.toString().padStart(2, "0")}`;
    const homeAwayText = homeAway.charAt(0) + homeAway.slice(1).toLowerCase();

    return `${teamName} ${yearFormatted} ${homeAwayText} Shirt`;
  };

  const updateFormData = async (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };

    // Auto-calculate yearEnd when year changes (only for complete 4-digit years)
    if (field === "year" && value && value.length === 4) {
      const yearNum = parseInt(value);
      if (!isNaN(yearNum) && yearNum >= 1900 && yearNum <= 2100) {
        // Get last 2 digits of next year (handles 1999 -> 00, 2025 -> 26)
        const nextYear = yearNum + 1;
        newFormData.yearEnd = nextYear % 100;
      }
    }

    // Auto-generate SKU when team or year changes (only for complete years)
    if (
      (field === "team" || field === "year") &&
      newFormData.team &&
      newFormData.year &&
      newFormData.year.length === 4
    ) {
      const generatedSKU = await generateSKU(
        newFormData.team,
        newFormData.year
      );
      newFormData.sku = generatedSKU;
    }

    // Auto-generate name when key fields change (only for complete data)
    if (
      field === "team" ||
      field === "year" ||
      field === "yearEnd" ||
      field === "homeAway"
    ) {
      if (
        newFormData.team &&
        newFormData.year &&
        newFormData.year.length === 4 &&
        newFormData.yearEnd
      ) {
        newFormData.name = generateProductName(
          newFormData.team,
          newFormData.year,
          newFormData.yearEnd,
          newFormData.homeAway
        );
      }
    }

    setFormData(newFormData);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      team: "",
      year: "2025",
      yearEnd: 26,
      league: "",
      homeAway: "HOME" as EnumHomeAway,
      status: "ACTIVE" as EnumProductStatus,
      shirtType: "NORMAL" as EnumShirtType,
      productType: "SHIRT" as EnumProductType,
    });
    setSelectedTeam("");
    setAutoLeague(undefined);
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

  const filteredAndSortedProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any = a[sortColumn as keyof Product];
      let bValue: any = b[sortColumn as keyof Product];

      if (sortColumn === "createdAt") {
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

  const handleDelete = async (id: string) => {
    try {
      await api.products.delete(id);
      toast.success("Product deleted successfully");
      fetchProducts(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product");
    }
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
    setFormData({
      name: product.name,
      sku: product.sku,
      team: (product.team as string) || "",
      year: product.year,
      yearEnd: product.yearEnd,
      league: (product.league as string) || "",
      homeAway: (product.homeAway as EnumHomeAway) || ("HOME" as EnumHomeAway),
      status: product.productStatus,
      shirtType:
        (product.shirtType as EnumShirtType) || ("NORMAL" as EnumShirtType),
      productType: product.productType,
    });
    setSelectedTeam((product.team as string) || "");
    setAutoLeague(product.league);
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
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  resetForm();
                }}
              >
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
                {/* First Row: Team, Type, Year, Year End */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="team">Team *</Label>
                    <Select
                      value={formData.team}
                      onValueChange={(value) => {
                        updateFormData("team", value);
                        setSelectedTeam(value);
                        const league = getLeagueForTeam(value);
                        setAutoLeague(league);
                        updateFormData("league", league);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {getAllTeams()
                          .sort()
                          .map((team) => (
                            <SelectItem key={team} value={team}>
                              {formatTeamName(team)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="homeAway">Type *</Label>
                    <Select
                      value={formData.homeAway}
                      onValueChange={(value) =>
                        updateFormData("homeAway", value)
                      }
                    >
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
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      value={formData.year}
                      onChange={(e) => updateFormData("year", e.target.value)}
                      placeholder="2025"
                      pattern="[0-9]{4}"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearEnd">Year End *</Label>
                    <Input
                      id="yearEnd"
                      type="text"
                      value={formData.yearEnd}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only 1-2 digits
                        if (value === "" || /^\d{1,2}$/.test(value)) {
                          updateFormData("yearEnd", parseInt(value) || 0);
                        }
                      }}
                      placeholder="26"
                      maxLength={2}
                    />
                  </div>
                </div>

                {/* Second Row: Auto-generated Name and SKU */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Product Name{" "}
                      <span className="text-muted-foreground">
                        (Auto-generated, editable)
                      </span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Manchester United 2025-26 Home Shirt"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">
                      SKU{" "}
                      <span className="text-muted-foreground">
                        (Auto-generated, editable)
                      </span>
                    </Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      placeholder="MANU251234"
                      required
                    />
                  </div>
                </div>

                {/* Third Row: League and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="league">League (Auto-assigned)</Label>
                    <Input
                      id="league"
                      value={
                        autoLeague
                          ? autoLeague.replace(/_/g, " ")
                          : "Select a team first"
                      }
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => updateFormData("status", value)}
                    >
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
                </div>

                {/* Generate Variants Button */}
                {editingProduct && (
                  <div className="space-y-2 border-t pt-4">
                    <Label>Product Variants</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        try {
                          const response = await api.products.generateVariants(
                            editingProduct.id,
                            false // isRetro - can be determined from product type if needed
                          );
                          if (response.success) {
                            toast.success(
                              `Generated ${response.data.count} variants successfully!`
                            );
                          } else {
                            toast.error("Failed to generate variants");
                          }
                        } catch (error: any) {
                          toast.error(
                            error.message || "Failed to generate variants"
                          );
                        }
                      }}
                    >
                      Generate 15 Default Variants (5 sizes × 3 patches)
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Generates: XXL, XL, L, M, S with Champions League, No
                      Patch, and League Patch options
                    </p>
                  </div>
                )}
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
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("sku")}
                      className="h-auto p-0 font-semibold"
                    >
                      SKU
                      {getSortIcon("sku")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("name")}
                      className="h-auto p-0 font-semibold"
                    >
                      Name
                      {getSortIcon("name")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("team")}
                      className="h-auto p-0 font-semibold"
                    >
                      Team
                      {getSortIcon("team")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("league")}
                      className="h-auto p-0 font-semibold"
                    >
                      League
                      {getSortIcon("league")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("year")}
                      className="h-auto p-0 font-semibold"
                    >
                      Year
                      {getSortIcon("year")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("productType")}
                      className="h-auto p-0 font-semibold"
                    >
                      Type
                      {getSortIcon("productType")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("productStatus")}
                      className="h-auto p-0 font-semibold"
                    >
                      Status
                      {getSortIcon("productStatus")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No products found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedProducts.map((product: Product) => (
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
                            onClick={() => {
                              setSelectedProductForVariants(product);
                              setVariantManagerOpen(true);
                            }}
                            title="Manage variants"
                          >
                            <Package className="h-4 w-4" />
                          </Button>
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

      {/* Variant Manager Dialog */}
      {selectedProductForVariants && (
        <VariantManager
          productId={selectedProductForVariants.id}
          productName={selectedProductForVariants.name}
          open={variantManagerOpen}
          onOpenChange={setVariantManagerOpen}
        />
      )}

      {/* Status Change Confirmation Dialog */}
      <AlertDialog
        open={!!pendingStatusChange}
        onOpenChange={() => setPendingStatusChange(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of{" "}
              <span className="font-semibold">
                {pendingStatusChange?.productName}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {pendingStatusChange?.newStatus
                  .replace(/_/g, " ")
                  .toLowerCase()}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatusChange(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingStatusChange) return;
                setProducts(
                  products.map((product) =>
                    product.id === pendingStatusChange.productId
                      ? {
                          ...product,
                          productStatus: pendingStatusChange.newStatus,
                          updatedAt: new Date(),
                        }
                      : product
                  )
                );
                toast.success("Product status updated successfully");
                setPendingStatusChange(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
