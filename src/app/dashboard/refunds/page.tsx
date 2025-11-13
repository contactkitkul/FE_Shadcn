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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  DollarSign,
  TrendingDown,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Refund {
  id: string;
  orderId: string;
  orderID: string;
  customerName: string;
  transactionId: string;
  amountPaid: number;
  currency: string;
  reason: string;
  status: "PENDING" | "REFUNDED" | "PARTIALLY_REFUNDED" | "FAILED";
  createdAt: Date;
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  // Fetch refunds from API
  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await api.refunds.getAll({
        page: 1,
        limit: 100,
        search: searchTerm,
      });

      if (response.success) {
        setRefunds(response.data);
      } else {
        toast.error("Failed to load refunds");
      }
    } catch (error: any) {
      console.error("Error fetching refunds:", error);
      toast.error(error.message || "Failed to load refunds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== "") {
        fetchRefunds();
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Old mock data
  const oldMockEffect = () => {
    setTimeout(() => {
      const mockRefunds: Refund[] = [
        {
          id: "1",
          orderId: "ord1",
          orderID: "FUTGY@44613",
          customerName: "John Doe",
          transactionId: "TXN_123456",
          amountPaid: 104.99,
          currency: "EUR",
          reason: "Product defect",
          status: "PENDING",
          createdAt: new Date("2024-11-11T10:30:00"),
        },
        {
          id: "2",
          orderId: "ord2",
          orderID: "FUTGY@44612",
          customerName: "Jane Smith",
          transactionId: "TXN_123457",
          amountPaid: 89.99,
          currency: "EUR",
          reason: "Wrong size",
          status: "REFUNDED",
          createdAt: new Date("2024-11-10T14:20:00"),
        },
        {
          id: "3",
          orderId: "ord3",
          orderID: "FUTGY@44611",
          customerName: "Mike Johnson",
          transactionId: "TXN_123458",
          amountPaid: 169.98,
          currency: "EUR",
          reason: "Customer changed mind",
          status: "PARTIALLY_REFUNDED",
          createdAt: new Date("2024-11-09T09:15:00"),
        },
        {
          id: "4",
          orderId: "ord4",
          orderID: "FUTGY@44610",
          customerName: "Sarah Williams",
          transactionId: "TXN_123459",
          amountPaid: 54.99,
          currency: "EUR",
          reason: "Item not as described",
          status: "FAILED",
          createdAt: new Date("2024-11-08T16:45:00"),
        },
      ];
      setRefunds(mockRefunds);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRefunds = refunds.filter((refund) => {
    const matchesSearch =
      refund.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { variant: any; label: string; className: string }
    > = {
      PENDING: {
        variant: "secondary",
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800",
      },
      REFUNDED: {
        variant: "default",
        label: "Refunded",
        className: "bg-green-100 text-green-800",
      },
      PARTIALLY_REFUNDED: {
        variant: "outline",
        label: "Partial",
        className: "bg-blue-100 text-blue-800",
      },
      FAILED: {
        variant: "destructive",
        label: "Failed",
        className: "bg-red-100 text-red-800",
      },
    };
    return config[status] || config.PENDING;
  };

  const handleProcessRefund = () => {
    if (!selectedRefund || !refundAmount) {
      toast.error("Please enter refund amount");
      return;
    }

    setRefunds(
      refunds.map((refund) =>
        refund.id === selectedRefund.id
          ? { ...refund, status: "REFUNDED" as const }
          : refund
      )
    );
    toast.success(`Refund of €${refundAmount} processed successfully`);
    setIsProcessOpen(false);
    setSelectedRefund(null);
    setRefundAmount("");
    setRefundReason("");
  };

  const totalRefunded = refunds
    .filter((r) => r.status === "REFUNDED")
    .reduce((sum, r) => sum + r.amountPaid, 0);
  const pendingCount = refunds.filter((r) => r.status === "PENDING").length;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Refunds</h2>
          <p className="text-muted-foreground">
            Manage refund requests and processing
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{refunds.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Refunded
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRefunded.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Processed amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingCount}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {refunds.length > 0
                ? (
                    (refunds.filter((r) => r.status === "REFUNDED").length /
                      refunds.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Successful refunds</p>
          </CardContent>
        </Card>
      </div>

      {/* Refunds Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Refund Requests</CardTitle>
              <CardDescription>
                View and process customer refund requests
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, customer, or transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
                <SelectItem value="PARTIALLY_REFUNDED">Partial</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefunds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No refunds found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRefunds.map((refund) => {
                    const statusConfig = getStatusBadge(refund.status);
                    return (
                      <TableRow key={refund.id}>
                        <TableCell className="font-medium">
                          {refund.orderID}
                        </TableCell>
                        <TableCell>{refund.customerName}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {refund.transactionId}
                        </TableCell>
                        <TableCell className="font-semibold">
                          €{refund.amountPaid.toFixed(2)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {refund.reason}
                        </TableCell>
                        <TableCell>
                          {format(refund.createdAt, "MMM dd, yyyy")}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {format(refund.createdAt, "h:mm a")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.className}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {refund.status === "PENDING" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRefund(refund);
                                setRefundAmount(refund.amountPaid.toString());
                                setIsProcessOpen(true);
                              }}
                            >
                              Process
                            </Button>
                          )}
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

      {/* Process Refund Dialog */}
      <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              {selectedRefund?.orderID} - {selectedRefund?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Original Amount</Label>
              <div className="text-2xl font-bold">
                €{selectedRefund?.amountPaid.toFixed(2)}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Enter refund amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refundReason">Reason (Optional)</Label>
              <Textarea
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Original reason: {selectedRefund?.reason}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessRefund}>Process Refund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
