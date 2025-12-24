"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CrudPage,
  useCrudPageState,
  CrudColumn,
} from "@/components/crud/crud-page";
import { StatItem } from "@/components/ui/stats-grid";
import {
  Eye,
  Package,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { Order, EnumOrderStatus } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { getEntityMessages } from "@/config/messages";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<{
    page: number;
    totalPages: number;
  } | null>(null);

  // Use the CRUD page state hook
  const {
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
  } = useCrudPageState("createdAt", "desc");

  const PAGE_SIZE = 50;

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.orders.getAll({
        page,
        limit: PAGE_SIZE,
        search: searchTerm,
      });

      if (response.success) {
        setOrders(response.data?.data || []);
        setPagination(response.data?.pagination || null);
      } else {
        toast.error(getEntityMessages("orders").loadError);
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error(error.message || getEntityMessages("orders").loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [debouncedSearch, page]);

  // Filter and sort data
  const filteredAndSortedOrders = useMemo(() => {
    let result = orders;

    // Status filter
    const statusFilter = filterValues.status || "all";
    if (statusFilter !== "all") {
      result = result.filter((o) => o.orderStatus === statusFilter);
    }

    // Date filter
    result = filterByDate(result, dateFilter);

    // Sort
    result = sortData(result, sortColumn, sortDirection);

    return result;
  }, [
    orders,
    filterValues.status,
    dateFilter,
    sortColumn,
    sortDirection,
    sortData,
    filterByDate,
  ]);

  // Status badge helper
  const getStatusBadge = (status: EnumOrderStatus) => {
    const variants: Record<
      EnumOrderStatus,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      RECEIVED: { variant: "default", label: "Received" },
      PARTIALLY_FULFILLED: {
        variant: "secondary",
        label: "Partially Fulfilled",
      },
      FULFILLED: { variant: "default", label: "Fulfilled" },
      CANCELLED: { variant: "destructive", label: "Cancelled" },
      FULLY_REFUNDED: { variant: "outline", label: "Refunded" },
    };
    return (
      <Badge variant={variants[status].variant}>{variants[status].label}</Badge>
    );
  };

  // Stats
  const stats: StatItem[] = useMemo(
    () => [
      {
        label: "Total Orders",
        value: orders.length,
        subLabel: "All time",
        icon: Package,
        borderColor: "border-l-gray-300",
      },
      {
        label: "Received",
        value: orders.filter((o) => o.orderStatus === EnumOrderStatus.RECEIVED)
          .length,
        subLabel: "Pending fulfillment",
        icon: Clock,
        iconColor: "text-blue-400",
        borderColor: "border-l-blue-400",
      },
      {
        label: "Fulfilled",
        value: orders.filter((o) => o.orderStatus === EnumOrderStatus.FULFILLED)
          .length,
        subLabel: "Completed",
        icon: CheckCircle,
        iconColor: "text-green-400",
        borderColor: "border-l-green-400",
      },
      {
        label: "Cancelled",
        value: orders.filter((o) => o.orderStatus === EnumOrderStatus.CANCELLED)
          .length,
        subLabel: "Cancelled orders",
        icon: AlertCircle,
        iconColor: "text-red-400",
        borderColor: "border-l-red-400",
      },
      {
        label: "Revenue",
        value: `€${orders
          .reduce((sum, o) => sum + o.payableAmount, 0)
          .toFixed(2)}`,
        subLabel: "Total earnings",
        icon: DollarSign,
        iconColor: "text-yellow-400",
        borderColor: "border-l-yellow-400",
      },
    ],
    [orders]
  );

  // Columns
  const columns: CrudColumn<Order>[] = [
    {
      key: "orderID",
      header: "Order ID",
      sortable: true,
      isPrimary: true,
      render: (order) => <span className="font-medium">{order.orderID}</span>,
    },
    {
      key: "shippingName",
      header: "Customer",
      sortable: true,
      mobileLabel: "Customer",
    },
    {
      key: "payableAmount",
      header: "Amount",
      sortable: true,
      isSecondary: true,
      render: (order) => {
        const symbol =
          order.currencyPayment === "EUR"
            ? "€"
            : order.currencyPayment === "GBP"
            ? "£"
            : order.currencyPayment === "USD"
            ? "$"
            : order.currencyPayment === "INR"
            ? "₹"
            : `${order.currencyPayment} `;
        return `${symbol}${order.payableAmount.toFixed(2)}`;
      },
    },
    {
      key: "orderStatus",
      header: "Status",
      sortable: true,
      mobileLabel: "Status",
      render: (order) => getStatusBadge(order.orderStatus),
    },
    {
      key: "createdAt",
      header: "Date & Time",
      sortable: true,
      minWidth: "md",
      render: (order) => {
        const date = new Date(order.createdAt);
        if (isNaN(date.getTime()))
          return <span className="text-muted-foreground">Invalid date</span>;
        return (
          <div className="text-sm">
            <div>{format(date, "MMM dd, yyyy")}</div>
            <div className="text-muted-foreground">
              {format(date, "h:mm a")}
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      hideOnMobile: true,
      render: (order) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/orders/${order.id}`);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Filters
  const filters = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      defaultValue: "all",
      options: [
        { value: "all", label: "All Status" },
        { value: "RECEIVED", label: "Received" },
        { value: "FULFILLED", label: "Fulfilled" },
        { value: "CANCELLED", label: "Cancelled" },
        { value: "FULLY_REFUNDED", label: "Refunded" },
      ],
    },
  ];

  // Date filter options
  const dateFilterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "last30days", label: "Last 30 Days" },
  ];

  // Export config
  const exportConfig = {
    filename: "orders",
    headers: ["Order ID", "Customer", "Amount", "Status", "Date"],
    rowMapper: (order: Order) => [
      order.orderID,
      order.shippingName,
      `€${order.payableAmount.toFixed(2)}`,
      order.orderStatus,
      format(new Date(order.createdAt), "MMM dd, yyyy"),
    ],
  };

  return (
    <CrudPage<Order>
      title="Orders"
      description="Manage and track customer orders"
      data={filteredAndSortedOrders}
      loading={loading}
      getRowKey={(order) => order.id}
      columns={columns}
      stats={stats}
      statsColumns={5}
      searchPlaceholder="Search orders..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={filters}
      filterValues={filterValues}
      onFilterChange={handleFilterChange}
      dateFilterOptions={dateFilterOptions}
      dateFilterValue={dateFilter}
      onDateFilterChange={setDateFilter}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={handleSort}
      pagination={
        pagination && pagination.totalPages > 1
          ? {
              page: pagination.page,
              totalPages: pagination.totalPages,
              onPageChange: setPage,
            }
          : undefined
      }
      actions={{
        onRowClick: (order) => router.push(`/dashboard/orders/${order.id}`),
        customActions: (order) => (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/orders/${order.id}`);
            }}
          >
            <Eye className="h-4 w-4 mr-1" /> View
          </Button>
        ),
      }}
      exportConfig={exportConfig}
      emptyIcon={<Package className="h-12 w-12 text-muted-foreground" />}
      emptyMessage="No orders found"
    />
  );
}
