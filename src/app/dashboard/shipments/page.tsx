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
  Truck,
  Package,
  MapPin,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/api";

interface Shipment {
  id: string;
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
  emailSentAt?: string;
  orderId: string;
  orderID: string;
  orderStatus: string;
  orderCreatedAt: string;
  customerName: string;
  customerEmail: string;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch shipments from API
  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await api.shipments.getAll({
        page: 1,
        limit: 100,
        sortBy: sortColumn,
        sortOrder: sortDirection,
        search: debouncedSearch || undefined,
      });

      if (response.success && response.data?.data) {
        setShipments(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching shipments:", error);
      toast.error(error.message || "Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortColumn, sortDirection, debouncedSearch]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // Filter shipments - search is done server-side, but we can filter by status client-side
  const filteredAndSortedShipments = shipments.filter((shipment) => {
    const matchesStatus =
      statusFilter === "all" || shipment.orderStatus === statusFilter;
    return matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      RECEIVED: { variant: "secondary", label: "Received" },
      PROCESSING: { variant: "default", label: "Processing" },
      SHIPPED: { variant: "default", label: "Shipped" },
      FULFILLED: { variant: "outline", label: "Fulfilled" },
      CANCELLED: { variant: "destructive", label: "Cancelled" },
      FULLY_REFUNDED: { variant: "destructive", label: "Refunded" },
    };
    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shipments</h2>
          <p className="text-muted-foreground">
            Track and manage order shipments
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Shipments
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shipments.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shipments.filter((s) => s.orderStatus === "SHIPPED").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently shipping</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fulfilled</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shipments.filter((s) => s.orderStatus === "FULFILLED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Sent</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shipments.filter((s) => !!s.emailSentAt).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tracking emails sent
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shipment Tracking</CardTitle>
              <CardDescription>
                Monitor all shipments and their status
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shipments</SelectItem>
                  <SelectItem value="LABEL_CREATED">Label Created</SelectItem>
                  <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tracking..."
                  className="pl-8 w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("trackingNumber")}
                      className="h-auto p-0 font-semibold"
                    >
                      Tracking Number
                      {getSortIcon("trackingNumber")}
                    </Button>
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("createdAt")}
                      className="h-auto p-0 font-semibold"
                    >
                      Created
                      {getSortIcon("createdAt")}
                    </Button>
                  </TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Email Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedShipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        No shipments found
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedShipments.map((shipment: Shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium font-mono">
                        {shipment.trackingNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {shipment.customerName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {shipment.customerEmail}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {shipment.orderID}
                      </TableCell>
                      <TableCell>
                        {format(new Date(shipment.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(shipment.orderStatus)}
                      </TableCell>
                      <TableCell>
                        {shipment.emailSentAt ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700"
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Email Sent
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
