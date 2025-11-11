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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Download,
  FileText,
  Calendar as CalendarIcon,
  TrendingUp,
  Package,
  Users,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [reportType, setReportType] = useState("sales");
  const [exportFormat, setExportFormat] = useState("csv");
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!dateFrom || !dateTo) {
      toast.error("Please select date range");
      return;
    }

    setGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      toast.success(`${reportType} report generated successfully`);
      setGenerating(false);
    }, 2000);
  };

  const handleExport = (format: string) => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
    // Implement actual export logic
  };

  const quickReports = [
    {
      title: "Today's Sales",
      description: "Sales summary for today",
      icon: TrendingUp,
      value: "€2,450",
      change: "+12%",
    },
    {
      title: "This Week",
      description: "Weekly sales report",
      icon: DollarSign,
      value: "€15,230",
      change: "+8%",
    },
    {
      title: "This Month",
      description: "Monthly performance",
      icon: Package,
      value: "€68,900",
      change: "+15%",
    },
    {
      title: "Customer Report",
      description: "Customer analytics",
      icon: Users,
      value: "1,284",
      change: "+23",
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Generate and export business reports
          </p>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickReports.map((report, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => toast.info(`Generating ${report.title}...`)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {report.title}
              </CardTitle>
              <report.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.value}</div>
              <p className="text-xs text-muted-foreground">
                {report.change} from yesterday
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Custom Report</CardTitle>
              <CardDescription>
                Select parameters and generate detailed reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Report Type */}
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Report</SelectItem>
                      <SelectItem value="inventory">Inventory Report</SelectItem>
                      <SelectItem value="financial">Financial Report</SelectItem>
                      <SelectItem value="customer">Customer Report</SelectItem>
                      <SelectItem value="product">Product Performance</SelectItem>
                      <SelectItem value="shipping">Shipping Report</SelectItem>
                      <SelectItem value="refunds">Refunds Report</SelectItem>
                      <SelectItem value="discounts">Discount Usage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Export Format */}
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel (XLSX)</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From */}
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date To */}
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {generating ? "Generating..." : "Generate Report"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport(exportFormat)}
                  disabled={!dateFrom || !dateTo}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Quick access to common reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "Daily Sales Summary", type: "sales" },
                  { name: "Weekly Revenue", type: "financial" },
                  { name: "Monthly Inventory", type: "inventory" },
                  { name: "Customer Lifetime Value", type: "customer" },
                  { name: "Best Selling Products", type: "product" },
                  { name: "Shipping Performance", type: "shipping" },
                ].map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setReportType(template.type);
                      toast.info(`Loading ${template.name} template...`);
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Automatically generated reports sent to your email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Weekly Sales Report",
                    schedule: "Every Monday at 9:00 AM",
                    format: "PDF",
                    active: true,
                  },
                  {
                    name: "Monthly Financial Summary",
                    schedule: "1st of every month",
                    format: "Excel",
                    active: true,
                  },
                  {
                    name: "Daily Inventory Alert",
                    schedule: "Every day at 6:00 PM",
                    format: "CSV",
                    active: false,
                  },
                ].map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{report.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {report.schedule} • {report.format}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          report.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {report.active ? "Active" : "Inactive"}
                      </span>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4">
                <FileText className="mr-2 h-4 w-4" />
                Create Scheduled Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>
                Previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    name: "Sales Report - November 2024",
                    date: "Nov 10, 2024 3:45 PM",
                    size: "2.4 MB",
                    format: "PDF",
                  },
                  {
                    name: "Inventory Report - Q4 2024",
                    date: "Nov 8, 2024 10:30 AM",
                    size: "1.8 MB",
                    format: "Excel",
                  },
                  {
                    name: "Customer Analytics - October",
                    date: "Nov 1, 2024 9:00 AM",
                    size: "856 KB",
                    format: "CSV",
                  },
                  {
                    name: "Financial Summary - October",
                    date: "Nov 1, 2024 9:00 AM",
                    size: "1.2 MB",
                    format: "PDF",
                  },
                  {
                    name: "Product Performance - Q3",
                    date: "Oct 15, 2024 2:15 PM",
                    size: "3.1 MB",
                    format: "Excel",
                  },
                ].map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium text-sm">{report.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {report.date} • {report.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {report.format}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
