"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  // Mobile-specific options
  hideOnMobile?: boolean;
  mobileLabel?: string;
  isPrimary?: boolean; // Shows as card title on mobile
  isSecondary?: boolean; // Shows prominently on mobile card
}

export interface CrudDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
  emptyIcon?: React.ReactNode;
  emptyMessage?: string;
  getRowKey: (item: T) => string;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  // Mobile card view options
  onRowClick?: (item: T) => void;
  mobileCardActions?: (item: T) => React.ReactNode;
}

export function CrudDataTable<T>({
  data,
  columns,
  loading = false,
  sortColumn,
  sortDirection = "asc",
  onSort,
  emptyIcon,
  emptyMessage = "No data found",
  getRowKey,
  pagination,
  onRowClick,
  mobileCardActions,
}: CrudDataTableProps<T>) {
  const getSortIcon = (column: string) => {
    if (!onSort) return null;
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // Get primary and secondary columns for mobile card view
  const primaryCol = columns.find((c) => c.isPrimary);
  const secondaryCol = columns.find((c) => c.isSecondary);
  const mobileColumns = columns.filter(
    (c) => !c.hideOnMobile && !c.isPrimary && !c.isSecondary
  );

  if (loading) {
    return (
      <div className="space-y-2">
        {/* Desktop skeleton */}
        <div className="hidden md:block">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyIcon && <div className="mx-auto mb-4">{emptyIcon}</div>}
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Render mobile card for an item
  const renderMobileCard = (item: T) => {
    const primaryValue = primaryCol?.render
      ? primaryCol.render(item)
      : primaryCol
      ? (item as any)[primaryCol.key]?.toString()
      : null;

    const secondaryValue = secondaryCol?.render
      ? secondaryCol.render(item)
      : secondaryCol
      ? (item as any)[secondaryCol.key]?.toString()
      : null;

    return (
      <Card
        key={getRowKey(item)}
        className={cn(
          "mb-3",
          onRowClick && "cursor-pointer hover:bg-muted/50 transition-colors"
        )}
        onClick={() => onRowClick?.(item)}
      >
        <CardContent className="p-4">
          {/* Primary & Secondary row */}
          <div className="flex justify-between items-start mb-3">
            <div className="font-medium text-sm flex-1 pr-2">
              {primaryValue || "—"}
            </div>
            {secondaryValue && (
              <div className="font-semibold text-right">{secondaryValue}</div>
            )}
          </div>

          {/* Other fields */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {mobileColumns.slice(0, 4).map((col) => (
              <div key={col.key}>
                <span className="text-muted-foreground text-xs">
                  {col.mobileLabel || col.header}
                </span>
                <div className="truncate">
                  {col.render
                    ? col.render(item)
                    : (item as any)[col.key]?.toString() ?? "—"}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile actions */}
          {mobileCardActions && (
            <div className="mt-3 pt-3 border-t flex justify-end gap-2">
              {mobileCardActions(item)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.sortable && onSort ? (
                    <Button
                      variant="ghost"
                      onClick={() => onSort(col.key)}
                      className="h-auto p-0 font-semibold"
                    >
                      {col.header}
                      {getSortIcon(col.key)}
                    </Button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={getRowKey(item)}
                className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render
                      ? col.render(item)
                      : (item as any)[col.key]?.toString() ?? ""}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {data.map((item) => renderMobileCard(item))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center gap-2 pt-4 text-xs text-muted-foreground">
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for managing sort state
export function useTableSort(
  defaultColumn: string,
  defaultDirection: "asc" | "desc" = "desc"
) {
  const [sortColumn, setSortColumn] = React.useState(defaultColumn);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    defaultDirection
  );

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

  return {
    sortColumn,
    sortDirection,
    handleSort,
    setSortColumn,
    setSortDirection,
  };
}

// Hook for managing pagination state
export function useTablePagination(initialPage: number = 1) {
  const [page, setPage] = React.useState(initialPage);

  const handlePageChange = React.useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return {
    page,
    setPage,
    handlePageChange,
  };
}
