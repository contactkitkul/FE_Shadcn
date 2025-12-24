"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CrudDataTable } from "@/components/ui/crud-data-table";
import { StatsGrid } from "@/components/ui/stats-grid";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Activity,
  User,
  Package,
  CreditCard,
  Truck,
  XCircle,
  CheckCircle,
  Edit,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

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
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [actorFilter, setActorFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");

  // Fetch order logs from API
  const fetchLogs = async () => {
    try {
      setLoading(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, actorFilter, eventFilter]);

  // Filtering is now done server-side, but keep local filter for instant feedback
  const filteredLogs = logs;

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

  const handleExport = () => {
    toast.success("Exporting activity logs to CSV...");
    // Implement CSV export
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Order Activity</h2>
          <p className="text-muted-foreground">
            Audit trail and activity monitoring
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsGrid
        loading={loading}
        columns={4}
        stats={[
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
        ]}
      />

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Logs</CardTitle>
              {/* <CardDescription>
                Complete audit trail of all order activities
              </CardDescription> */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={actorFilter} onValueChange={setActorFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Actor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actors</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="ORDER_CREATED">Order Created</SelectItem>
                <SelectItem value="PAYMENT_PROCESSED">
                  Payment Processed
                </SelectItem>
                <SelectItem value="STATUS_CHANGED">Status Changed</SelectItem>
                <SelectItem value="SHIPMENT_CREATED">
                  Shipment Created
                </SelectItem>
                <SelectItem value="ITEM_CANCELLED">Item Cancelled</SelectItem>
                <SelectItem value="REFUND_ISSUED">Refund Issued</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CrudDataTable<OrderLog>
            data={filteredLogs}
            loading={loading}
            getRowKey={(log) => log.id}
            emptyIcon={<Activity className="h-12 w-12 text-muted-foreground" />}
            emptyMessage="No activity logs found"
            columns={[
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
                    <Badge className={actorBadge.className}>
                      {actorBadge.label}
                    </Badge>
                  );
                },
              },
              {
                key: "details",
                header: "Details",
                hideOnMobile: true,
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
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
