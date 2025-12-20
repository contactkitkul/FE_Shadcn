"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Truck, Plus, Trash2, ExternalLink, Mail } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface TrackingRow {
  provider: string;
  trackingNumber: string;
}

interface OrderTrackingCardProps {
  orderId: string;
  onTrackingSaved?: () => void;
}

const TRACKING_PROVIDERS = [
  { value: "DHL", label: "DHL" },
  { value: "FedEx", label: "FedEx" },
  { value: "UPS", label: "UPS" },
  { value: "Royal Mail", label: "Royal Mail" },
  { value: "USPS", label: "USPS" },
  { value: "La Poste", label: "La Poste" },
];

function getTrackingUrl(provider: string, trackingNumber: string): string {
  const urls: Record<string, string> = {
    DHL: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    FedEx: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    UPS: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    "Royal Mail": `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`,
    USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    "La Poste": `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`,
  };
  return urls[provider] || "#";
}

export function OrderTrackingCard({
  orderId,
  onTrackingSaved,
}: OrderTrackingCardProps) {
  const [trackingRows, setTrackingRows] = useState<TrackingRow[]>([
    { provider: "", trackingNumber: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleAddRow = () => {
    setTrackingRows([...trackingRows, { provider: "", trackingNumber: "" }]);
  };

  const handleRemoveRow = (index: number) => {
    setTrackingRows(trackingRows.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: keyof TrackingRow,
    value: string
  ) => {
    const updated = [...trackingRows];
    updated[index][field] = value;
    setTrackingRows(updated);
  };

  const handleResendEmail = async () => {
    setSendingEmail(true);
    try {
      const response = await api.orders.resendTrackingEmail(orderId);
      if (response.success) {
        toast.success("Tracking email sent successfully");
      } else {
        toast.error(response.message || "Failed to send email");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send tracking email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSave = async () => {
    const validRows = trackingRows.filter(
      (row) => row.provider && row.trackingNumber.trim()
    );

    if (validRows.length === 0) {
      toast.error("Please add at least one tracking detail");
      return;
    }

    setSaving(true);
    try {
      let successCount = 0;
      for (const row of validRows) {
        try {
          await api.orders.addTracking(orderId, row.trackingNumber);
          successCount++;
        } catch (error: any) {
          if (!error.message?.includes("already exists")) {
            throw error;
          }
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} tracking number(s) saved`);
        onTrackingSaved?.();
      } else {
        toast.info("All tracking numbers already exist");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save tracking");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          <CardTitle className="text-base">Tracking Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {trackingRows.map((row, index) => (
          <div key={index} className="flex gap-2">
            <Select
              value={row.provider}
              onValueChange={(value) => handleChange(index, "provider", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                {TRACKING_PROVIDERS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Tracking number"
              value={row.trackingNumber}
              onChange={(e) =>
                handleChange(index, "trackingNumber", e.target.value)
              }
              className="flex-1"
            />
            {row.provider && row.trackingNumber && (
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  window.open(
                    getTrackingUrl(row.provider, row.trackingNumber),
                    "_blank"
                  )
                }
                title="Track shipment"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            {trackingRows.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRow(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tracking
        </Button>

        <Separator />

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? "Saving..." : "Save Tracking"}
          </Button>
          <Button
            variant="outline"
            onClick={handleResendEmail}
            disabled={sendingEmail}
            title="Resend tracking email to customer"
          >
            <Mail className="h-4 w-4 mr-2" />
            {sendingEmail ? "Sending..." : "Resend Email"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
