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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { getEntityMessages } from "@/config/messages";

interface Payment {
  id: string;
  createdAt: Date;
  orderId: string;
  orderID: string;
  customerName: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  paymentGateway: string;
  amountPaid: number;
  currency: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch payments from API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.payments.getAll({
        page: 1,
        limit: 100,
        search: searchTerm,
      });

      if (response.success) {
        setPayments(response.data.data || []);
      } else {
        toast.error(getEntityMessages("payments").loadError);
      }
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      toast.error(error.message || getEntityMessages("payments").loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { variant: any; label: string; className: string }
    > = {
      SUCCESS: {
        variant: "default",
        label: "Success",
        className: "bg-green-100 text-green-800",
      },
      PENDING: {
        variant: "secondary",
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800",
      },
      FAILED: {
        variant: "destructive",
        label: "Failed",
        className: "bg-red-100 text-red-800",
      },
      REFUNDED: {
        variant: "outline",
        label: "Refunded",
        className: "bg-gray-100 text-gray-800",
      },
      PARTIALLY_REFUNDED: {
        variant: "outline",
        label: "Partially Refunded",
        className: "bg-blue-100 text-blue-800",
      },
    };
    return config[status] || config.PENDING;
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      EUR: "€",
      GBP: "£",
      USD: "$",
      INR: "₹",
    };
    return symbols[currency] || currency;
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = payments
    .filter((p) => p.paymentStatus === "SUCCESS")
    .reduce((sum, p) => sum + p.amountPaid, 0);
  const pendingAmount = payments
    .filter((p) => p.paymentStatus === "PENDING")
    .reduce((sum, p) => sum + p.amountPaid, 0);
  const refundedAmount = payments
    .filter(
      (p) =>
        p.paymentStatus === "REFUNDED" ||
        p.paymentStatus === "PARTIALLY_REFUNDED"
    )
    .reduce((sum, p) => sum + p.amountPaid, 0);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          {/* <p className="text-muted-foreground">
            Track and manage all payment transactions
          </p> */}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Received
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.paymentStatus === "SUCCESS").length}{" "}
              successful payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{pendingAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.paymentStatus === "PENDING").length}{" "}
              pending payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunded</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{refundedAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {
                payments.filter(
                  (p) =>
                    p.paymentStatus === "REFUNDED" ||
                    p.paymentStatus === "PARTIALLY_REFUNDED"
                ).length
              }{" "}
              refunds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter((p) => p.paymentStatus === "FAILED").length}
            </div>
            <p className="text-xs text-muted-foreground">Failed transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Transactions</CardTitle>
              {/* <CardDescription>
                View and manage all payment transactions
              </CardDescription> */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, customer, or transaction ID..."
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
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
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
                  <TableHead>Gateway</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No payments found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => {
                    const statusConfig = getStatusBadge(payment.paymentStatus);
                    return (
                      <TableRow
                        key={payment.id}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          {payment.orderID}
                        </TableCell>
                        <TableCell>{payment.customerName}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.transactionId}
                        </TableCell>
                        <TableCell>{payment.paymentGateway}</TableCell>
                        <TableCell>
                          {format(new Date(payment.createdAt), "MMM dd, yyyy")}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(payment.createdAt), "h:mm a")}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {getCurrencySymbol(payment.currency)}
                          {payment.amountPaid.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.className}>
                            {statusConfig.label}
                          </Badge>
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
