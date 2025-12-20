"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MapPin, Edit, Check, X } from "lucide-react";
import { Order } from "@/types";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { validateAddress, type Address } from "@/lib/address-validation";

interface OrderAddressCardProps {
  order: Order;
  onOrderUpdate: (order: Order) => void;
}

interface AddressValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function OrderAddressCard({
  order,
  onOrderUpdate,
}: OrderAddressCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addressValues, setAddressValues] = useState({
    shippingName: order.shippingName || "",
    shippingLine1: order.shippingLine1 || "",
    shippingLine2: order.shippingLine2 || "",
    shippingCity: order.shippingCity || "",
    shippingState: order.shippingState || "",
    shippingPostalCode: order.shippingPostalCode || "",
    shippingCountry: order.shippingCountry || "",
    shippingPhone: order.shippingPhone || "",
    shippingEmail: order.shippingEmail || "",
  });

  const [validation, setValidation] = useState<AddressValidationResult | null>(
    () => {
      const address: Address = {
        line1: order.shippingLine1,
        line2: order.shippingLine2,
        city: order.shippingCity,
        state: order.shippingState,
        postalCode: order.shippingPostalCode,
        country: order.shippingCountry,
        name: order.shippingName,
      };
      return validateAddress(address);
    }
  );

  const handleEdit = () => {
    setAddressValues({
      shippingName: order.shippingName || "",
      shippingLine1: order.shippingLine1 || "",
      shippingLine2: order.shippingLine2 || "",
      shippingCity: order.shippingCity || "",
      shippingState: order.shippingState || "",
      shippingPostalCode: order.shippingPostalCode || "",
      shippingCountry: order.shippingCountry || "",
      shippingPhone: order.shippingPhone || "",
      shippingEmail: order.shippingEmail || "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.orders.update(order.id, addressValues);
      onOrderUpdate({ ...order, ...addressValues });
      setEditing(false);

      // Re-validate
      const address: Address = {
        line1: addressValues.shippingLine1,
        line2: addressValues.shippingLine2,
        city: addressValues.shippingCity,
        state: addressValues.shippingState,
        postalCode: addressValues.shippingPostalCode,
        country: addressValues.shippingCountry,
        name: addressValues.shippingName,
      };
      setValidation(validateAddress(address));

      toast.success("Address updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update address");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <CardTitle className="text-base">Shipping Address</CardTitle>
          </div>
          {!editing && (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Name</Label>
              <Input
                value={addressValues.shippingName}
                onChange={(e) =>
                  setAddressValues({
                    ...addressValues,
                    shippingName: e.target.value,
                  })
                }
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Address Line 1</Label>
              <Input
                value={addressValues.shippingLine1}
                onChange={(e) =>
                  setAddressValues({
                    ...addressValues,
                    shippingLine1: e.target.value,
                  })
                }
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Address Line 2</Label>
              <Input
                value={addressValues.shippingLine2}
                onChange={(e) =>
                  setAddressValues({
                    ...addressValues,
                    shippingLine2: e.target.value,
                  })
                }
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">City</Label>
                <Input
                  value={addressValues.shippingCity}
                  onChange={(e) =>
                    setAddressValues({
                      ...addressValues,
                      shippingCity: e.target.value,
                    })
                  }
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Postal Code</Label>
                <Input
                  value={addressValues.shippingPostalCode}
                  onChange={(e) =>
                    setAddressValues({
                      ...addressValues,
                      shippingPostalCode: e.target.value,
                    })
                  }
                  className="text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">State</Label>
                <Input
                  value={addressValues.shippingState}
                  onChange={(e) =>
                    setAddressValues({
                      ...addressValues,
                      shippingState: e.target.value,
                    })
                  }
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Country</Label>
                <Input
                  value={addressValues.shippingCountry}
                  onChange={(e) =>
                    setAddressValues({
                      ...addressValues,
                      shippingCountry: e.target.value,
                    })
                  }
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input
                value={addressValues.shippingPhone}
                onChange={(e) =>
                  setAddressValues({
                    ...addressValues,
                    shippingPhone: e.target.value,
                  })
                }
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input
                value={addressValues.shippingEmail}
                onChange={(e) =>
                  setAddressValues({
                    ...addressValues,
                    shippingEmail: e.target.value,
                  })
                }
                className="text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Check className="h-4 w-4 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground space-y-0.5">
            <p className="font-medium text-foreground">{order.shippingName}</p>
            <p>{order.shippingLine1}</p>
            {order.shippingLine2 && <p>{order.shippingLine2}</p>}
            <p>
              {order.shippingPostalCode} {order.shippingCity}
            </p>
            <p>
              {order.shippingState}, {order.shippingCountry}
            </p>
            <p>{order.shippingPhone}</p>
            <p className="text-blue-600">{order.shippingEmail}</p>
          </div>
        )}

        {/* Validation Results */}
        {validation && !editing && (
          <div className="mt-3 space-y-2">
            {validation.errors.length > 0 && (
              <div className="rounded-md bg-destructive/10 p-2">
                <p className="text-xs font-medium text-destructive mb-1">
                  Address Errors:
                </p>
                {validation.errors.map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive">
                    • {error}
                  </p>
                ))}
              </div>
            )}
            {validation.warnings.length > 0 && (
              <div className="rounded-md bg-yellow-50 p-2">
                <p className="text-xs font-medium text-yellow-800 mb-1">
                  Warnings:
                </p>
                {validation.warnings.map((warning, idx) => (
                  <p key={idx} className="text-xs text-yellow-700">
                    • {warning}
                  </p>
                ))}
              </div>
            )}
            {validation.isValid && validation.warnings.length === 0 && (
              <div className="rounded-md bg-green-50 p-2">
                <p className="text-xs text-green-700">
                  ✓ Address validated successfully
                </p>
              </div>
            )}
          </div>
        )}

        <Separator className="my-3" />
        <Button variant="link" className="h-auto p-0 text-sm">
          View map
        </Button>
      </CardContent>
    </Card>
  );
}
