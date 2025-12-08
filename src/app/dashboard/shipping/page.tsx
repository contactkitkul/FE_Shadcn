"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Truck, Pencil, Trash2 } from "lucide-react";
import { api, fetchAPI } from "@/lib/api";

// Types
type ShippingFee = {
  id: string;
  countryCode: string; // ISO 3166-1 alpha-2 code, e.g. "DE"
  countryName: string; // e.g. "Germany"
  amount: number;
};

type ShippingProvider = {
  id: string;
  name: string;
  website: string;
};

export default function SettingsPage() {
  // State for shipping fees
  const [shippingFees, setShippingFees] = useState<ShippingFee[]>([]);
  const [shippingProviders, setShippingProviders] = useState<
    ShippingProvider[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Frontend pagination state (we load all fees once, then paginate client-side)
  const [page, setPage] = useState(1);

  const [newProvider, setNewProvider] = useState<Omit<ShippingProvider, "id">>({
    name: "",
    website: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number | "">("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<
    "countryName" | "countryCode" | "amount"
  >("countryName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const PAGE_SIZE = 70;

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const backendPageSize = 100; // max allowed by backend helpers
        let apiPage = 1;
        const allFees: ShippingFee[] = [];
        let pageFees: any[] = [];

        do {
          const feesResponse = await api.shippingFees.getAll({
            page: apiPage,
            limit: backendPageSize,
          });

          const apiData = feesResponse?.data;
          pageFees = apiData?.data || [];
          const mappedFees: ShippingFee[] = pageFees.map((fee: any) => ({
            id: fee.id,
            countryCode: fee.country,
            countryName: fee.countryName,
            amount: fee.amount ?? 0,
          }));

          allFees.push(...mappedFees);
          apiPage += 1;
        } while (pageFees.length === backendPageSize);

        setShippingFees(allFees);
        setPage(1);
      } catch (error) {
        toast.error("Failed to load settings");
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const sortedFees = [...shippingFees].sort((a, b) => {
    if (sortKey === "amount") {
      const comp = a.amount - b.amount;
      return sortDirection === "asc" ? comp : -comp;
    }

    const aVal = sortKey === "countryName" ? a.countryName : a.countryCode;
    const bVal = sortKey === "countryName" ? b.countryName : b.countryCode;
    const comp = aVal.localeCompare(bVal);
    return sortDirection === "asc" ? comp : -comp;
  });

  const totalPages = Math.ceil(sortedFees.length / PAGE_SIZE);
  const visibleFees = sortedFees.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleSort = (key: "countryName" | "countryCode" | "amount") => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const startEdit = (fee: ShippingFee) => {
    setEditingId(fee.id);
    setEditAmount(fee.amount);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount("");
  };

  const saveEdit = async (fee: ShippingFee) => {
    if (
      editAmount === "" ||
      editAmount === null ||
      editAmount === undefined ||
      Number.isNaN(editAmount as number) ||
      (editAmount as number) < 0
    ) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setSavingId(fee.id);
      await fetchAPI("/shipping/fees", {
        method: "PUT",
        body: JSON.stringify({
          country: fee.countryCode,
          amount: editAmount,
          countryName: fee.countryName,
        }),
      });

      setShippingFees((prev) =>
        prev.map((f) =>
          f.id === fee.id ? { ...f, amount: editAmount as number } : f
        )
      );
      toast.success("Shipping fee updated");
      cancelEdit();
    } catch (error) {
      console.error("Error updating shipping fee:", error);
      toast.error("Failed to update shipping fee");
    } finally {
      setSavingId(null);
    }
  };

  // Handle adding a new shipping provider
  const handleAddProvider = () => {
    if (!newProvider.name.trim()) {
      toast.error("Please enter a provider name");
      return;
    }

    if (!newProvider.website.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(
        newProvider.website.startsWith("http")
          ? newProvider.website
          : `https://${newProvider.website}`
      );
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setShippingProviders([
      ...shippingProviders,
      {
        ...newProvider,
        id: Date.now().toString(),
        website: newProvider.website.startsWith("http")
          ? newProvider.website
          : `https://${newProvider.website}`,
      },
    ]);

    setNewProvider({ name: "", website: "" });
    toast.success("Shipping provider added");
  };

  // Handle removing a shipping provider
  const handleRemoveProvider = (id: string) => {
    setShippingProviders(
      shippingProviders.filter((provider) => provider.id !== id)
    );
    toast.success("Shipping provider removed");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Settings</h3>
      </div>

      <Tabs defaultValue="fees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>Shipping Fees</span>
          </TabsTrigger>
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>More Option for Later</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Fees by Country</CardTitle>
              {/* <CardDescription>
                Set shipping fees for different countries in EUR. These fees
                will be applied at checkout.
              </CardDescription> */}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {visibleFees.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 dark:bg-gray-800 font-medium border-b">
                      <button
                        type="button"
                        className="col-span-6 text-sm font-medium text-gray-500 dark:text-gray-400 text-left flex items-center gap-1"
                        onClick={() => handleSort("countryName")}
                      >
                        COUNTRY NAME
                        {sortKey === "countryName" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                      <button
                        type="button"
                        className="col-span-2 text-sm font-medium text-gray-500 dark:text-gray-400 text-left flex items-center gap-1"
                        onClick={() => handleSort("countryCode")}
                      >
                        CODE
                        {sortKey === "countryCode" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                      <button
                        type="button"
                        className="col-span-3 text-sm font-medium text-gray-500 dark:text-gray-400 justify-start flex items-center gap-1"
                        onClick={() => handleSort("amount")}
                      >
                        FEE (€)
                        {sortKey === "amount" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                      <div className="col-span-1"></div>
                    </div>
                    <div className="divide-y">
                      {visibleFees.map((fee) => (
                        <div
                          key={fee.id}
                          className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <div className="col-span-6 font-medium">
                            {fee.countryName}
                          </div>
                          <div className="col-span-2 font-mono text-sm text-gray-600 dark:text-gray-300">
                            {fee.countryCode}
                          </div>
                          <div className="col-span-3">
                            {editingId === fee.id ? (
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editAmount === "" ? "" : editAmount}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "") {
                                    setEditAmount("");
                                  } else {
                                    setEditAmount(parseFloat(value));
                                  }
                                }}
                                className="h-8"
                              />
                            ) : (
                              <>€{fee.amount.toFixed(2)}</>
                            )}
                          </div>
                          <div className="col-span-1 flex justify-end gap-1">
                            {editingId === fee.id ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700"
                                  onClick={() => saveEdit(fee)}
                                  disabled={savingId === fee.id}
                                  title="Save fee"
                                >
                                  ✓
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-gray-600"
                                  onClick={cancelEdit}
                                  title="Cancel edit"
                                >
                                  ✕
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700"
                                onClick={() => startEdit(fee)}
                                title="Edit fee"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex justify-end items-center gap-2 pt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Providers</CardTitle>
              {/* <CardDescription>
                Manage your shipping providers and their websites. These will be
                shown to customers during checkout.
              </CardDescription> */}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="provider-name">Provider Name</Label>
                    <Input
                      id="provider-name"
                      value={newProvider.name}
                      onChange={(e) =>
                        setNewProvider({ ...newProvider, name: e.target.value })
                      }
                      placeholder="e.g., DHL, UPS"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="website">Website URL</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">
                          https://
                        </span>
                      </div>
                      <Input
                        id="website"
                        type="text"
                        value={newProvider.website.replace(/^https?:\/\//, "")}
                        onChange={(e) =>
                          setNewProvider({
                            ...newProvider,
                            website: e.target.value,
                          })
                        }
                        placeholder="example.com"
                        className="pl-16"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      className="w-full"
                      onClick={handleAddProvider}
                      disabled={
                        !newProvider.name.trim() || !newProvider.website.trim()
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Provider
                    </Button>
                  </div>
                </div>

                {shippingProviders.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-800 font-medium border-b">
                      <div className="col-span-5 text-sm font-medium text-gray-500 dark:text-gray-400">
                        PROVIDER
                      </div>
                      <div className="col-span-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                        WEBSITE
                      </div>
                      <div className="col-span-1"></div>
                    </div>
                    <div className="divide-y">
                      {shippingProviders.map((provider) => (
                        <div
                          key={provider.id}
                          className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <div className="col-span-5 font-medium">
                            {provider.name}
                          </div>
                          <div className="col-span-6">
                            <a
                              href={
                                provider.website.startsWith("http")
                                  ? provider.website
                                  : `https://${provider.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              {provider.website.replace(/^https?:\/\//, "")}
                              <svg
                                className="w-3.5 h-3.5 ml-1.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M8.5 4.5a.75.75 0 0 0-1.5 0v5.69L4.97 7.84a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.5 10.19V4.5Z" />
                                <path d="M6.25 13.25a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 7.5 18.5h9a2.75 2.75 0 0 0 2.75-2.75v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25h-9c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                              </svg>
                            </a>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() => handleRemoveProvider(provider.id)}
                              title="Remove provider"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Truck className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No shipping providers
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by adding your first shipping provider.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
