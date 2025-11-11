# Sortable Tables Implementation Guide

## Overview
This guide shows how to add sortable columns with `createdAt` date to all tables using the DataTable component.

## Requirements
- ✅ Add `createdAt` column (labeled as "Date")
- ✅ Show date & time value
- ✅ Make tables sortable by various fields
- ✅ Keep column customization functionality

## Implementation Steps

### 1. Update Type Definitions

Add `createdAt` to your data types if not already present:

```typescript
interface YourDataType {
  id: string
  createdAt: Date  // Add this
  // ... other fields
}
```

### 2. Define Sortable Columns

Use `@tanstack/react-table` column definitions with sorting:

```typescript
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

const columns: ColumnDef<YourDataType>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return (
        <div>
          <div>{format(new Date(date), "MMM dd, yyyy")}</div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(date), "h:mm a")}
          </div>
        </div>
      )
    },
    sortingFn: "datetime",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  // ... more columns
]
```

### 3. Use DataTable Component

```typescript
<DataTable
  columns={columns}
  data={data}
  searchKey="name"
  searchPlaceholder="Search..."
/>
```

## Example: Orders Table with Sorting

```typescript
"use client"

import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { Order, EnumOrderStatus } from "@/types"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderID",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Order ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date
        return (
          <div>
            <div className="font-medium">{format(new Date(date), "MMM dd, yyyy")}</div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(date), "h:mm a")}
            </div>
          </div>
        )
      },
      sortingFn: "datetime",
    },
    {
      accessorKey: "shippingName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "payableAmount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("payableAmount"))
        return <div className="font-medium">€{amount.toFixed(2)}</div>
      },
    },
    {
      accessorKey: "orderStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("orderStatus") as EnumOrderStatus
        return <Badge>{status}</Badge>
      },
    },
  ]

  useEffect(() => {
    // Fetch data
    // api.orders.getAll().then(setOrders)
  }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
      
      <DataTable
        columns={columns}
        data={orders}
        searchKey="orderID"
        searchPlaceholder="Search orders..."
      />
    </div>
  )
}
```

## Tables to Update

### 1. Products Table
**Columns to make sortable:**
- SKU
- Name
- Date (createdAt)
- Status
- Price

### 2. Orders Table
**Columns to make sortable:**
- Order ID
- Date (createdAt)
- Customer
- Amount
- Status

### 3. Customers Table
**Columns to make sortable:**
- Name
- Date (createdAt) - when customer was added
- Orders (count)
- Total Spent
- Last Order

### 4. Discounts Table
**Columns to make sortable:**
- Code
- Date (createdAt)
- Type
- Status
- Usage / Limit

### 5. Shipments Table
**Columns to make sortable:**
- Tracking Number
- Date (createdAt)
- Provider
- Status
- Order ID

### 6. Payments Table
**Columns to make sortable:**
- Transaction ID
- Date (createdAt)
- Customer
- Amount
- Status

## Date Formatting Standards

Use consistent date formatting across all tables:

```typescript
// Date column
{
  accessorKey: "createdAt",
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Date
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
  cell: ({ row }) => {
    const date = row.getValue("createdAt") as Date
    return (
      <div>
        <div className="font-medium">
          {format(new Date(date), "MMM dd, yyyy")}
        </div>
        <div className="text-xs text-muted-foreground">
          {format(new Date(date), "h:mm a")}
        </div>
      </div>
    )
  },
  sortingFn: "datetime",
}
```

## Sorting Features

### Default Sort
Set initial sort state:

```typescript
const [sorting, setSorting] = useState<SortingState>([
  {
    id: "createdAt",
    desc: true, // Most recent first
  },
])
```

### Custom Sorting Functions

For complex sorting:

```typescript
{
  accessorKey: "status",
  header: "Status",
  sortingFn: (rowA, rowB) => {
    const statusOrder = { 
      ACTIVE: 1, 
      PENDING: 2, 
      INACTIVE: 3 
    }
    return statusOrder[rowA.original.status] - statusOrder[rowB.original.status]
  },
}
```

## Column Visibility

The DataTable component already supports column visibility:
- Click "Columns" button
- Check/uncheck columns
- State persists during session

## Benefits

✅ **User Experience:**
- Sort by any column
- Quick data analysis
- Find records easily

✅ **Consistency:**
- Same date format everywhere
- Same sorting behavior
- Same UI patterns

✅ **Functionality:**
- Column customization maintained
- Search still works
- Pagination still works

## Migration Checklist

For each table:
- [ ] Add `createdAt` to data type
- [ ] Define sortable columns with `ColumnDef`
- [ ] Add sort buttons to headers
- [ ] Format date column properly
- [ ] Test sorting on all columns
- [ ] Verify column visibility still works
- [ ] Check search functionality
- [ ] Test pagination

## Next Steps

1. Update Products table first (as example)
2. Apply same pattern to Orders table
3. Update remaining tables (Customers, Discounts, Shipments, Payments)
4. Test all sorting functionality
5. Verify column customization still works
6. Document any edge cases
