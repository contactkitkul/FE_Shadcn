"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { toast } from "sonner";
import { Plus, Trash2, Truck } from "lucide-react";

// Types
type ShippingFee = {
  id: string;
  country: string;
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
  const [shippingProviders, setShippingProviders] = useState<ShippingProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [newFee, setNewFee] = useState<Omit<ShippingFee, 'id'>>({ 
    country: '', 
    amount: 0 
  });
  
  const [newProvider, setNewProvider] = useState<Omit<ShippingProvider, 'id'>>({ 
    name: '', 
    website: '' 
  });

  // Available countries for shipping
  const countries = [
    'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 
    'Belgium', 'Austria', 'Switzerland', 'United Kingdom', 'United States',
    'Canada', 'Australia', 'Japan', 'China', 'India', 'Brazil', 'Mexico'
  ];

  // Load data on component mount
  useEffect(() => {
    // In a real app, you would fetch this data from your API
    const loadData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - replace with actual API calls
        setShippingFees([
          { id: '1', country: 'Germany', amount: 10 },
          { id: '2', country: 'France', amount: 12 },
        ]);
        
        setShippingProviders([
          { id: '1', name: 'DHL', website: 'https://www.dhl.com' },
          { id: '2', name: 'UPS', website: 'https://www.ups.com' },
        ]);
        
      } catch (error) {
        toast.error('Failed to load settings');
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handle adding a new shipping fee
  const handleAddFee = () => {
    if (!newFee.country) {
      toast.error('Please select a country');
      return;
    }
    
    if (!newFee.amount || newFee.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    // Check if country already has a fee
    if (shippingFees.some(fee => fee.country === newFee.country)) {
      toast.error('This country already has a shipping fee');
      return;
    }
    
    setShippingFees([...shippingFees, { ...newFee, id: Date.now().toString() }]);
    setNewFee({ country: '', amount: 0 });
    toast.success('Shipping fee added');
  };

  // Handle removing a shipping fee
  const handleRemoveFee = (id: string) => {
    setShippingFees(shippingFees.filter(fee => fee.id !== id));
    toast.success('Shipping fee removed');
  };

  // Handle adding a new shipping provider
  const handleAddProvider = () => {
    if (!newProvider.name.trim()) {
      toast.error('Please enter a provider name');
      return;
    }
    
    if (!newProvider.website.trim()) {
      toast.error('Please enter a website URL');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(newProvider.website.startsWith('http') ? newProvider.website : `https://${newProvider.website}`);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }
    
    setShippingProviders([...shippingProviders, { 
      ...newProvider, 
      id: Date.now().toString(),
      website: newProvider.website.startsWith('http') ? newProvider.website : `https://${newProvider.website}`
    }]);
    
    setNewProvider({ name: '', website: '' });
    toast.success('Shipping provider added');
  };

  // Handle removing a shipping provider
  const handleRemoveProvider = (id: string) => {
    setShippingProviders(shippingProviders.filter(provider => provider.id !== id));
    toast.success('Shipping provider removed');
  };

  // Save all settings
  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      // In a real app, you would make API calls here to save the data
      // await api.saveShippingFees(shippingFees);
      // await api.saveShippingProviders(shippingProviders);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
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
        <h3 className="text-2xl font-bold tracking-tight">Shipping Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your shipping fees and providers
        </p>
      </div>
      
      <Tabs defaultValue="fees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>Shipping Fees</span>
          </TabsTrigger>
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>Shipping Providers</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Fees by Country</CardTitle>
                <CardDescription>
                  Set shipping fees for different countries in EUR. These fees will be applied at checkout.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="country">Country</Label>
                      <Select 
                        value={newFee.country}
                        onValueChange={(value) => setNewFee({...newFee, country: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries
                            .filter(country => !shippingFees.some(fee => fee.country === country))
                            .map(country => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Fee (€)</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">€</span>
                        </div>
                        <Input
                          id="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newFee.amount || ''}
                          onChange={(e) => setNewFee({...newFee, amount: parseFloat(e.target.value) || 0})}
                          placeholder="0.00"
                          className="pl-7"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        className="w-full" 
                        onClick={handleAddFee}
                        disabled={!newFee.country || !newFee.amount}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Fee
                      </Button>
                    </div>
                  </div>

                  {shippingFees.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-800 font-medium border-b">
                        <div className="col-span-8 text-sm font-medium text-gray-500 dark:text-gray-400">COUNTRY</div>
                        <div className="col-span-3 text-sm font-medium text-gray-500 dark:text-gray-400">FEE (€)</div>
                        <div className="col-span-1"></div>
                      </div>
                      <div className="divide-y">
                        {shippingFees.map((fee) => (
                          <div key={fee.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <div className="col-span-8 font-medium">{fee.country}</div>
                            <div className="col-span-3">€{fee.amount.toFixed(2)}</div>
                            <div className="col-span-1 flex justify-end">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => handleRemoveFee(fee.id)}
                                title="Remove fee"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Providers</CardTitle>
                <CardDescription>
                  Manage your shipping providers and their websites. These will be shown to customers during checkout.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="provider-name">Provider Name</Label>
                      <Input
                        id="provider-name"
                        value={newProvider.name}
                        onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
                        placeholder="e.g., DHL, UPS"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="website">Website URL</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">https://</span>
                        </div>
                        <Input
                          id="website"
                          type="text"
                          value={newProvider.website.replace(/^https?:\/\//, '')}
                          onChange={(e) => setNewProvider({...newProvider, website: e.target.value})}
                          placeholder="example.com"
                          className="pl-16"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        className="w-full" 
                        onClick={handleAddProvider}
                        disabled={!newProvider.name.trim() || !newProvider.website.trim()}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Provider
                      </Button>
                    </div>
                  </div>

                  {shippingProviders.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-800 font-medium border-b">
                        <div className="col-span-5 text-sm font-medium text-gray-500 dark:text-gray-400">PROVIDER</div>
                        <div className="col-span-6 text-sm font-medium text-gray-500 dark:text-gray-400">WEBSITE</div>
                        <div className="col-span-1"></div>
                      </div>
                      <div className="divide-y">
                        {shippingProviders.map((provider) => (
                          <div key={provider.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <div className="col-span-5 font-medium">{provider.name}</div>
                            <div className="col-span-6">
                              <a 
                                href={provider.website.startsWith('http') ? provider.website : `https://${provider.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center"
                              >
                                {provider.website.replace(/^https?:\/\//, '')}
                                <svg className="w-3.5 h-3.5 ml-1.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No shipping providers</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by adding your first shipping provider.</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }