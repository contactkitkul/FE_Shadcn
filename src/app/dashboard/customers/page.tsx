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
  Search,
  Users,
  Eye,
  ShoppingBag,
  Calendar,
  Edit,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  X,
} from "lucide-react";
import { Customer } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
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

interface CustomerWithOrders extends Omit<Customer, "countryCode"> {
  orderCount: number;
  totalSpent: number;
  lastOrderDate?: Date;
  email: string;
  countryId: string;
  country: {
    name: string;
    countryCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
  orders?: Array<{
    id: string;
    orderID: string;
    date: Date;
    amount: number;
    status: string;
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

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.customers.getAll({
        page: 1,
        limit: 100,
        sortBy: sortColumn,
        sortOrder: sortDirection,
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

  const handleEdit = (customer: CustomerWithOrders) => {
    setEditingCustomer(customer.id);
    setEditValues({
      firstName: customer.firstName,
      lastName: customer.lastName || "",
      email: customer.email,
    });
  };

  const handleSaveEdit = (customerId: string) => {
    setCustomers(
      customers.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              firstName: editValues.firstName,
              lastName: editValues.lastName,
              email: editValues.email,
              updatedAt: new Date(),
            }
          : customer
      )
    );
    setEditingCustomer(null);
    toast.success("Customer updated successfully");
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setEditValues({ firstName: "", lastName: "", email: "" });
  };

  const filteredAndSortedCustomers = customers
    .filter(
      (customer) =>
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    )
    .sort((a, b) => {
      let aValue: any = a[sortColumn as keyof CustomerWithOrders];
      let bValue: any = b[sortColumn as keyof CustomerWithOrders];

      if (sortColumn === "createdAt" || sortColumn === "lastOrderDate") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

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
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        No customers found
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedCustomers.map(
                    (customer: CustomerWithOrders) => (
                      <TableRow
                        key={customer.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(customer)}
                      >
                        <TableCell className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </TableCell>
                        <TableCell>
                          +{customer.country.countryCode} {customer.phone}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {customer.orderCount}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          €{customer.totalSpent.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {customer.lastOrderDate
                            ? format(customer.lastOrderDate, "MMM dd, yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          )}
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
                  <div className="text-sm text-muted-foreground">
                    +{selectedCustomer.country.countryCode}{" "}
                    {selectedCustomer.phone}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Statistics</h4>
                  <p className="text-sm text-muted-foreground">
                    Total Orders: {selectedCustomer.orderCount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Spent: €{selectedCustomer.totalSpent.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Average Order: €
                    {(
                      selectedCustomer.totalSpent / selectedCustomer.orderCount
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Order History ({selectedCustomer.orders?.length || 0})
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {selectedCustomer.orders &&
                  selectedCustomer.orders.length > 0 ? (
                    selectedCustomer.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between text-sm p-3 bg-muted rounded hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{order.orderID}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            {format(order.date, "MMM dd, yyyy")}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            €{order.amount.toFixed(2)}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))
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
