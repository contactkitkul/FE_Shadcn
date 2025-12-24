"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudDataTable } from "@/components/ui/crud-data-table";
import { StatsGrid, StatItem } from "@/components/ui/stats-grid";
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
      <StatsGrid
        loading={loading}
        columns={4}
        stats={[
          {
            label: "Total Received",
            value: `€${stats.totalReceived.toFixed(2)}`,
            subLabel: `${
              payments.filter((p) => p.paymentStatus === "SUCCESS").length
            } successful`,
            icon: DollarSign,
            iconColor: "text-green-600",
            borderColor: "border-l-green-400",
          },
          {
            label: "Pending Payments",
            value: `€${stats.pendingPayments.toFixed(2)}`,
            subLabel: `${
              payments.filter((p) => p.paymentStatus === "PENDING").length
            } pending`,
            icon: AlertCircle,
            iconColor: "text-yellow-600",
            borderColor: "border-l-yellow-400",
          },
          {
            label: "Total Refunded",
            value: `€${stats.totalRefunded.toFixed(2)}`,
            subLabel: `${
              refunds.filter((r) => r.status === "REFUNDED").length
            } processed`,
            icon: TrendingDown,
            iconColor: "text-red-600",
            borderColor: "border-l-red-400",
          },
          {
            label: "Pending Refunds",
            value: stats.pendingRefunds,
            subLabel: "Awaiting processing",
            icon: RefreshCcw,
            iconColor: "text-orange-600",
            borderColor: "border-l-orange-400",
          },
        ]}
      />

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
              <CrudDataTable<Payment>
                data={filteredPayments}
                loading={loading}
                getRowKey={(p) => p.id}
                emptyIcon={
                  <CreditCard className="h-12 w-12 text-muted-foreground" />
                }
                emptyMessage="No payments found"
                columns={[
                  {
                    key: "orderID",
                    header: "Order ID",
                    isPrimary: true,
                    render: (p) => p.order?.orderID || "N/A",
                  },
                  {
                    key: "customer",
                    header: "Customer",
                    mobileLabel: "Customer",
                    render: (p) => p.order?.shippingName || "N/A",
                  },
                  {
                    key: "transactionId",
                    header: "Transaction ID",
                    hideOnMobile: true,
                    render: (p) => (
                      <span className="font-mono text-sm">
                        {p.transactionId}
                      </span>
                    ),
                  },
                  {
                    key: "gateway",
                    header: "Gateway",
                    hideOnMobile: true,
                    render: (p) => p.paymentGateway,
                  },
                  {
                    key: "date",
                    header: "Date",
                    mobileLabel: "Date",
                    render: (p) => (
                      <div className="text-sm">
                        <div>
                          {format(new Date(p.createdAt), "MMM dd, yyyy")}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {format(new Date(p.createdAt), "h:mm a")}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "amount",
                    header: "Amount",
                    isSecondary: true,
                    render: (p) => (
                      <span className="font-semibold">
                        {getCurrencySymbol(p.currencyPaid)}
                        {p.amountPaid.toFixed(2)}
                      </span>
                    ),
                  },
                  {
                    key: "status",
                    header: "Status",
                    mobileLabel: "Status",
                    render: (p) => getPaymentStatusBadge(p.paymentStatus),
                  },
                ]}
              />
            </TabsContent>

            <TabsContent value="refunds">
              <CrudDataTable<Refund>
                data={filteredRefunds}
                loading={loading}
                getRowKey={(r) => r.id}
                emptyIcon={
                  <RefreshCcw className="h-12 w-12 text-muted-foreground" />
                }
                emptyMessage="No refunds found"
                columns={[
                  {
                    key: "orderID",
                    header: "Order ID",
                    isPrimary: true,
                    render: (r) => r.payment?.order?.orderID || "N/A",
                  },
                  {
                    key: "customer",
                    header: "Customer",
                    mobileLabel: "Customer",
                    render: (r) => r.payment?.order?.shippingName || "N/A",
                  },
                  {
                    key: "transactionId",
                    header: "Transaction ID",
                    hideOnMobile: true,
                    render: (r) => (
                      <span className="font-mono text-sm">
                        {r.payment?.transactionId || "N/A"}
                      </span>
                    ),
                  },
                  {
                    key: "amount",
                    header: "Amount",
                    isSecondary: true,
                    render: (r) => (
                      <span className="font-semibold">
                        €{r.amountPaid.toFixed(2)}
                      </span>
                    ),
                  },
                  {
                    key: "reason",
                    header: "Reason",
                    hideOnMobile: true,
                    className: "max-w-[200px] truncate",
                    render: (r) => r.reason || "N/A",
                  },
                  {
                    key: "date",
                    header: "Date",
                    mobileLabel: "Date",
                    render: (r) => (
                      <div className="text-sm">
                        <div>
                          {format(new Date(r.createdAt), "MMM dd, yyyy")}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {format(new Date(r.createdAt), "h:mm a")}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "status",
                    header: "Status",
                    mobileLabel: "Status",
                    render: (r) => getRefundStatusBadge(r.status),
                  },
                ]}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
