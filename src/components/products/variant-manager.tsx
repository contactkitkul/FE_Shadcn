"use client";

import { useState } from "react";
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
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { EnumSize, EnumPatch, type ProductVariant } from "@/types";

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
    stockQty: 50,
  },
  {
    size: EnumSize.M,
    patch: EnumPatch.NO_PATCH,
    sellPrice: 19.99,
    costPrice: 10.0,
    stockQty: 50,
  },
  {
    size: EnumSize.L,
    patch: EnumPatch.NO_PATCH,
    sellPrice: 19.99,
    costPrice: 10.0,
    stockQty: 50,
  },
  {
    size: EnumSize.XL,
    patch: EnumPatch.NO_PATCH,
    sellPrice: 19.99,
    costPrice: 10.0,
    stockQty: 50,
  },
  {
    size: EnumSize.XXL,
    patch: EnumPatch.NO_PATCH,
    sellPrice: 19.99,
    costPrice: 10.0,
    stockQty: 50,
  },
];

export function VariantManager({
  productId,
  productName,
  open,
  onOpenChange,
}: VariantManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: "1",
      createdAt: new Date(),
      updatedAt: new Date(),
      productId,
      size: EnumSize.S,
      patch: EnumPatch.NO_PATCH,
      sellPrice: 19.99,
      costPrice: 10.0,
      stockQty: 50,
    },
    {
      id: "2",
      createdAt: new Date(),
      updatedAt: new Date(),
      productId,
      size: EnumSize.M,
      patch: EnumPatch.NO_PATCH,
      sellPrice: 19.99,
      costPrice: 10.0,
      stockQty: 50,
    },
  ]);

  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const addDefaultVariants = () => {
    const newVariants: ProductVariant[] = DEFAULT_VARIANTS.map((v, idx) => ({
      ...v,
      id: `new-${Date.now()}-${idx}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      productId,
    }));
    setVariants([...variants, ...newVariants]);
    toast.success(`Added ${newVariants.length} default variants`);
  };

  const addCustomVariant = (
    variant: Omit<
      ProductVariant,
      "id" | "createdAt" | "updatedAt" | "productId"
    >
  ) => {
    const newVariant: ProductVariant = {
      ...variant,
      id: `new-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      productId,
    };
    setVariants([...variants, newVariant]);
    toast.success("Variant added successfully");
    setIsAddDialogOpen(false);
  };

  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setVariants(
      variants.map((v) =>
        v.id === id ? { ...v, ...updates, updatedAt: new Date() } : v
      )
    );
    toast.success("Variant updated");
  };

  const deleteVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
    toast.success("Variant deleted");
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
            <div className="flex gap-2">
              <Button onClick={addDefaultVariants} variant="outline" size="sm">
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
                      No variants added yet. Click - Add Default Variants - to
                      get started.
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
                        <Input
                          type="number"
                          value={variant.stockQty}
                          onChange={(e) =>
                            updateVariant(variant.id, {
                              stockQty: parseInt(e.target.value),
                            })
                          }
                          className="w-[80px]"
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Variants saved successfully");
                onOpenChange(false);
              }}
            >
              Save Variants
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
                stockQty: parseInt(formData.get("stockQty") as string),
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
                  defaultValue="10.00"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockQty">Stock Quantity</Label>
              <Input
                id="stockQty"
                name="stockQty"
                type="number"
                defaultValue="50"
                required
              />
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
