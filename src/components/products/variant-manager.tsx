"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EnumSize, EnumPatch, type ProductVariant } from "@/types";
import { api } from "@/lib/api";

interface VariantManagerProps {
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_SIZES = Object.values(EnumSize);
const DEFAULT_PATCHES = Object.values(EnumPatch);

const DEFAULT_VARIANTS: Omit<
  ProductVariant,
  "id" | "createdAt" | "updatedAt" | "productId"
>[] = [
  {
    size: EnumSize.S,
    patch: EnumPatch.NO_PATCH,
    sellPrice: 19.99,
    costPrice: 10.0,
  },
  {
    size: EnumSize.M,
    patch: EnumPatch.NO_PATCH,
    sellPrice: 19.99,
    costPrice: 10.0,
  },
  {
    size: EnumSize.L,
    patch: EnumPatch.NO_PATCH,
    sellPrice: 19.99,
    costPrice: 10.0,
  },
  {
    size: EnumSize.XL,
    patch: EnumPatch.NO_PATCH,
    sellPrice: 19.99,
    costPrice: 10.0,
  },
  {
    size: EnumSize.XXL,
    patch: EnumPatch.NO_PATCH,
    sellPrice: 19.99,
    costPrice: 10.0,
  },
];

export function VariantManager({
  productId,
  productName,
  open,
  onOpenChange,
}: VariantManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch variants when dialog opens
  useEffect(() => {
    if (open && productId) {
      fetchVariants();
    }
  }, [open, productId]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const response = await api.productVariants.getAll({
        productId,
        limit: 100,
      } as any);
      if (response.success && response.data) {
        setVariants(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch variants:", error);
      toast.error("Failed to load variants");
    } finally {
      setLoading(false);
    }
  };

  const addDefaultVariants = async () => {
    try {
      // Call backend to generate default variants
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ productId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate variants");
      }

      const data = await response.json();
      toast.success(`Added ${data.data.count} default variants`);
      await fetchVariants(); // Refresh list
    } catch (error) {
      console.error("Failed to add default variants:", error);
      toast.error("Failed to add default variants");
    }
  };

  const addCustomVariant = async (
    variant: Omit<
      ProductVariant,
      "id" | "createdAt" | "updatedAt" | "productId"
    >
  ) => {
    try {
      await api.productVariants.create({
        ...variant,
        productId,
      });
      toast.success("Variant added successfully");
      setIsAddDialogOpen(false);
      await fetchVariants(); // Refresh list
    } catch (error) {
      console.error("Failed to add variant:", error);
      toast.error("Failed to add variant");
    }
  };

  const updateVariant = async (
    id: string,
    updates: Partial<ProductVariant>
  ) => {
    try {
      // Optimistically update UI
      setVariants(
        variants.map((v) =>
          v.id === id ? { ...v, ...updates, updatedAt: new Date() } : v
        )
      );

      // Save to backend
      await api.productVariants.update(id, updates);
    } catch (error) {
      console.error("Failed to update variant:", error);
      toast.error("Failed to update variant");
      // Revert on error
      await fetchVariants();
    }
  };

  const deleteVariant = async (id: string) => {
    try {
      await api.productVariants.delete(id);
      setVariants(variants.filter((v) => v.id !== id));
      toast.success("Variant deleted");
    } catch (error) {
      console.error("Failed to delete variant:", error);
      toast.error("Failed to delete variant");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Product Variants</DialogTitle>
            <DialogDescription>
              {productName} - Configure sizes, patches, pricing, and stock
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading variants...</span>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Button
                    onClick={addDefaultVariants}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Default Variants (S, M, L, XL, XXL)
                  </Button>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Custom Variant
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Patch</TableHead>
                      <TableHead>Sell Price</TableHead>
                      <TableHead>Cost Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >
                          No variants added yet. Click - Add Default Variants -
                          to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      variants.map((variant) => (
                        <TableRow key={variant.id}>
                          <TableCell>
                            <Select
                              value={variant.size}
                              onValueChange={(value) =>
                                updateVariant(variant.id, {
                                  size: value as EnumSize,
                                })
                              }
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DEFAULT_SIZES.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={variant.patch}
                              onValueChange={(value) =>
                                updateVariant(variant.id, {
                                  patch: value as EnumPatch,
                                })
                              }
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DEFAULT_PATCHES.map((patch) => (
                                  <SelectItem key={patch} value={patch}>
                                    {patch.replace(/_/g, " ")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={variant.sellPrice}
                              onChange={(e) =>
                                updateVariant(variant.id, {
                                  sellPrice: parseFloat(e.target.value),
                                })
                              }
                              className="w-[100px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={variant.costPrice}
                              onChange={(e) =>
                                updateVariant(variant.id, {
                                  costPrice: parseFloat(e.target.value),
                                })
                              }
                              className="w-[100px]"
                            />
                          </TableCell>

                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteVariant(variant.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Custom Variant Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Variant</DialogTitle>
            <DialogDescription>
              Configure a new product variant
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addCustomVariant({
                size: formData.get("size") as EnumSize,
                patch: formData.get("patch") as EnumPatch,
                sellPrice: parseFloat(formData.get("sellPrice") as string),
                costPrice: parseFloat(formData.get("costPrice") as string),
              });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Select name="size" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="patch">Patch</Label>
              <Select name="patch" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select patch" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_PATCHES.map((patch) => (
                    <SelectItem key={patch} value={patch}>
                      {patch.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sellPrice">Sell Price (€)</Label>
                <Input
                  id="sellPrice"
                  name="sellPrice"
                  type="number"
                  step="0.01"
                  defaultValue="19.99"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price (€)</Label>
                <Input
                  id="costPrice"
                  name="costPrice"
                  type="number"
                  step="0.01"
                  defaultValue="19.90"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Variant</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
