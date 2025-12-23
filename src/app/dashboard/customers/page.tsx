"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CrudDataTable } from "@/components/ui/crud-data-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Eye, ShoppingBag, Calendar } from "lucide-react";
import { Customer } from "@/types";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { getEntityMessages } from "@/config/messages";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    createdAt: string;
  }>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithOrders | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  }>({ firstName: "", lastName: "", email: "" });

  // Fetch customers from API - sorting done client-side for speed
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]); // Removed sort deps - sorting is client-side

  // Client-side sorting for instant response
  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => {
      let aVal: any = a[sortColumn as keyof CustomerWithOrders];
      let bVal: any = b[sortColumn as keyof CustomerWithOrders];

      if (sortColumn === "createdAt" || sortColumn === "updatedAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase() || "";
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [customers, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleViewDetails = (customer: CustomerWithOrders) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(customers.length * 0.7)}
            </div>
            <p className="text-xs text-muted-foreground">
              Made purchase in last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New This Month
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(customers.length * 0.2)}
            </div>
            <p className="text-xs text-muted-foreground">First-time buyers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Directory</CardTitle>
              {/* <CardDescription> */}
              {/* View and manage customer information */}
              {/* </CardDescription> */}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-8 w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CrudDataTable<CustomerWithOrders>
            data={sortedCustomers}
            loading={loading}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            getRowKey={(customer) => customer.id}
            emptyIcon={<Users className="h-12 w-12 text-muted-foreground" />}
            emptyMessage="No customers found"
            columns={[
              {
                key: "firstName",
                header: "Name",
                sortable: true,
                render: (customer) => (
                  <span className="font-medium">
                    {customer.firstName} {customer.lastName}
                  </span>
                ),
              },
              {
                key: "email",
                header: "Email",
                render: (customer) => customer.email,
              },
              {
                key: "phone",
                header: "Phone",
                render: (customer) => customer.phone || "N/A",
              },
              {
                key: "totalOrders",
                header: "Orders",
                sortable: true,
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
                render: (customer) => {
                  const total =
                    customer.Order?.reduce(
                      (sum, o) => sum + (o.totalAmount || 0),
                      0
                    ) || 0;
                  return (
                    <span className="font-semibold">€{total.toFixed(2)}</span>
                  );
                },
              },
              {
                key: "createdAt",
                header: "Joined",
                sortable: true,
                render: (customer) => {
                  const date = new Date(customer.createdAt);
                  return isNaN(date.getTime())
                    ? "N/A"
                    : format(date, "MMM dd, yyyy");
                },
              },
              {
                key: "actions",
                header: "Actions",
                className: "text-right",
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
            ]}
          />
        </CardContent>
      </Card>

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
    </div>
  );
}
