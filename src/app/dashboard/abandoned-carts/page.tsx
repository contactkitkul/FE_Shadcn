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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  ShoppingCart,
  Mail,
  TrendingUp,
  DollarSign,
  Eye,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";

interface AbandonedCart {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalPrice: number;
  currency: string;
  createdAt: Date;
  source: string;
  recovered: boolean;
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      const mockCarts: AbandonedCart[] = [
        {
          id: "1",
          customerName: "John Doe",
          customerEmail: "john@example.com",
          phone: "+44 7700 900123",
          items: [
            { name: "Man Utd Home 23/24 - M", quantity: 1, price: 89.99 },
            { name: "Player Patch", quantity: 1, price: 15.0 },
          ],
          totalPrice: 104.99,
          currency: "EUR",
          createdAt: new Date("2024-11-11T10:30:00"),
          source: "Website",
          recovered: false,
        },
        {
          id: "2",
          customerName: "Jane Smith",
          customerEmail: "jane@example.com",
          phone: "+44 7700 900456",
          items: [
            { name: "Real Madrid Away 23/24 - L", quantity: 2, price: 84.99 },
          ],
          totalPrice: 169.98,
          currency: "EUR",
          createdAt: new Date("2024-11-10T15:45:00"),
          source: "Mobile App",
          recovered: false,
        },
        {
          id: "3",
          customerName: "Mike Johnson",
          customerEmail: "mike@example.com",
          phone: "+1 555 123 4567",
          items: [
            { name: "Barcelona Home 23/24 - S", quantity: 1, price: 89.99 },
          ],
          totalPrice: 89.99,
          currency: "EUR",
          createdAt: new Date("2024-11-09T09:15:00"),
          source: "Website",
          recovered: true,
        },
      ];
      setCarts(mockCarts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCarts = carts.filter(
    (cart) =>
      cart.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cart.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendRecoveryEmail = (cart: AbandonedCart) => {
    toast.success(`Recovery email sent to ${cart.customerEmail}`);
    // Implement actual email sending
  };

  const totalValue = carts.reduce((sum, cart) => sum + cart.totalPrice, 0);
  const recoveredCount = carts.filter((cart) => cart.recovered).length;
  const recoveryRate = carts.length > 0 ? (recoveredCount / carts.length) * 100 : 0;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Abandoned Carts</h2>
          <p className="text-muted-foreground">
            Recover lost sales and boost conversions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Abandoned
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carts.length}</div>
            <p className="text-xs text-muted-foreground">Active carts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Potential revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovered</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recoveredCount}</div>
            <p className="text-xs text-muted-foreground">Converted to orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recoveryRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Carts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Abandoned Carts</CardTitle>
              <CardDescription>
                View and recover abandoned shopping carts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Cart Value</TableHead>
                  <TableHead>Abandoned</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCarts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        No abandoned carts found
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCarts.map((cart) => (
                    <TableRow key={cart.id}>
                      <TableCell className="font-medium">
                        {cart.customerName}
                      </TableCell>
                      <TableCell>{cart.customerEmail}</TableCell>
                      <TableCell>{cart.items.length} items</TableCell>
                      <TableCell className="font-semibold">
                        €{cart.totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {format(cart.createdAt, "MMM dd, yyyy")}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {format(cart.createdAt, "h:mm a")}
                        </span>
                      </TableCell>
                      <TableCell>{cart.source}</TableCell>
                      <TableCell>
                        {cart.recovered ? (
                          <Badge className="bg-green-100 text-green-800">
                            Recovered
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCart(cart);
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!cart.recovered && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendRecoveryEmail(cart)}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Cart Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cart Details</DialogTitle>
            <DialogDescription>
              {selectedCart?.customerName} - {selectedCart?.customerEmail}
            </DialogDescription>
          </DialogHeader>
          {selectedCart && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <p className="text-sm text-muted-foreground">
                    Name: {selectedCart.customerName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Email: {selectedCart.customerEmail}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Phone: {selectedCart.phone}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Cart Information</h4>
                  <p className="text-sm text-muted-foreground">
                    Source: {selectedCart.source}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Abandoned: {format(selectedCart.createdAt, "PPP")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {selectedCart.recovered ? "Recovered" : "Pending"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Cart Items</h4>
                <div className="space-y-2">
                  {selectedCart.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-3 bg-muted rounded"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">€{item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg">
                    €{selectedCart.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {!selectedCart.recovered && (
                <Button
                  className="w-full"
                  onClick={() => handleSendRecoveryEmail(selectedCart)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Recovery Email
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
