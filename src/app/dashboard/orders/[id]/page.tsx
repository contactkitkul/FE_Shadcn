"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  CreditCard, 
  Truck,
  Mail,
  Phone,
  Edit,
  Printer,
  MoreHorizontal,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { Order, EnumOrderStatus, EnumCurrency, EnumRiskChargeback } from "@/types"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState("")

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      const mockOrder: Order = {
        id: params.id,
        createdAt: new Date("2024-11-11T09:31:00"),
        updatedAt: new Date(),
        shippingName: "Fousseynou Sall",
        shippingPhone: "+33 7 50 01 42 24",
        shippingLine1: "25 Rue Voltaire",
        shippingLine2: "Appartement 3",
        shippingCity: "Clichy",
        shippingState: "Île-de-France",
        shippingPostalCode: "92110",
        shippingCountry: "France",
        shippingEmail: "fousseynousal100@gmail.com",
        orderID: "FUTGY@44613",
        orderStatus: EnumOrderStatus.RECEIVED,
        customerId: "cust1",
        totalAmount: 19.90,
        discountAmount: 0,
        payableAmount: 19.90,
        currencyPayment: EnumCurrency.EUR,
        riskChargeback: EnumRiskChargeback.SAFE,
        notes: "",
        orderItems: [
          {
            id: "item1",
            createdAt: new Date(),
            updatedAt: new Date(),
            orderId: params.id,
            productVariantId: "var1",
            customisationString: "JAS_2623: 75877",
            quantity: 1,
            productVariant: {
              id: "var1",
              createdAt: new Date(),
              updatedAt: new Date(),
              productId: "prod1",
              size: "M" as any,
              patch: "NO_PATCH" as any,
              sellPrice: 19.90,
              costPrice: 10.00,
              stockQty: 50,
            }
          }
        ],
        payments: [
          {
            id: "pay1",
            createdAt: new Date(),
            updatedAt: new Date(),
            orderId: params.id,
            paymentMethod: "CREDIT_CARD",
            paymentStatus: "SUCCESS" as any,
            transactionId: "MC_083E",
            paymentGateway: "Mastercard",
            amountPaid: 19.90,
            currencyPaid: EnumCurrency.EUR,
          }
        ]
      }
      setOrder(mockOrder)
      setLoading(false)
    }, 500)
  }, [params.id])

  const getStatusBadge = (status: EnumOrderStatus) => {
    const config: Record<EnumOrderStatus, { variant: "default" | "secondary" | "destructive" | "outline", label: string, color: string }> = {
      RECEIVED: { variant: "secondary", label: "Unfulfilled", color: "bg-yellow-100 text-yellow-800" },
      PARTIALLY_FULFILLED: { variant: "secondary", label: "Partially Fulfilled", color: "bg-blue-100 text-blue-800" },
      FULFILLED: { variant: "default", label: "Fulfilled", color: "bg-green-100 text-green-800" },
      CANCELLED: { variant: "destructive", label: "Cancelled", color: "bg-red-100 text-red-800" },
      FULLY_REFUNDED: { variant: "outline", label: "Refunded", color: "bg-gray-100 text-gray-800" },
    }
    return config[status]
  }

  const getRiskBadge = (risk: EnumRiskChargeback) => {
    const config: Record<EnumRiskChargeback, { label: string, color: string }> = {
      EXTREMELY_SAFE: { label: "Low", color: "text-green-600" },
      SAFE: { label: "Low", color: "text-green-600" },
      MEDIUM: { label: "Medium", color: "text-yellow-600" },
      UNSAFE: { label: "High", color: "text-red-600" },
      EXTREMELY_UNSAFE: { label: "High", color: "text-red-600" },
    }
    return config[risk]
  }

  const handleStatusChange = (newStatus: EnumOrderStatus) => {
    if (order) {
      setOrder({ ...order, orderStatus: newStatus })
      toast.success("Order status updated successfully")
    }
  }

  const handleAddComment = () => {
    if (comment.trim()) {
      toast.success("Comment added to timeline")
      setComment("")
    }
  }

  if (loading || !order) {
    return <div className="flex-1 p-8">Loading...</div>
  }

  const statusConfig = getStatusBadge(order.orderStatus)
  const riskConfig = getRiskBadge(order.riskChargeback)

  return (
    <div className="flex-1 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{order.orderID}</h2>
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            <Badge variant="outline">Paid</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")} from Online Store
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                More actions
                <MoreHorizontal className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Refund</DropdownMenuItem>
              <DropdownMenuItem>Cancel order</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fulfillment Status */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <CardTitle className="text-base">{statusConfig.label}</CardTitle>
                </div>
                <Button variant="outline" size="sm">
                  Mark as fulfilled
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.orderItems?.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">2004 Portugal 2a Equipacion</p>
                          <p className="text-sm text-muted-foreground">S / Sin parche</p>
                          {item.customisationString && (
                            <p className="text-sm text-muted-foreground">
                              ✓ {item.customisationString}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          €{item.productVariant?.sellPrice.toFixed(2)} × {item.quantity}
                        </p>
                        <p className="text-sm font-semibold">
                          €{((item.productVariant?.sellPrice || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {index < (order.orderItems?.length || 0) - 1 && (
                      <Separator className="mt-3" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle className="text-base">Paid</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>1 item</span>
                  <span>€{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Estándar (0.0 kg: Item 0.0 kg, Package 0.0 kg)</span>
                  <span>€0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>€{order.payableAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Paid</span>
                  <span>€{order.payableAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Comment Input */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                    AS
                  </div>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Leave a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex gap-2 text-muted-foreground">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button size="sm" onClick={handleAddComment}>
                        Post
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Only you and other staff can see comments
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Timeline Events */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold">Today</div>
                  
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-foreground mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">
                        Order confirmation email was sent to {order.shippingName} ({order.shippingEmail})
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(order.createdAt), "h:mm a")}
                      </p>
                      <Button variant="link" className="h-auto p-0 text-sm" onClick={() => toast.info("Email preview")}>
                        View email
                      </Button>
                    </div>
                  </div>

                  {order.payments && order.payments.length > 0 && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-foreground mt-2" />
                      <div className="flex-1">
                        <p className="text-sm">
                          €{order.payments[0].amountPaid.toFixed(2)} EUR will be added to your Nov 14, 2025 payout
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(order.createdAt), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.payments && order.payments.length > 0 && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-foreground mt-2" />
                      <div className="flex-1">
                        <p className="text-sm">
                          A €{order.payments[0].amountPaid.toFixed(2)} EUR payment was processed using a {order.payments[0].paymentGateway} ending in {order.payments[0].transactionId}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(order.payments[0].createdAt), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-foreground mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">
                        Confirmation #{order.orderID.split('@')[1]} was generated for this order
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(order.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Notes</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {order.notes || "No notes from customer"}
              </p>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Customer</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-blue-600 cursor-pointer hover:underline">
                  {order.shippingName}
                </p>
                <p className="text-sm text-muted-foreground">1 order</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Contact information</p>
                <div className="space-y-1">
                  <p className="text-sm text-blue-600 cursor-pointer hover:underline">
                    {order.shippingEmail}
                  </p>
                  {order.shippingPhone && (
                    <p className="text-sm">{order.shippingPhone}</p>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Shipping address</p>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p>{order.shippingName}</p>
                  <p>{order.shippingLine1}</p>
                  {order.shippingLine2 && <p>{order.shippingLine2}</p>}
                  <p>
                    {order.shippingPostalCode} {order.shippingCity}
                  </p>
                  <p>{order.shippingCountry}</p>
                  <p>{order.shippingPhone}</p>
                </div>
                <Button variant="link" className="h-auto p-0 text-sm mt-2">
                  View map
                </Button>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Billing address</p>
                <p className="text-sm text-muted-foreground">Same as shipping address</p>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Conversion summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>This is their 1st order</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>1st session from an unknown source</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>1 session over 1 day</span>
              </div>
              <Button variant="link" className="h-auto p-0 text-sm">
                View conversion details
              </Button>
            </CardContent>
          </Card>

          {/* Order Risk */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Order risk</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      order.riskChargeback === EnumRiskChargeback.EXTREMELY_SAFE || order.riskChargeback === EnumRiskChargeback.SAFE
                        ? "bg-green-500 w-1/4"
                        : order.riskChargeback === EnumRiskChargeback.MEDIUM
                        ? "bg-yellow-500 w-1/2"
                        : "bg-red-500 w-3/4"
                    }`}
                  />
                </div>
                <span className={`text-sm font-medium ${riskConfig.color}`}>
                  {riskConfig.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Chargeback risk is low. You can fulfill this order.
              </p>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Tags</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No tags</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
