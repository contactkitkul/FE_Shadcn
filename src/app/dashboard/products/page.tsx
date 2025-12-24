"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import {
  Search,
  Plus,
  Package,
  Edit,
  Copy,
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
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { TOAST_MESSAGES, getEntityMessages } from "@/config/messages";
import {
  getAllTeams,
  getLeagueForTeam,
  formatTeamName,
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
    shirtType: "FAN" as EnumShirtType,
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

  const [statusFilter, setStatusFilter] = useState<"ALL" | EnumProductStatus>(
    "ALL"
  );
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const PAGE_SIZE = 50;

  // Fetch products from API - sorting done client-side for speed
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.products.getAll({
        page,
        limit: PAGE_SIZE,
        search: searchTerm,
      });

      if (response.success) {
        const data = response.data;
        setProducts(data?.data || []);
        setPagination(data?.pagination || null);
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
  }, [debouncedSearch, page]); // Removed sort deps - sorting is client-side

  // Auto-generation functions
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
      shirtType: "FAN" as EnumShirtType,
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

  // Filter and sort products client-side for better performance
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((product) => {
      return statusFilter === "ALL" || product.productStatus === statusFilter;
    });

    // Client-side sorting
    result.sort((a, b) => {
      let aVal: any = a[sortColumn as keyof Product];
      let bVal: any = b[sortColumn as keyof Product];

      if (sortColumn === "createdAt" || sortColumn === "updatedAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase() || "";
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, statusFilter, sortColumn, sortDirection]);

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

  const handleDuplicate = async (product: Product) => {
    try {
      const newSku = `${product.sku}-COPY-${Date.now().toString().slice(-4)}`;
      const newName = `${product.name} (Copy)`;

      await api.products.duplicate(product.id, {
        sku: newSku,
        name: newName,
        year: product.year,
        yearEnd: product.yearEnd,
      });

      toast.success("Product duplicated successfully");
      fetchProducts();
    } catch (error: any) {
      console.error("Error duplicating product:", error);
      toast.error(error.message || "Failed to duplicate product");
    }
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
        (product.shirtType as EnumShirtType) || ("FAN" as EnumShirtType),
      productType: product.productType,
    });
    setSelectedTeam((product.team as string) || "");
    setAutoLeague(product.league);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.team || !formData.year || !formData.sku || !formData.name) {
        toast.error("Please fill in Team, Year, Name and SKU");
        return;
      }

      if (editingProduct) {
        await api.products.update(editingProduct.id, {
          sku: formData.sku,
          name: formData.name,
          year: formData.year,
          yearEnd: formData.yearEnd,
          homeAway: formData.homeAway,
          shirtType: formData.shirtType,
          productType: formData.productType,
          productStatus: formData.status,
        });
      } else {
        await api.products.create({
          sku: formData.sku,
          name: formData.name,
          year: formData.year,
          yearEnd: formData.yearEnd,
          team: formData.team,
          homeAway: formData.homeAway,
          shirtType: formData.shirtType,
          productType: formData.productType,
          productStatus: formData.status,
        });
      }

      toast.success(
        editingProduct
          ? "Product updated successfully"
          : "Product created successfully"
      );
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Failed to save product");
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Products
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
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
                      <SelectTrigger disabled={!!editingProduct}>
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
                      <span className="text-muted-foreground">(Required)</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Products</CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as "ALL" | EnumProductStatus)
                }
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CrudDataTable<Product>
            data={filteredAndSortedProducts}
            loading={loading}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            getRowKey={(product) => product.id}
            emptyIcon={<Package className="h-12 w-12 text-muted-foreground" />}
            emptyMessage="No products found"
            pagination={
              pagination && pagination.totalPages > 1
                ? {
                    page: pagination.page,
                    totalPages: pagination.totalPages,
                    onPageChange: setPage,
                  }
                : undefined
            }
            mobileCardActions={(product) => (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProductForVariants(product);
                    setVariantManagerOpen(true);
                  }}
                >
                  <Package className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(product);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
            columns={[
              {
                key: "name",
                header: "Name",
                sortable: true,
                isPrimary: true,
              },
              {
                key: "sku",
                header: "SKU",
                sortable: true,
                mobileLabel: "SKU",
                render: (product) => (
                  <span className="font-medium">{product.sku}</span>
                ),
              },
              {
                key: "team",
                header: "Team",
                sortable: true,
                mobileLabel: "Team",
                render: (product) => product.team?.replace(/_/g, " "),
              },
              {
                key: "league",
                header: "League",
                sortable: true,
                hideOnMobile: true,
                render: (product) => product.league?.replace(/_/g, " "),
              },
              {
                key: "year",
                header: "Year",
                sortable: true,
                mobileLabel: "Year",
              },
              {
                key: "homeAway",
                header: "Type",
                sortable: true,
                hideOnMobile: true,
              },
              {
                key: "productStatus",
                header: "Status",
                sortable: true,
                isSecondary: true,
                render: (product) => getStatusBadge(product.productStatus),
              },
              {
                key: "actions",
                header: "Actions",
                className: "text-right",
                hideOnMobile: true,
                render: (product) => (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(product);
                      }}
                      title="Duplicate product"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(product);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(product.id);
                      }}
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
              onClick={async () => {
                if (!pendingStatusChange) return;
                try {
                  await api.products.update(pendingStatusChange.productId, {
                    productStatus: pendingStatusChange.newStatus,
                  });
                  toast.success("Product status updated successfully");
                  setPendingStatusChange(null);
                  fetchProducts();
                } catch (error: any) {
                  console.error("Error updating product status:", error);
                  toast.error(error.message || "Failed to update status");
                }
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
