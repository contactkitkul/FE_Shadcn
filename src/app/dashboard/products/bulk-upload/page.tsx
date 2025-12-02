"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface UploadResult {
  success: number;
  failed: number;
  errors: Array<{ index: number; sku?: string; error: string }>;
}

export default function BulkUploadPage() {
  const router = useRouter();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file");
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // Parse CSV
      const text = await csvFile.text();
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim());

      setProgress(20);

      const products = lines.slice(1).map((line, index) => {
        const values = line.split(",").map((v) => v.trim());
        const product: any = {};

        headers.forEach((header, i) => {
          const value = values[i];
          // Convert string values to appropriate types
          if (
            header === "featuresCurrentSeason" ||
            header === "featuresLongSleeve"
          ) {
            product[header] = value?.toLowerCase() === "true";
          } else {
            product[header] = value;
          }
        });

        return product;
      });

      setProgress(40);

      // Upload products in bulk
      const response = await api.products.bulkCreate(products);

      setProgress(100);

      setResult({
        success: response.data.created || products.length,
        failed: response.data.failed || 0,
        errors: response.data.errors || [],
      });

      toast.success(
        `Successfully uploaded ${
          response.data.created || products.length
        } products`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to upload products");
      setResult({
        success: 0,
        failed: 1,
        errors: [{ index: 0, error: error.message }],
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `team,homeAway,year,shirtType,productType
Manchester_United_FC,HOME,2025,FAN,SHIRT
Real_Madrid_CF,AWAY,2025,PLAYER,SHIRT
Chelsea_FC,THIRD,2025,FAN,SHIRT`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Bulk Product Upload
          </h2>
          <p className="text-muted-foreground">
            Upload multiple products at once using a simple CSV file
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upload Products via CSV</CardTitle>
            {/* <CardDescription>
              Upload multiple products at once using a simple CSV file with 5
              fields
            </CardDescription> */}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">Select CSV File *</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                disabled={uploading}
              />
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with 5 columns: team, homeAway, year,
                shirtType, productType
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCsvUpload}
                disabled={!csvFile || uploading}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Products
              </Button>
              <Button variant="outline" onClick={downloadTemplate}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>

            {uploading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">CSV Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">5 Required Fields</h4>
                <p className="text-muted-foreground text-xs mb-3">
                  Your CSV must have these columns in this exact order:
                </p>
                <div className="bg-muted p-3 rounded-md font-mono text-xs mb-3">
                  team,homeAway,year,shirtType,productType
                </div>
                <ol className="list-decimal list-inside text-muted-foreground space-y-2 text-xs">
                  <li>
                    <strong>team</strong> - Team name (e.g.,
                    Manchester_United_FC)
                  </li>
                  <li>
                    <strong>homeAway</strong> - HOME, AWAY, THIRD, or GOALKEEPER
                  </li>
                  <li>
                    <strong>year</strong> - 4-digit year (e.g., 2025)
                  </li>
                  <li>
                    <strong>shirtType</strong> - FAN, PLAYER, or RETRO
                  </li>
                  <li>
                    <strong>productType</strong> - SHIRT
                  </li>
                </ol>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Example Row</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-x-auto">
                  Manchester_United_FC,HOME,2025,FAN,SHIRT
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Auto-Generated Fields</h4>
                <p className="text-muted-foreground text-xs mb-2">
                  These are created automatically:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs ml-2">
                  <li>Product name</li>
                  <li>SKU code</li>
                  <li>Year end (e.g., 2025 → 26)</li>
                  <li>League (from team)</li>
                  <li>Status (ACTIVE)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upload Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{result.success} products uploaded successfully</span>
                </div>
                {result.failed > 0 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span>{result.failed} products failed</span>
                  </div>
                )}
                {result.errors.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1 text-sm">
                        {result.errors.slice(0, 5).map((error, i) => (
                          <div key={i}>
                            Row {error.index + 1}: {error.error}
                          </div>
                        ))}
                        {result.errors.length > 5 && (
                          <div className="text-muted-foreground">
                            ...and {result.errors.length - 5} more errors
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
