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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UploadResult {
  success: number;
  failed: number;
  errors: Array<{ index: number; sku?: string; error: string }>;
}

export default function BulkUploadPage() {
  const router = useRouter();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [jsonData, setJsonData] = useState("");
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

      setProgress(70);

      // Upload images if provided
      if (imageFiles && imageFiles.length > 0) {
        await uploadImages(response.data.products);
      }

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

  const handleJsonUpload = async () => {
    if (!jsonData.trim()) {
      toast.error("Please enter JSON data");
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const products = JSON.parse(jsonData);

      if (!Array.isArray(products)) {
        throw new Error("JSON must be an array of products");
      }

      setProgress(30);

      const response = await api.products.bulkCreate(products);

      setProgress(70);

      // Upload images if provided
      if (imageFiles && imageFiles.length > 0) {
        await uploadImages(response.data.products);
      }

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

  const uploadImages = async (products: any[]) => {
    if (!imageFiles) return;

    const imageMap = new Map<string, File[]>();

    // Group images by SKU
    Array.from(imageFiles).forEach((file) => {
      const fileName = file.name.split(".")[0]; // Remove extension
      const parts = fileName.split("_");

      if (parts.length >= 2) {
        const sku = parts.slice(0, -1).join("_"); // Everything except last part
        const position = parseInt(parts[parts.length - 1]); // Last part is position

        if (!imageMap.has(sku)) {
          imageMap.set(sku, []);
        }
        imageMap.get(sku)!.push(file);
      }
    });

    // Upload images for each product
    for (const product of products) {
      const images = imageMap.get(product.sku);

      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const formData = new FormData();
          formData.append("file", file);
          formData.append("productId", product.id);

          try {
            await api.images.upload(formData);
          } catch (error) {
            console.error(`Failed to upload image for ${product.sku}:`, error);
          }
        }
      }
    }
  };

  const downloadTemplate = () => {
    const template = `team,homeAway,year,yearEnd,name,sku,league,status,shirtType,productType
Manchester_United_FC,HOME,2025,26,Manchester United 2025-26 Home Shirt,MANU251234,PREMIER_LEAGUE,ACTIVE,NORMAL,SHIRT
Real_Madrid_CF,AWAY,2025,26,Real Madrid 2025-26 Away Shirt,REAL252345,LA_LIGA,ACTIVE,PLAYER,SHIRT
Chelsea_FC,THIRD,2025,26,Chelsea 2025-26 Third Shirt,CHEL253456,PREMIER_LEAGUE,ACTIVE,NORMAL,SHIRT`;

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
            Upload multiple products at once with CSV, JSON, or images
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upload Products</CardTitle>
            <CardDescription>
              Choose your preferred method to upload products in bulk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="csv">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="csv">CSV Upload</TabsTrigger>
                <TabsTrigger value="json">JSON Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="csv" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    disabled={uploading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload a CSV file with product data
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Product Images (Optional)</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImageFiles(e.target.files)}
                    disabled={uploading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Name format:{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">
                      SKU_position.jpg
                    </code>
                    <br />
                    Example:{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">
                      MU-HOME-23-24_1.jpg
                    </code>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCsvUpload}
                    disabled={!csvFile || uploading}
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                  </Button>
                  <Button variant="outline" onClick={downloadTemplate}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="json" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="json-data">JSON Data</Label>
                  <Textarea
                    id="json-data"
                    placeholder='[{"team": "Manchester_United_FC", "homeAway": "HOME", "year": "2025", "yearEnd": 26, "name": "Manchester United 2025-26 Home Shirt", "sku": "MANU251234", "league": "PREMIER_LEAGUE", "status": "ACTIVE", "shirtType": "NORMAL", "productType": "SHIRT"}]'
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                    disabled={uploading}
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Paste JSON array of products
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images-json">Product Images (Optional)</Label>
                  <Input
                    id="images-json"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImageFiles(e.target.files)}
                    disabled={uploading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Name format:{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">
                      SKU_position.jpg
                    </code>
                  </p>
                </div>

                <Button
                  onClick={handleJsonUpload}
                  disabled={!jsonData.trim() || uploading}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload JSON
                </Button>
              </TabsContent>
            </Tabs>

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
              <CardTitle className="text-base">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">CSV Format</h4>
                <p className="text-muted-foreground">
                  First row should contain column headers. Each subsequent row
                  represents a product.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Image Naming</h4>
                <p className="text-muted-foreground">
                  Images should be named as{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">
                    SKU_position
                  </code>
                  where position is a number (1, 2, 3, etc.)
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Field Order</h4>
                <p className="text-muted-foreground text-xs mb-2">
                  Enter fields in this order:
                </p>
                <ol className="list-decimal list-inside text-muted-foreground space-y-1 text-xs">
                  <li>team - Team name (e.g., Manchester_United_FC)</li>
                  <li>homeAway - HOME/AWAY/THIRD/GOALKEEPER</li>
                  <li>year - 4-digit year (e.g., 2025)</li>
                  <li>yearEnd - 2-digit year end (e.g., 26)</li>
                  <li>name - Auto-generated: Team 2025-26 Type Shirt</li>
                  <li>sku - Auto-generated: MANU251234 (4-letter team code)</li>
                  <li>league - League enum (PREMIER_LEAGUE, LA_LIGA, etc.)</li>
                  <li>status - ACTIVE/INACTIVE/OUT_OF_STOCK</li>
                  <li>shirtType - NORMAL/PLAYER/RETRO</li>
                  <li>productType - SHIRT</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2 mt-3">Auto-Generation</h4>
                <p className="text-muted-foreground text-xs">
                  Name and SKU are auto-generated based on team, year, and type.
                  You can override them in the CSV/JSON.
                </p>
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
