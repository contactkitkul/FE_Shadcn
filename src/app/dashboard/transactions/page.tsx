"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { getCurrencySymbol } from "@/lib/currency";

interface Payment {
  id: string;
  createdAt: string;
  orderId: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  paymentGateway: string;
  amountPaid: number;
  currencyPaid: string;
  order?: {
    orderID: string;
    shippingName: string;
    shippingEmail: string;
    totalAmount: number;
  };
}

interface Refund {
  id: string;
  createdAt: string;
  paymentId: string;
  amountPaid: number;
  currencyPaid: string;
  reason?: string;
  status: "PENDING" | "REFUNDED" | "PARTIALLY_REFUNDED" | "FAILED";
  payment?: {
    transactionId: string;
    order?: {
      orderID: string;
      shippingName: string;
      shippingEmail: string;
    };
  };
}

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<"payments" | "refunds">(
    "payments"
  );
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [refundStatusFilter, setRefundStatusFilter] = useState<string>("all");

  const fetchPayments = async () => {
    try {
      const response = await api.payments.getAll({
        page: 1,
        limit: 100,
        search: debouncedSearch || undefined,
      });

      if (response.success && response.data?.data) {
        setPayments(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      toast.error(error.message || "Failed to load payments");
    }
  };

  const fetchRefunds = async () => {
    try {
      const response = await api.refunds.getAll({
        page: 1,
        limit: 100,
        search: debouncedSearch || undefined,
      });

      if (response.success && response.data?.data) {
        setRefunds(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching refunds:", error);
      toast.error(error.message || "Failed to load refunds");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchPayments(), fetchRefunds()]);
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Memoized stats - use order.totalAmount (EUR) for accurate totals
  const stats = useMemo(() => {
    const totalReceived = payments
      .filter((p) => p.paymentStatus === "SUCCESS")
      .reduce((sum, p) => sum + (p.order?.totalAmount || 0), 0);
    const pendingPayments = payments
      .filter((p) => p.paymentStatus === "PENDING")
      .reduce((sum, p) => sum + (p.order?.totalAmount || 0), 0);
    const totalRefunded = refunds
      .filter((r) => r.status === "REFUNDED")
      .reduce((sum, r) => sum + r.amountPaid, 0);
    const pendingRefunds = refunds.filter((r) => r.status === "PENDING").length;

    return { totalReceived, pendingPayments, totalRefunded, pendingRefunds };
  }, [payments, refunds]);

  // Filtered data
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesStatus =
        paymentStatusFilter === "all" ||
        payment.paymentStatus === paymentStatusFilter;
      return matchesStatus;
    });
  }, [payments, paymentStatusFilter]);

  const filteredRefunds = useMemo(() => {
    return refunds.filter((refund) => {
      const matchesStatus =
        refundStatusFilter === "all" || refund.status === refundStatusFilter;
      return matchesStatus;
    });
  }, [refunds, refundStatusFilter]);

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string }> = {
      SUCCESS: { className: "bg-green-100 text-green-800", label: "Success" },
      PENDING: { className: "bg-yellow-100 text-yellow-800", label: "Pending" },
      FAILED: { className: "bg-red-100 text-red-800", label: "Failed" },
      REFUNDED: {
        className: "bg-purple-100 text-purple-800",
        label: "Refunded",
      },
      PARTIALLY_REFUNDED: {
        className: "bg-blue-100 text-blue-800",
        label: "Partial Refund",
      },
    };
    const c = config[status] || config.PENDING;
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getRefundStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string }> = {
      PENDING: { className: "bg-yellow-100 text-yellow-800", label: "Pending" },
      REFUNDED: { className: "bg-green-100 text-green-800", label: "Refunded" },
      PARTIALLY_REFUNDED: {
        className: "bg-blue-100 text-blue-800",
        label: "Partial",
      },
      FAILED: { className: "bg-red-100 text-red-800", label: "Failed" },
    };
    const c = config[status] || config.PENDING;
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">Manage payments and refunds</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Received
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              €{stats.totalReceived.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.paymentStatus === "SUCCESS").length}{" "}
              successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              €{stats.pendingPayments.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.paymentStatus === "PENDING").length}{" "}
              pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Refunded
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              €{stats.totalRefunded.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {refunds.filter((r) => r.status === "REFUNDED").length} processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Refunds
            </CardTitle>
            <RefreshCcw className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingRefunds}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Payments and Refunds */}
      <Card>
        <CardContent className="pt-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "payments" | "refunds")}
          >
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger
                  value="payments"
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Payments ({payments.length})
                </TabsTrigger>
                <TabsTrigger
                  value="refunds"
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refunds ({refunds.length})
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {activeTab === "payments" ? (
                  <Select
                    value={paymentStatusFilter}
                    onValueChange={setPaymentStatusFilter}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="SUCCESS">Success</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={refundStatusFilter}
                    onValueChange={setRefundStatusFilter}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <TabsContent value="payments">
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
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">
                            No payments found
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.order?.orderID || "N/A"}
                          </TableCell>
                          <TableCell>
                            {payment.order?.shippingName || "N/A"}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment.transactionId}
                          </TableCell>
                          <TableCell>{payment.paymentGateway}</TableCell>
                          <TableCell>
                            {format(
                              new Date(payment.createdAt),
                              "MMM dd, yyyy"
                            )}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(payment.createdAt), "h:mm a")}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {getCurrencySymbol(payment.currencyPaid)}
                            {payment.amountPaid.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {getPaymentStatusBadge(payment.paymentStatus)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="refunds">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRefunds.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <RefreshCcw className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">
                            No refunds found
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRefunds.map((refund) => (
                        <TableRow key={refund.id}>
                          <TableCell className="font-medium">
                            {refund.payment?.order?.orderID || "N/A"}
                          </TableCell>
                          <TableCell>
                            {refund.payment?.order?.shippingName || "N/A"}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {refund.payment?.transactionId || "N/A"}
                          </TableCell>
                          <TableCell className="font-semibold">
                            €{refund.amountPaid.toFixed(2)}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {refund.reason || "N/A"}
                          </TableCell>
                          <TableCell>
                            {format(new Date(refund.createdAt), "MMM dd, yyyy")}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(refund.createdAt), "h:mm a")}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getRefundStatusBadge(refund.status)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
