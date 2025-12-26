"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import * as XLSX from "xlsx";

interface ParsedRow {
  orderID: string;
  trackingNumbers: string[];
}

interface UploadResult {
  orderID: string;
  success: boolean;
  added: string[];
  skipped: string[];
  error?: string;
}

export default function ShippingCodesPage() {
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      setResults([]);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          }) as any[][];

          // Skip header row, parse data
          const parsed: ParsedRow[] = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length < 2) continue;

            const orderID = String(row[0] || "").trim();
            const trackingCodesRaw = String(row[1] || "").trim();

            if (!orderID || !trackingCodesRaw) continue;

            // Split tracking codes by comma
            const trackingNumbers = trackingCodesRaw
              .split(",")
              .map((code) => code.trim())
              .filter((code) => code.length > 0);

            if (trackingNumbers.length > 0) {
              parsed.push({ orderID, trackingNumbers });
            }
          }

          setParsedData(parsed);
          toast.success(`Parsed ${parsed.length} orders from file`);
        } catch (error) {
          console.error("Error parsing file:", error);
          toast.error("Failed to parse Excel file");
        }
      };

      reader.readAsArrayBuffer(file);
    },
    []
  );

  const handleProcess = async () => {
    if (parsedData.length === 0) {
      toast.error("No data to process");
      return;
    }

    setProcessing(true);
    try {
      const response = await api.bulkTracking.upload(parsedData);

      if (response.success && response.data) {
        setResults(response.data.results || []);
        const summary = response.data.summary;
        toast.success(
          `Processed ${summary.total} orders. Added ${summary.totalAdded} tracking numbers.`
        );
      } else {
        toast.error(response.error || "Failed to process tracking codes");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process tracking codes");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      ["Order Number", "Shipping Code(s)"],
      ["FUTGY@ABC123", "DHL123456789"],
      ["FUTGY@DEF456", "FEDEX111222333,FEDEX444555666"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shipping Codes");
    XLSX.writeFile(wb, "shipping_codes_template.xlsx");
  };

  const handleClear = () => {
    setParsedData([]);
    setResults([]);
    setFileName("");
  };

  return (
    <div className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Bulk Shipping Codes</h2>
          <p className="text-muted-foreground">
            Upload an Excel file to add tracking numbers to multiple orders
          </p>
        </div>
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Upload Excel File
            </CardTitle>
            <CardDescription>
              Excel file should have columns: Order Number, Shipping Code(s)
              <br />
              Multiple shipping codes can be separated by commas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-muted-foreground">
                  .xlsx, .xls, or .csv
                </span>
              </label>
            </div>

            {fileName && (
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="text-sm font-medium">{fileName}</span>
                </div>
                <Badge variant="secondary">{parsedData.length} orders</Badge>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleProcess}
                disabled={parsedData.length === 0 || processing}
                className="flex-1"
              >
                {processing ? "Processing..." : "Process Tracking Codes"}
              </Button>
              {parsedData.length > 0 && (
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Download the template or create your own Excel file</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>Column A: Order Number (e.g., FUTGY@ABC123)</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>
                Column B: Shipping Code(s) - separate multiple codes with commas
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>Upload the file and click "Process"</span>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="font-medium">What happens:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>New tracking codes are added to orders</li>
                <li>Existing codes are skipped (no duplicates)</li>
                <li>Order status changes to "Partially Fulfilled"</li>
                <li>Tracking email is sent to customer automatically</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Table */}
      {parsedData.length > 0 && results.length === 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preview ({parsedData.length} orders)</CardTitle>
            <CardDescription>Review the data before processing</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Tracking Codes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.slice(0, 20).map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono">{row.orderID}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {row.trackingNumbers.map((code, codeIdx) => (
                          <Badge key={codeIdx} variant="outline">
                            {code}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {parsedData.length > 20 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground"
                    >
                      ... and {parsedData.length - 20} more orders
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              {results.filter((r) => r.success).length} successful,{" "}
              {results.filter((r) => !r.success).length} failed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Skipped</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : result.error ===
                        "All tracking numbers already exist or invalid" ? (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono">
                      {result.orderID}
                    </TableCell>
                    <TableCell>
                      {result.added.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {result.added.map((code, codeIdx) => (
                            <Badge
                              key={codeIdx}
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              {code}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {result.skipped.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {result.skipped.map((code, codeIdx) => (
                            <Badge
                              key={codeIdx}
                              variant="outline"
                              className="text-muted-foreground"
                            >
                              {code}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {result.error && (
                        <span className="text-sm text-red-600">
                          {result.error}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
