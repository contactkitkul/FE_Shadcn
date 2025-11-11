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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";

interface OrderLog {
  id: string;
  orderId: string;
  orderID: string;
  actorId: string;
  actorType: "customer" | "admin" | "system";
  event: string;
  details: any;
  createdAt: Date;
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<OrderLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actorFilter, setActorFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      const mockLogs: OrderLog[] = [
        {
          id: "1",
          orderId: "ord1",
          orderID: "FUTGY@44613",
          actorId: "admin1",
          actorType: "admin",
          event: "ORDER_CREATED",
          details: { amount: 104.99, items: 2 },
          createdAt: new Date("2024-11-11T10:30:00"),
        },
        {
          id: "2",
          orderId: "ord1",
          orderID: "FUTGY@44613",
          actorId: "system",
          actorType: "system",
          event: "PAYMENT_PROCESSED",
          details: { transactionId: "TXN_123456", amount: 104.99 },
          createdAt: new Date("2024-11-11T10:31:00"),
        },
        {
          id: "3",
          orderId: "ord1",
          orderID: "FUTGY@44613",
          actorId: "admin2",
          actorType: "admin",
          event: "STATUS_CHANGED",
          details: { from: "RECEIVED", to: "FULFILLED" },
          createdAt: new Date("2024-11-11T11:00:00"),
        },
        {
          id: "4",
          orderId: "ord2",
          orderID: "FUTGY@44612",
          actorId: "customer1",
          actorType: "customer",
          event: "ORDER_CREATED",
          details: { amount: 89.99, items: 1 },
          createdAt: new Date("2024-11-10T15:45:00"),
        },
        {
          id: "5",
          orderId: "ord2",
          orderID: "FUTGY@44612",
          actorId: "admin1",
          actorType: "admin",
          event: "SHIPMENT_CREATED",
          details: { trackingNumber: "DHL123456", provider: "DHL" },
          createdAt: new Date("2024-11-10T16:00:00"),
        },
        {
          id: "6",
          orderId: "ord3",
          orderID: "FUTGY@44611",
          actorId: "customer2",
          actorType: "customer",
          event: "ITEM_CANCELLED",
          details: { itemId: "item1", reason: "Changed mind" },
          createdAt: new Date("2024-11-09T14:20:00"),
        },
        {
          id: "7",
          orderId: "ord3",
          orderID: "FUTGY@44611",
          actorId: "admin2",
          actorType: "admin",
          event: "REFUND_ISSUED",
          details: { amount: 45.0, reason: "Item cancelled" },
          createdAt: new Date("2024-11-09T14:30:00"),
        },
        {
          id: "8",
          orderId: "ord4",
          orderID: "FUTGY@44610",
          actorId: "system",
          actorType: "system",
          event: "PAYMENT_FAILED",
          details: { reason: "Insufficient funds" },
          createdAt: new Date("2024-11-08T09:15:00"),
        },
      ];
      setLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActor = actorFilter === "all" || log.actorType === actorFilter;
    const matchesEvent = eventFilter === "all" || log.event === eventFilter;
    return matchesSearch && matchesActor && matchesEvent;
  });

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                logs.filter(
                  (log) =>
                    format(log.createdAt, "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd")
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Events today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter((log) => log.actorType === "admin").length}
            </div>
            <p className="text-xs text-muted-foreground">Manual actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter((log) => log.actorType === "system").length}
            </div>
            <p className="text-xs text-muted-foreground">Automated</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                Complete audit trail of all order activities
              </CardDescription>
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
                <SelectItem value="PAYMENT_PROCESSED">Payment Processed</SelectItem>
                <SelectItem value="STATUS_CHANGED">Status Changed</SelectItem>
                <SelectItem value="SHIPMENT_CREATED">Shipment Created</SelectItem>
                <SelectItem value="ITEM_CANCELLED">Item Cancelled</SelectItem>
                <SelectItem value="REFUND_ISSUED">Refund Issued</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No activity logs found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => {
                    const EventIcon = getEventIcon(log.event);
                    const eventBadge = getEventBadge(log.event);
                    const actorBadge = getActorBadge(log.actorType);

                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.orderID}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <EventIcon className="h-4 w-4 text-muted-foreground" />
                            <Badge className={eventBadge.className}>
                              {log.event.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={actorBadge.className}>
                            {actorBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {JSON.stringify(log.details)}
                          </code>
                        </TableCell>
                        <TableCell>
                          {format(log.createdAt, "MMM dd, yyyy")}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {format(log.createdAt, "h:mm:ss a")}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
