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
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
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

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
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
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                {emptyIcon && <div className="mx-auto mb-2">{emptyIcon}</div>}
                <p className="text-muted-foreground">{emptyMessage}</p>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={getRowKey(item)}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render
                      ? col.render(item)
                      : (item as any)[col.key]?.toString() ?? ""}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 pt-4 text-xs text-muted-foreground">
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
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
