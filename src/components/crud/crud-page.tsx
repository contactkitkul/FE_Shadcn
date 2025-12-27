"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CrudDataTable, Column } from "@/components/ui/crud-data-table";
import { StatsGrid, StatItem } from "@/components/ui/stats-grid";
import { Search, Download } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { format } from "date-fns";

// Column definition with responsive breakpoints
export interface CrudColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  // Responsive visibility
  minWidth?: "xs" | "sm" | "md" | "lg" | "xl"; // Show only above this breakpoint
  // Mobile card view
  isPrimary?: boolean;
  isSecondary?: boolean;
  mobileLabel?: string;
  hideOnMobile?: boolean;
  className?: string;
}

// Filter definition
export interface CrudFilter {
  key: string;
  label: string;
  type: "select" | "date";
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

// Date filter options
export interface DateFilterOption {
  value: string;
  label: string;
}

// Action handlers
export interface CrudActions<T> {
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onRowClick?: (item: T) => void;
  customActions?: (item: T) => React.ReactNode;
}

// Export configuration
export interface ExportConfig<T> {
  filename: string;
  headers: string[];
  rowMapper: (item: T) => (string | number)[];
}

// Main props
export interface CrudPageProps<T> {
  // Page header
  title: string;
  description?: string;

  // Data fetching
  data: T[];
  loading?: boolean;
  getRowKey: (item: T) => string;

  // Columns
  columns: CrudColumn<T>[];

  // Stats (optional)
  stats?: StatItem[];
  statsColumns?: 2 | 3 | 4 | 5;

  // Search
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;

  // Filters
  filters?: CrudFilter[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;

  // Date filter
  dateFilterOptions?: DateFilterOption[];
  dateFilterValue?: string;
  onDateFilterChange?: (value: string) => void;

  // Sorting
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;

  // Pagination
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };

  // Actions
  actions?: CrudActions<T>;

  // Header actions (buttons next to title)
  headerActions?: React.ReactNode;

  // Export
  exportConfig?: ExportConfig<T>;

  // Empty state
  emptyIcon?: React.ReactNode;
  emptyMessage?: string;

  // Custom content above table
  beforeTable?: React.ReactNode;
}

const defaultDateFilterOptions: DateFilterOption[] = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
];

export function CrudPage<T>({
  title,
  description,
  data,
  loading = false,
  getRowKey,
  columns,
  stats,
  statsColumns = 4,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters,
  filterValues = {},
  onFilterChange,
  dateFilterOptions,
  dateFilterValue,
  onDateFilterChange,
  sortColumn,
  sortDirection,
  onSort,
  pagination,
  actions,
  headerActions,
  exportConfig,
  emptyIcon,
  emptyMessage = "No data found",
  beforeTable,
}: CrudPageProps<T>) {
  // Convert columns to CrudDataTable format
  const tableColumns: Column<T>[] = columns.map((col) => ({
    key: col.key,
    header: col.header,
    sortable: col.sortable,
    render: col.render,
    className: col.className,
    isPrimary: col.isPrimary,
    isSecondary: col.isSecondary,
    mobileLabel: col.mobileLabel,
    hideOnMobile:
      col.hideOnMobile ||
      (col.minWidth && ["md", "lg", "xl"].includes(col.minWidth)),
  }));

  // Handle export
  const handleExport = () => {
    if (!exportConfig) return;

    const rows = data.map(exportConfig.rowMapper);
    const csvContent = [exportConfig.headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportConfig.filename}-${format(
      new Date(),
      "yyyy-MM-dd"
    )}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`Downloaded ${data.length} records`);
  };

  // Mobile card actions
  const mobileCardActions = actions?.customActions
    ? actions.customActions
    : undefined;

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 pt-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {exportConfig && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          {headerActions}
        </div>
      </div>

      {/* Date Filter Buttons */}
      {dateFilterOptions && onDateFilterChange && (
        <div className="flex flex-wrap gap-1">
          {(dateFilterOptions || defaultDateFilterOptions).map((option) => (
            <Button
              key={option.value}
              variant={dateFilterValue === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onDateFilterChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      {stats && stats.length > 0 && (
        <StatsGrid stats={stats} columns={statsColumns} loading={loading} />
      )}

      {/* Before Table Content */}
      {beforeTable}

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              {onSearchChange && (
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    className="pl-8 w-full sm:w-[250px]"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                  />
                </div>
              )}

              {/* Filters */}
              {filters?.map((filter) => (
                <Select
                  key={filter.key}
                  value={
                    filterValues[filter.key] || filter.defaultValue || "all"
                  }
                  onValueChange={(value) => onFilterChange?.(filter.key, value)}
                >
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CrudDataTable<T>
            data={data}
            loading={loading}
            columns={tableColumns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
            getRowKey={getRowKey}
            emptyIcon={emptyIcon}
            emptyMessage={emptyMessage}
            pagination={pagination}
            onRowClick={actions?.onRowClick}
            mobileCardActions={mobileCardActions}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for managing CRUD page state
export function useCrudPageState<T>(
  defaultSortColumn: string = "createdAt",
  defaultSortDirection: "asc" | "desc" = "desc"
) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [sortColumn, setSortColumn] = React.useState(defaultSortColumn);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    defaultSortDirection
  );
  const [filterValues, setFilterValues] = React.useState<
    Record<string, string>
  >({});
  const [dateFilter, setDateFilter] = React.useState("30d");
  const [page, setPage] = React.useState(1);

  const handleSort = React.useCallback(
    (column: string) => {
      if (sortColumn === column) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(column);
        setSortDirection("asc");
      }
    },
    [sortColumn]
  );

  const handleFilterChange = React.useCallback((key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Client-side sorting helper
  const sortData = React.useCallback(
    <T,>(data: T[], column: string, direction: "asc" | "desc"): T[] => {
      return [...data].sort((a, b) => {
        let aVal: any = (a as any)[column];
        let bVal: any = (b as any)[column];

        // Handle dates
        if (column === "createdAt" || column === "updatedAt") {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal?.toLowerCase() || "";
        }

        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
        return 0;
      });
    },
    []
  );

  // Date filter helper
  const filterByDate = React.useCallback(
    <T extends { createdAt: string | Date }>(
      data: T[],
      dateFilterValue: string
    ): T[] => {
      if (dateFilterValue === "all") return data;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      return data.filter((item) => {
        const itemDate = new Date(item.createdAt);
        const itemDay = new Date(
          itemDate.getFullYear(),
          itemDate.getMonth(),
          itemDate.getDate()
        );

        switch (dateFilterValue) {
          case "today":
            return itemDay.getTime() === today.getTime();
          case "yesterday":
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return itemDay.getTime() === yesterday.getTime();
          case "last7days":
            const last7 = new Date(today);
            last7.setDate(last7.getDate() - 7);
            return itemDate >= last7;
          case "last30days":
            const last30 = new Date(today);
            last30.setDate(last30.getDate() - 30);
            return itemDate >= last30;
          default:
            return true;
        }
      });
    },
    []
  );

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    sortColumn,
    sortDirection,
    handleSort,
    filterValues,
    handleFilterChange,
    dateFilter,
    setDateFilter,
    page,
    setPage,
    sortData,
    filterByDate,
  };
}
