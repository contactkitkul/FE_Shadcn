"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  Store,
  CreditCard,
  Truck,
  Mail,
  Users,
  Bell,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("Football Shirts");
  const [storeEmail, setStoreEmail] = useState("contact@footballshirts.com");
  const [currency, setCurrency] = useState("EUR");
  const [timezone, setTimezone] = useState("Europe/London");

  const handleSaveGeneral = () => {
    toast.success("General settings saved successfully");
  };

  const handleSavePayment = () => {
    toast.success("Payment settings saved successfully");
  };

  const handleSaveShipping = () => {
    toast.success("Shipping settings saved successfully");
  };

  const handleSaveEmail = () => {
    toast.success("Email settings saved successfully");
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your store configuration and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                <CardTitle>Store Information</CardTitle>
              </div>
              <CardDescription>
                Basic information about your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Contact Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={storeEmail}
                    onChange={(e) => setStoreEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="America/New_York">New York (EST)</SelectItem>
                      <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address</Label>
                <Textarea
                  id="storeAddress"
                  placeholder="Enter your store address..."
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveGeneral}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle>Payment Gateways</CardTitle>
              </div>
              <CardDescription>
                Configure payment processing options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stripe */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Stripe</h4>
                    <p className="text-sm text-muted-foreground">
                      Accept credit cards and digital wallets
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid gap-4 md:grid-cols-2 pl-4">
                  <div className="space-y-2">
                    <Label>Publishable Key</Label>
                    <Input type="password" placeholder="pk_live_..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Secret Key</Label>
                    <Input type="password" placeholder="sk_live_..." />
                  </div>
                </div>
              </div>

              <Separator />

              {/* PayPal */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">PayPal</h4>
                    <p className="text-sm text-muted-foreground">
                      Accept PayPal payments
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid gap-4 md:grid-cols-2 pl-4">
                  <div className="space-y-2">
                    <Label>Client ID</Label>
                    <Input type="password" placeholder="Client ID..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Secret</Label>
                    <Input type="password" placeholder="Secret..." />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Test Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Test Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Use test credentials for development
                  </p>
                </div>
                <Switch />
              </div>

              <Button onClick={handleSavePayment}>Save Payment Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                <CardTitle>Shipping Providers</CardTitle>
              </div>
              <CardDescription>
                Configure shipping and tracking options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {["DHL", "FedEx", "UPS", "Royal Mail", "USPS"].map((provider) => (
                <div key={provider} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{provider}</h4>
                      <p className="text-sm text-muted-foreground">
                        Enable {provider} shipping
                      </p>
                    </div>
                    <Switch defaultChecked={provider === "DHL"} />
                  </div>
                  {provider === "DHL" && (
                    <div className="grid gap-4 md:grid-cols-2 pl-4">
                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <Input type="password" placeholder="API Key..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input placeholder="Account number..." />
                      </div>
                    </div>
                  )}
                  <Separator />
                </div>
              ))}

              <div className="space-y-4">
                <h4 className="font-semibold">Default Shipping Rates</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Domestic Shipping</Label>
                    <Input type="number" placeholder="5.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>International Shipping</Label>
                    <Input type="number" placeholder="15.00" />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveShipping}>Save Shipping Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <CardTitle>Email Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure SMTP and email templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">SMTP Settings</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>SMTP Host</Label>
                    <Input placeholder="smtp.gmail.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Port</Label>
                    <Input type="number" placeholder="587" />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input type="email" placeholder="your@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" placeholder="Password..." />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Email Notifications</h4>
                <div className="space-y-3">
                  {[
                    "Order Confirmation",
                    "Shipping Notification",
                    "Delivery Confirmation",
                    "Refund Processed",
                    "Abandoned Cart Recovery",
                  ].map((notification) => (
                    <div
                      key={notification}
                      className="flex items-center justify-between"
                    >
                      <Label>{notification}</Label>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveEmail}>Save Email Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Settings */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>User Management</CardTitle>
              </div>
              <CardDescription>
                Manage admin users and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { name: "Admin User", email: "admin@store.com", role: "Administrator" },
                  { name: "Manager", email: "manager@store.com", role: "Manager" },
                  { name: "Staff", email: "staff@store.com", role: "Staff" },
                ].map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {user.role}
                      </span>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Add New User
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription>
                Configure system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Order Notifications</h4>
                <div className="space-y-3">
                  {[
                    "New order received",
                    "Payment processed",
                    "Order fulfilled",
                    "Refund requested",
                  ].map((notification) => (
                    <div
                      key={notification}
                      className="flex items-center justify-between"
                    >
                      <Label>{notification}</Label>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Inventory Alerts</h4>
                <div className="space-y-3">
                  {[
                    "Low stock alert (< 10 units)",
                    "Out of stock alert",
                    "Reorder point reached",
                  ].map((notification) => (
                    <div
                      key={notification}
                      className="flex items-center justify-between"
                    >
                      <Label>{notification}</Label>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">System Alerts</h4>
                <div className="space-y-3">
                  {[
                    "Payment failures",
                    "API errors",
                    "Security alerts",
                  ].map((notification) => (
                    <div
                      key={notification}
                      className="flex items-center justify-between"
                    >
                      <Label>{notification}</Label>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
