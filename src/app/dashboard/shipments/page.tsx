"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Truck, Package, MapPin, Check, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Shipment, EnumShipmentStatus } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { format } from "date-fns"
import { api } from "@/lib/api"
import { useDebounce } from "@/hooks/useDebounce"
import { getEntityMessages } from "@/config/messages"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortColumn, setSortColumn] = useState<string>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    shipmentId: string;
    newStatus: EnumShipmentStatus;
    shipmentNumber: string;
  } | null>(null)

  // Fetch shipments from API
  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await api.shipments.getAll({
        page: 1,
        limit: 100,
        sortBy: sortColumn,
        sortOrder: sortDirection,
        search: searchTerm,
      });

      if (response.success) {
        setShipments(response.data.data || []);
      } else {
        toast.error(getEntityMessages('shipments').loadError);
      }
    } catch (error: any) {
      console.error("Error fetching shipments:", error);
      toast.error(error.message || getEntityMessages('shipments').loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortColumn, sortDirection, debouncedSearch]);

  // Old mock data
  const oldMockEffect = () => {
    setTimeout(() => {
      const mockShipments: Shipment[] = [
        {
          id: "1",
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date(),
          trackingNumber: "DHL1234567890",
          orderId: "ord1",
          provider: "DHL",
          status: EnumShipmentStatus.IN_TRANSIT,
        },
        {
          id: "2",
          createdAt: new Date("2024-01-14"),
          updatedAt: new Date(),
          trackingNumber: "FEDEX9876543210",
          orderId: "ord2",
          provider: "FEDEX",
          status: EnumShipmentStatus.DELIVERED,
        },
        {
          id: "3",
          createdAt: new Date("2024-01-16"),
          updatedAt: new Date(),
          trackingNumber: "UPS5551234567",
          orderId: "ord3",
          provider: "UPS",
          status: EnumShipmentStatus.LABEL_CREATED,
        },
        {
          id: "4",
          createdAt: new Date("2024-01-13"),
          updatedAt: new Date(),
          trackingNumber: "RM4449876543",
          orderId: "ord4",
          provider: "ROYAL_MAIL",
          status: EnumShipmentStatus.IN_TRANSIT,
        },
      ];
      setShipments(mockShipments);
      setLoading(false);
    }, 1000);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    )
  }

  const filteredAndSortedShipments = shipments
    .filter((shipment) => {
      const matchesSearch =
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.provider.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || shipment.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue: any = a[sortColumn as keyof Shipment]
      let bValue: any = b[sortColumn as keyof Shipment]

      if (sortColumn === "createdAt") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const getStatusBadge = (status: EnumShipmentStatus) => {
    const variants: Record<EnumShipmentStatus, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      LABEL_CREATED: { variant: "secondary", label: "Label Created" },
      IN_TRANSIT: { variant: "default", label: "In Transit" },
      DELIVERED: { variant: "outline", label: "Delivered" },
      RETURNED: { variant: "destructive", label: "Returned" },
      CANCELLED: { variant: "destructive", label: "Cancelled" },
    }
    return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>
  }

  const handleStatusChange = (shipmentId: string, newStatus: EnumShipmentStatus, shipmentNumber: string) => {
    setPendingStatusChange({ shipmentId, newStatus, shipmentNumber })
  }

  const confirmStatusChange = () => {
    if (!pendingStatusChange) return
    
    setShipments(shipments.map(shipment => 
      shipment.id === pendingStatusChange.shipmentId 
        ? { ...shipment, status: pendingStatusChange.newStatus, updatedAt: new Date() } 
        : shipment
    ))
    toast.success("Shipment status updated successfully")
    setPendingStatusChange(null)
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "DHL":
      case "FEDEX":
      case "UPS":
        return <Truck className="h-4 w-4" />
      case "ROYAL_MAIL":
        return <Package className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shipments</h2>
          <p className="text-muted-foreground">
            Track and manage order shipments
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shipments.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shipments.filter(s => s.status === EnumShipmentStatus.IN_TRANSIT).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently shipping</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shipments.filter(s => s.status === EnumShipmentStatus.DELIVERED).length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shipments.filter(s => s.status === EnumShipmentStatus.LABEL_CREATED).length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting pickup</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shipment Tracking</CardTitle>
              <CardDescription>Monitor all shipments and their status</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shipments</SelectItem>
                  <SelectItem value="LABEL_CREATED">Label Created</SelectItem>
                  <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tracking..."
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
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("trackingNumber")}
                      className="h-auto p-0 font-semibold"
                    >
                      Tracking Number
                      {getSortIcon("trackingNumber")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("provider")}
                      className="h-auto p-0 font-semibold"
                    >
                      Provider
                      {getSortIcon("provider")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("orderId")}
                      className="h-auto p-0 font-semibold"
                    >
                      Order ID
                      {getSortIcon("orderId")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("createdAt")}
                      className="h-auto p-0 font-semibold"
                    >
                      Created
                      {getSortIcon("createdAt")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("status")}
                      className="h-auto p-0 font-semibold"
                    >
                      Status
                      {getSortIcon("status")}
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedShipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No shipments found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedShipments.map((shipment: Shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium font-mono">
                        {shipment.trackingNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getProviderIcon(shipment.provider)}
                          <span>{shipment.provider.replace(/_/g, " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell>{shipment.orderId}</TableCell>
                      <TableCell>{format(new Date(shipment.createdAt), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={shipment.status}
                          onValueChange={(value) => handleStatusChange(shipment.id, value as EnumShipmentStatus, shipment.trackingNumber)}
                        >
                          <SelectTrigger className="w-[160px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LABEL_CREATED">Label Created</SelectItem>
                            <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="RETURNED">Returned</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingStatusChange} onOpenChange={() => setPendingStatusChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of shipment{" "}
              <span className="font-semibold">{pendingStatusChange?.shipmentNumber}</span> to{" "}
              <span className="font-semibold">
                {pendingStatusChange?.newStatus.replace(/_/g, " ").toLowerCase()}
              </span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatusChange(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              <Check className="mr-2 h-4 w-4" />
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
