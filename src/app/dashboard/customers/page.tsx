"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CrudPage,
  useCrudPageState,
  CrudColumn,
} from "@/components/crud/crud-page";
import { StatItem } from "@/components/ui/stats-grid";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Eye, ShoppingBag, Calendar } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { getEntityMessages } from "@/config/messages";

interface CustomerWithOrders {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  totalOrders: number;
  createdAt: string;
  updatedAt: string;
  Order?: Array<{
    id: string;
    orderID: string;
    orderStatus: string;
    totalAmount: number;
    currencyPayment: string;
    createdAt: string;
  }>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithOrders | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    sortColumn,
    sortDirection,
    handleSort,
    sortData,
  } = useCrudPageState("createdAt", "desc");

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.customers.getAll({
        page: 1,
        limit: 100,
        search: searchTerm,
      });

      if (response.success) {
        setCustomers(response.data.data || []);
      } else {
        toast.error(getEntityMessages("customers").loadError);
      }
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      toast.error(error.message || getEntityMessages("customers").loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [debouncedSearch]);

  // Sort data
  const sortedCustomers = useMemo(() => {
    return sortData(customers, sortColumn, sortDirection);
  }, [customers, sortColumn, sortDirection, sortData]);

  const handleViewDetails = (customer: CustomerWithOrders) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  // Stats
  const stats: StatItem[] = useMemo(
    () => [
      {
        label: "Total Customers",
        value: customers.length,
        subLabel: "All registered",
        icon: Users,
        borderColor: "border-l-blue-400",
      },
      // {
      //   label: "Active Customers",
      //   value: Math.floor(customers.length * 0.7),
      //   subLabel: "Made purchase in last 30 days",
      //   icon: Users,
      //   iconColor: "text-green-500",
      //   borderColor: "border-l-green-400",
      // },
      // {
      //   label: "New This Month",
      //   value: Math.floor(customers.length * 0.2),
      //   subLabel: "First-time buyers",
      //   icon: Users,
      //   iconColor: "text-purple-500",
      //   borderColor: "border-l-purple-400",
      // },
    ],
    [customers]
  );

  // Columns
  const columns: CrudColumn<CustomerWithOrders>[] = [
    {
      key: "firstName",
      header: "Name",
      sortable: true,
      isPrimary: true,
      render: (customer) => (
        <span className="font-medium">
          {customer.firstName} {customer.lastName}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      mobileLabel: "Email",
      render: (customer) => customer.email,
    },
    {
      key: "phone",
      header: "Phone",
      minWidth: "md",
      render: (customer) => customer.phone || "N/A",
    },
    {
      key: "totalOrders",
      header: "Orders",
      sortable: true,
      mobileLabel: "Orders",
      render: (customer) => (
        <div className="flex items-center gap-1">
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{customer.totalOrders}</span>
        </div>
      ),
    },
    {
      key: "totalSpent",
      header: "Total Spent",
      isSecondary: true,
      render: (customer) => {
        const total =
          customer.Order?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) ||
          0;
        return <span className="font-semibold">€{total.toFixed(2)}</span>;
      },
    },
    {
      key: "createdAt",
      header: "Joined",
      sortable: true,
      minWidth: "lg",
      render: (customer) => {
        const date = new Date(customer.createdAt);
        return isNaN(date.getTime()) ? "N/A" : format(date, "MMM dd, yyyy");
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      hideOnMobile: true,
      render: (customer) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(customer);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Export config
  const exportConfig = {
    filename: "customers",
    headers: ["Name", "Email", "Phone", "Orders", "Total Spent", "Joined"],
    rowMapper: (customer: CustomerWithOrders) => [
      `${customer.firstName} ${customer.lastName || ""}`,
      customer.email,
      customer.phone || "N/A",
      customer.totalOrders,
      `€${(
        customer.Order?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0
      ).toFixed(2)}`,
      format(new Date(customer.createdAt), "MMM dd, yyyy"),
    ],
  };

  return (
    <>
      <CrudPage<CustomerWithOrders>
        title="Customers"
        description="Manage your customer database"
        data={sortedCustomers}
        loading={loading}
        getRowKey={(customer) => customer.id}
        columns={columns}
        stats={stats}
        statsColumns={3}
        searchPlaceholder="Search customers..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        actions={{
          onRowClick: handleViewDetails,
          customActions: (customer) => (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(customer);
              }}
            >
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
          ),
        }}
        exportConfig={exportConfig}
        emptyIcon={<Users className="h-12 w-12 text-muted-foreground" />}
        emptyMessage="No customers found"
      />

      {/* Customer Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.firstName} {selectedCustomer?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <p className="text-sm text-muted-foreground">
                    Name: {selectedCustomer.firstName}{" "}
                    {selectedCustomer.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Email: {selectedCustomer.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Phone: {selectedCustomer.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Statistics</h4>
                  <p className="text-sm text-muted-foreground">
                    Total Orders: {selectedCustomer.totalOrders}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Spent: €
                    {(
                      selectedCustomer.Order?.reduce(
                        (sum, o) => sum + (o.totalAmount || 0),
                        0
                      ) || 0
                    ).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Average Order: €
                    {selectedCustomer.totalOrders > 0
                      ? (
                          (selectedCustomer.Order?.reduce(
                            (sum, o) => sum + (o.totalAmount || 0),
                            0
                          ) || 0) / selectedCustomer.totalOrders
                        ).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Order History ({selectedCustomer.Order?.length || 0})
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {selectedCustomer.Order &&
                  selectedCustomer.Order.length > 0 ? (
                    selectedCustomer.Order.map((order) => {
                      const orderDate = new Date(order.createdAt);
                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between text-sm p-3 bg-muted rounded hover:bg-muted/80 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{order.orderID}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              {isNaN(orderDate.getTime())
                                ? "N/A"
                                : format(orderDate, "MMM dd, yyyy")}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              €{(order.totalAmount || 0).toFixed(2)}
                            </p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {order.orderStatus}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No orders found
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
