import { useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

export interface ExportConfig<T> {
  filename: string;
  headers: string[];
  rowMapper: (item: T) => (string | number | boolean | null | undefined)[];
}

export interface UseExportOptions {
  dateFormat?: string;
  successMessage?: string;
  errorMessage?: string;
}

export function useExport<T>(
  config: ExportConfig<T>,
  options: UseExportOptions = {}
) {
  const {
    dateFormat = "yyyy-MM-dd",
    successMessage,
    errorMessage = "Failed to export data",
  } = options;

  const exportToCSV = useCallback(
    (data: T[]) => {
      try {
        if (data.length === 0) {
          toast.warning("No data to export");
          return;
        }

        // Map data to rows
        const rows = data.map(config.rowMapper);

        // Escape CSV values
        const escapeCSV = (value: any): string => {
          if (value === null || value === undefined) return "";
          const str = String(value);
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };

        // Build CSV content
        const csvContent = [
          config.headers.map(escapeCSV).join(","),
          ...rows.map((row) => row.map(escapeCSV).join(",")),
        ].join("\n");

        // Create and download file
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${config.filename}-${format(
          new Date(),
          dateFormat
        )}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(
          successMessage || `Exported ${data.length} records to CSV`
        );
      } catch (error) {
        console.error("Export error:", error);
        toast.error(errorMessage);
      }
    },
    [config, dateFormat, successMessage, errorMessage]
  );

  const exportToJSON = useCallback(
    (data: T[]) => {
      try {
        if (data.length === 0) {
          toast.warning("No data to export");
          return;
        }

        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${config.filename}-${format(
          new Date(),
          dateFormat
        )}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(
          successMessage || `Exported ${data.length} records to JSON`
        );
      } catch (error) {
        console.error("Export error:", error);
        toast.error(errorMessage);
      }
    },
    [config.filename, dateFormat, successMessage, errorMessage]
  );

  return { exportToCSV, exportToJSON };
}

// Convenience function for quick exports without hook
export function downloadCSV<T>(
  data: T[],
  config: ExportConfig<T>,
  dateFormat = "yyyy-MM-dd"
) {
  if (data.length === 0) {
    toast.warning("No data to export");
    return;
  }

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map(config.rowMapper);
  const csvContent = [
    config.headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${config.filename}-${format(new Date(), dateFormat)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  toast.success(`Exported ${data.length} records`);
}
