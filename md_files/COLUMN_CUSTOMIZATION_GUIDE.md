# Column Customization Guide

## Overview
All tables in the application now support column customization, allowing users to show/hide columns based on their preferences.

## How to Use

### For End Users

1. **Access Column Settings**
   - Look for the "Columns" button with a settings icon (⚙️) in the top-right of any table
   - Click the button to open the column visibility dropdown

2. **Toggle Column Visibility**
   - Check/uncheck columns to show/hide them
   - Changes apply immediately
   - State persists during the session

3. **Available in All Tables**
   - ✅ Products (`/dashboard/products`)
   - ✅ Orders (`/dashboard/orders`)
   - ✅ Customers (`/dashboard/customers`)
   - ✅ Discounts (`/dashboard/discounts`)
   - ✅ Shipments (`/dashboard/shipments`)

### For Developers

#### Using the DataTable Component

```tsx
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

// Define columns
const columns: ColumnDef<YourType>[] = [
  {
    accessorKey: "id",
    header: "ID",
    // This column can be hidden
  },
  {
    accessorKey: "name",
    header: "Name",
    enableHiding: false, // This column cannot be hidden
  },
  {
    accessorKey: "email",
    header: "Email",
  },
]

// Use in component
<DataTable
  columns={columns}
  data={data}
  searchKey="name" // Optional: enables search on this column
  searchPlaceholder="Search by name..." // Optional
/>
```

#### Column Definition Options

```tsx
{
  accessorKey: "fieldName",
  header: "Display Name",
  
  // Visibility
  enableHiding: true, // Default: true (can be hidden)
  
  // Sorting
  enableSorting: true, // Default: true
  
  // Custom cell rendering
  cell: ({ row }) => {
    return <CustomComponent value={row.getValue("fieldName")} />
  },
  
  // Custom header rendering
  header: ({ column }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Display Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )
  },
}
```

#### Advanced Features

**1. Row Selection**
```tsx
const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // ... other columns
]
```

**2. Actions Column**
```tsx
{
  id: "actions",
  header: "Actions",
  cell: ({ row }) => {
    const item = row.original
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleEdit(item)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDelete(item)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
  enableHiding: false,
}
```

**3. Custom Sorting**
```tsx
{
  accessorKey: "status",
  header: "Status",
  sortingFn: (rowA, rowB) => {
    const statusOrder = { ACTIVE: 1, PENDING: 2, INACTIVE: 3 }
    return statusOrder[rowA.original.status] - statusOrder[rowB.original.status]
  },
}
```

**4. Filtering**
```tsx
{
  accessorKey: "category",
  header: "Category",
  filterFn: (row, id, value) => {
    return value.includes(row.getValue(id))
  },
}
```

## Features Included

### Built-in Features
- ✅ **Column Visibility Toggle** - Show/hide any column
- ✅ **Sorting** - Click headers to sort (asc/desc)
- ✅ **Filtering** - Search within specific columns
- ✅ **Pagination** - Navigate through pages
- ✅ **Row Selection** - Select single or multiple rows
- ✅ **Responsive** - Works on all screen sizes

### DataTable Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `columns` | `ColumnDef[]` | Yes | Column definitions |
| `data` | `TData[]` | Yes | Array of data to display |
| `searchKey` | `string` | No | Column key to enable search on |
| `searchPlaceholder` | `string` | No | Placeholder for search input |

## Examples

### Basic Table
```tsx
const columns: ColumnDef<Product>[] = [
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "price", header: "Price" },
]

<DataTable columns={columns} data={products} />
```

### Table with Search
```tsx
<DataTable
  columns={columns}
  data={products}
  searchKey="name"
  searchPlaceholder="Search products..."
/>
```

### Table with Custom Cells
```tsx
const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status")
      return <Badge variant={getVariant(status)}>{status}</Badge>
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      return <div className="font-medium">£{price.toFixed(2)}</div>
    },
  },
]
```

## Migration Guide

### Converting Existing Tables

**Before:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**After:**
```tsx
const columns: ColumnDef<typeof data[0]>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
]

<DataTable columns={columns} data={data} />
```

## Best Practices

1. **Always provide meaningful header names**
   ```tsx
   { accessorKey: "createdAt", header: "Created Date" } // Good
   { accessorKey: "createdAt", header: "createdAt" }    // Bad
   ```

2. **Disable hiding for critical columns**
   ```tsx
   { accessorKey: "id", header: "ID", enableHiding: false }
   ```

3. **Use custom cell rendering for complex data**
   ```tsx
   {
     accessorKey: "user",
     header: "User",
     cell: ({ row }) => {
       const user = row.getValue("user")
       return <div>{user.firstName} {user.lastName}</div>
     }
   }
   ```

4. **Provide search on the most commonly filtered column**
   ```tsx
   <DataTable searchKey="name" /> // Most users search by name
   ```

## Troubleshooting

### Column not showing in visibility menu
- Check if `enableHiding: false` is set
- Verify the column has an `id` or `accessorKey`

### Search not working
- Ensure `searchKey` matches a column's `accessorKey`
- Check that the column exists in your data

### Sorting not working
- Verify data types are consistent
- Use custom `sortingFn` for complex types

### Performance issues with large datasets
- Implement server-side pagination
- Use virtualization for very large lists
- Consider lazy loading

## Future Enhancements

Potential additions:
- [ ] Persist column visibility to localStorage
- [ ] Column reordering (drag & drop)
- [ ] Column resizing
- [ ] Export visible columns to CSV
- [ ] Saved view presets
- [ ] Advanced filtering UI
- [ ] Column grouping
- [ ] Sticky headers
