"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  CrudPage,
  useCrudPageState,
  CrudColumn,
} from "@/components/crud/crud-page";
import { StatItem } from "@/components/ui/stats-grid";
import {
  Activity,
  User,
  Package,
  CreditCard,
  Truck,
  XCircle,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface OrderLog {
  id: string;
  orderId: string;
  actorId?: string;
  actorType: string;
  event: string;
  details?: any;
  createdAt: string;
  eventDisplay?: string;
  actorDisplay?: string;
  order?: {
    orderID: string;
    orderStatus: string;
    shippingName: string;
    shippingEmail: string;
    totalAmount: number;
    currencyPayment: string;
  };
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<OrderLog[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    filterValues,
    handleFilterChange,
  } = useCrudPageState();

  // Fetch order logs from API
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const actorFilter = filterValues.actor || "all";
      const eventFilter = filterValues.event || "all";

      const response = await api.orderLogs.getAll({
        page: 1,
        limit: 100,
        search: debouncedSearch || undefined,
        actorType:
          actorFilter !== "all" ? actorFilter.toUpperCase() : undefined,
        event: eventFilter !== "all" ? eventFilter : undefined,
      });

      if (response.success && response.data?.data) {
        setLogs(response.data.data);
      } else {
        toast.error("Failed to load activity logs");
      }
    } catch (error: any) {
      console.error("Error fetching logs:", error);
      toast.error(error.message || "Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [debouncedSearch, filterValues.actor, filterValues.event]);

  // Helper functions
  const getEventIcon = (event: string) => {
    const icons: Record<string, any> = {
      ORDER_CREATED: Package,
      PAYMENT_PROCESSED: CreditCard,
      PAYMENT_FAILED: XCircle,
      STATUS_CHANGED: Edit,
      SHIPMENT_CREATED: Truck,
      ITEM_CANCELLED: XCircle,
      REFUND_ISSUED: CreditCard,
    };
    return icons[event] || Activity;
  };

  const getEventBadge = (event: string) => {
    const config: Record<string, { className: string }> = {
      ORDER_CREATED: { className: "bg-blue-100 text-blue-800" },
      PAYMENT_PROCESSED: { className: "bg-green-100 text-green-800" },
      PAYMENT_FAILED: { className: "bg-red-100 text-red-800" },
      STATUS_CHANGED: { className: "bg-purple-100 text-purple-800" },
      SHIPMENT_CREATED: { className: "bg-orange-100 text-orange-800" },
      ITEM_CANCELLED: { className: "bg-yellow-100 text-yellow-800" },
      REFUND_ISSUED: { className: "bg-pink-100 text-pink-800" },
    };
    return config[event] || { className: "bg-gray-100 text-gray-800" };
  };

  const getActorBadge = (actorType: string) => {
    const config: Record<string, { className: string; label: string }> = {
      admin: { className: "bg-purple-100 text-purple-800", label: "Admin" },
      customer: { className: "bg-blue-100 text-blue-800", label: "Customer" },
      system: { className: "bg-gray-100 text-gray-800", label: "System" },
    };
    return config[actorType] || config.system;
  };

  // Stats
  const stats: StatItem[] = useMemo(
    () => [
      {
        label: "Total Events",
        value: logs.length,
        subLabel: "All time",
        icon: Activity,
        borderColor: "border-l-blue-400",
      },
      {
        label: "Today",
        value: logs.filter(
          (log) =>
            format(new Date(log.createdAt), "yyyy-MM-dd") ===
            format(new Date(), "yyyy-MM-dd")
        ).length,
        subLabel: "Events today",
        icon: Activity,
        iconColor: "text-green-500",
        borderColor: "border-l-green-400",
      },
      {
        label: "Admin Actions",
        value: logs.filter((log) => log.actorType === "admin").length,
        subLabel: "Manual actions",
        icon: User,
        iconColor: "text-purple-500",
        borderColor: "border-l-purple-400",
      },
      {
        label: "System Events",
        value: logs.filter((log) => log.actorType === "system").length,
        subLabel: "Automated",
        icon: Activity,
        iconColor: "text-orange-500",
        borderColor: "border-l-orange-400",
      },
    ],
    [logs]
  );

  // Columns
  const columns: CrudColumn<OrderLog>[] = [
    {
      key: "orderID",
      header: "Order ID",
      isPrimary: true,
      render: (log) => log.order?.orderID || "N/A",
    },
    {
      key: "event",
      header: "Event",
      isSecondary: true,
      render: (log) => {
        const EventIcon = getEventIcon(log.event);
        const eventBadge = getEventBadge(log.event);
        return (
          <div className="flex items-center gap-2">
            <EventIcon className="h-4 w-4 text-muted-foreground" />
            <Badge className={eventBadge.className}>
              {log.event.replace(/_/g, " ")}
            </Badge>
          </div>
        );
      },
    },
    {
      key: "actor",
      header: "Actor",
      mobileLabel: "Actor",
      render: (log) => {
        const actorBadge = getActorBadge(log.actorType);
        return (
          <Badge className={actorBadge.className}>{actorBadge.label}</Badge>
        );
      },
    },
    {
      key: "details",
      header: "Details",
      minWidth: "lg",
      className: "max-w-[300px]",
      render: (log) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {JSON.stringify(log.details)}
        </code>
      ),
    },
    {
      key: "timestamp",
      header: "Timestamp",
      mobileLabel: "Time",
      render: (log) => (
        <div>
          {format(new Date(log.createdAt), "MMM dd, yyyy")}
          <br />
          <span className="text-xs text-muted-foreground">
            {format(new Date(log.createdAt), "h:mm:ss a")}
          </span>
        </div>
      ),
    },
  ];

  // Filters
  const filters = [
    {
      key: "actor",
      label: "Actor",
      type: "select" as const,
      defaultValue: "all",
      options: [
        { value: "all", label: "All Actors" },
        { value: "admin", label: "Admin" },
        { value: "customer", label: "Customer" },
        { value: "system", label: "System" },
      ],
    },
    {
      key: "event",
      label: "Event Type",
      type: "select" as const,
      defaultValue: "all",
      options: [
        { value: "all", label: "All Events" },
        { value: "ORDER_CREATED", label: "Order Created" },
        { value: "PAYMENT_PROCESSED", label: "Payment Processed" },
        { value: "STATUS_CHANGED", label: "Status Changed" },
        { value: "SHIPMENT_CREATED", label: "Shipment Created" },
        { value: "ITEM_CANCELLED", label: "Item Cancelled" },
        { value: "REFUND_ISSUED", label: "Refund Issued" },
      ],
    },
  ];

  // Export config
  const exportConfig = {
    filename: "activity-logs",
    headers: ["Order ID", "Event", "Actor", "Details", "Timestamp"],
    rowMapper: (log: OrderLog) => [
      log.order?.orderID || "N/A",
      log.event.replace(/_/g, " "),
      getActorBadge(log.actorType).label,
      JSON.stringify(log.details),
      format(new Date(log.createdAt), "MMM dd, yyyy h:mm:ss a"),
    ],
  };

  return (
    <CrudPage<OrderLog>
      title="Order Activity"
      description="Audit trail and activity monitoring"
      data={logs}
      loading={loading}
      getRowKey={(log) => log.id}
      columns={columns}
      // stats={stats}
      // statsColumns={4}
      searchPlaceholder="Search by order ID or event..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={filters}
      filterValues={filterValues}
      onFilterChange={handleFilterChange}
      exportConfig={exportConfig}
      emptyIcon={<Activity className="h-12 w-12 text-muted-foreground" />}
      emptyMessage="No activity logs found"
    />
  );
}
