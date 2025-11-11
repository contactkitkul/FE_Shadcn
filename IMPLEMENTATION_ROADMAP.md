# Implementation Roadmap - Comprehensive Feature List

## 🎯 Priority 1: Orders Page Enhancements (CRITICAL)

### 1.1 Orders List Page
- [ ] **Status Cards Header** - Like dashboard, show: Total Orders, Received, Fulfilled, Cancelled
- [ ] **Date Filters** - Quick filters: Today, Yesterday, Last 7 days, Last 30 days, Custom range
- [ ] **Download Functionality** - Export filtered orders to CSV/Excel
- [ ] **Sorting on All Columns** - Enable sorting by: Order ID, Customer, Amount, Status, Date
- [ ] **Date/Time Column** - Add createdAt column with full timestamp
- [ ] **Column Visibility Toggle** - Show/hide columns (inspired by shadcn table)
- [ ] **Status Change Confirmation** - ✅ DONE (AlertDialog added)

### 1.2 Order Detail Page (`/orders/[id]`)
- [ ] **Add Order Item** - Button to add new items to existing order
- [ ] **Remove Order Item** - Mark item as CANCELLED (not delete)
- [ ] **No Stock Status** - Dropdown per item to mark as: NONE, OUT_OF_STOCK, BACK_ORDERED
- [ ] **Tracking Links** - Clickable tracking IDs that open provider tracking page
- [ ] **Revenue Calculations** - Exclude cancelled items from totals
- [ ] **Address Validation** - Validate shipping address (API integration needed)

---

## 🎯 Priority 2: Dashboard Enhancements

### 2.1 Date Range Selector
- [ ] **Replace Single Date** - Use date range picker (from/to dates)
- [ ] **Apply to All Metrics** - Filter all dashboard data by selected range

### 2.2 Returns Integration
- [ ] **Returns Card** - Show total returns count and amount
- [ ] **Add to Dashboard** - Display alongside other metrics

### 2.3 Sales Graph
- [ ] **14-Day Trend** - Show sales, orders, products sold for last 14 days
- [ ] **30-Day Comparison** - Compare with previous 30 days
- [ ] **Multiple Lines** - Revenue, Orders, Units on same graph

---

## 🎯 Priority 3: Products Management

### 3.1 Product List
- [ ] **Default Sort** - Newest to oldest (by createdAt DESC)
- [ ] **Duplicate Product** - Single or multi-select duplication
- [ ] **Column Visibility** - Show/hide columns

### 3.2 Add/Edit Product
- [ ] **Team Enum** - Dropdown with all teams
- [ ] **Auto League Assignment** - Select team → auto-fill league
- [ ] **Variant Management** - Add/edit/delete variants inline
- [ ] **Image Upload** - Upload to Cloudflare with SKU_position naming
- [ ] **SEO Preview** - Show Google search result preview
  - URL slug
  - Meta title
  - Price display
  - Availability

### 3.3 Product Variants
- [ ] **Inline Editing** - Edit size, patch, prices, stock directly
- [ ] **Default Variants** - Auto-create common sizes on product creation
- [ ] **Stock Management** - Update stockQty per variant

---

## 🎯 Priority 4: Discounts Improvements

### 4.1 Discount Type Selection
- [ ] **Type Selector** - Radio buttons: Percentage, Fixed Amount, X for Y
- [ ] **Conditional Fields** - Show only relevant fields based on type:
  - **Percentage**: `discountPercentage`, `maxDiscountAmount`
  - **Fixed Amount**: `discountAmount`
  - **X for Y**: `offerBuyQty`, `offerFreeQty`
- [ ] **Validation** - Ensure only one type is filled

---

## 🎯 Priority 5: Table Enhancements (ALL TABLES)

### 5.1 Column Visibility
- [ ] **Show/Hide Columns** - Dropdown to toggle columns
- [ ] **Save Preferences** - Remember user's column selection (localStorage)
- [ ] **Reset to Default** - Button to restore all columns

### 5.2 Sorting
- [ ] **All Columns Sortable** - Click header to sort
- [ ] **Sort Indicator** - Arrow showing sort direction
- [ ] **Multi-column Sort** - Hold Shift for secondary sort

### 5.3 Filtering
- [ ] **Column Filters** - Filter per column
- [ ] **Date Range Filters** - For date columns
- [ ] **Status Filters** - For enum columns

---

## 🎯 Priority 6: Address Validation

### 6.1 Validation Logic
- [ ] **Required Fields Check** - Ensure all fields filled
- [ ] **Format Validation** - Postal code format per country
- [ ] **API Integration** - Use address validation API (e.g., Google Maps, Loqate)
- [ ] **Deliverability Score** - Flag undeliverable addresses
- [ ] **Manual Override** - Allow admin to mark as verified

### 6.2 UI Indicators
- [ ] **Validation Status Badge** - Show: Verified, Pending, Failed
- [ ] **Warning Messages** - Show validation errors
- [ ] **Verify Button** - Manual trigger for validation

---

## 🎯 Priority 7: Tracking Integration

### 7.1 Tracking Links
- [ ] **Provider URLs** - Map provider to tracking URL template
  - DHL: `https://www.dhl.com/track?tracking-id={trackingNumber}`
  - FedEx: `https://www.fedex.com/fedextrack/?trknbr={trackingNumber}`
  - UPS: `https://www.ups.com/track?tracknum={trackingNumber}`
  - Royal Mail: `https://www.royalmail.com/track-your-item#/tracking-results/{trackingNumber}`
  - USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels={trackingNumber}`

### 7.2 UI Implementation
- [ ] **Clickable Tracking IDs** - Link button next to each tracking number
- [ ] **External Link Icon** - Visual indicator
- [ ] **Open in New Tab** - Don't navigate away from order page

---

## 🎯 Priority 8: Image Management

### 8.1 Upload Flow
- [ ] **Cloudflare Integration** - Upload to Cloudflare Images
- [ ] **Naming Convention** - `{SKU}_{position}.jpg`
- [ ] **Position Management** - Drag-and-drop to reorder
- [ ] **Preview** - Show thumbnails
- [ ] **Delete** - Remove images

### 8.2 UI Components
- [ ] **Upload Button** - In product form
- [ ] **Image Grid** - Show all product images
- [ ] **Primary Image** - Mark one as primary (position 1)

---

## 🎯 Priority 9: SEO Features

### 9.1 Google Preview
- [ ] **Preview Component** - Show how product appears in search
- [ ] **URL Display** - `yoursite.com/products/{slug}`
- [ ] **Title Tag** - Product name + brand
- [ ] **Price Display** - With currency
- [ ] **Availability** - In Stock / Out of Stock
- [ ] **Rating Stars** - If reviews exist

### 9.2 Meta Fields
- [ ] **Meta Title** - Editable field
- [ ] **Meta Description** - Editable textarea
- [ ] **URL Slug** - Auto-generated from product name
- [ ] **OG Image** - Use primary product image

---

## 🔧 Technical Implementation Details

### Team → League Mapping
```typescript
const TEAM_LEAGUE_MAP: Record<string, string> = {
  // Premier League
  "Manchester United": "PREMIER_LEAGUE",
  "Liverpool": "PREMIER_LEAGUE",
  "Chelsea": "PREMIER_LEAGUE",
  "Arsenal": "PREMIER_LEAGUE",
  "Manchester City": "PREMIER_LEAGUE",
  "Tottenham": "PREMIER_LEAGUE",
  
  // La Liga
  "Real Madrid": "LA_LIGA",
  "Barcelona": "LA_LIGA",
  "Atletico Madrid": "LA_LIGA",
  
  // Serie A
  "Juventus": "SERIE_A",
  "AC Milan": "SERIE_A",
  "Inter Milan": "SERIE_A",
  
  // Bundesliga
  "Bayern Munich": "BUNDESLIGA",
  "Borussia Dortmund": "BUNDESLIGA",
  
  // Ligue 1
  "PSG": "LIGUE_1",
  
  // Add more teams...
};
```

### Column Visibility Implementation
```typescript
interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  sortable: boolean;
}

const [columns, setColumns] = useState<ColumnConfig[]>([
  { id: "orderID", label: "Order ID", visible: true, sortable: true },
  { id: "customer", label: "Customer", visible: true, sortable: true },
  { id: "amount", label: "Amount", visible: true, sortable: true },
  { id: "status", label: "Status", visible: true, sortable: false },
  { id: "createdAt", label: "Date", visible: true, sortable: true },
]);
```

### Address Validation API
```typescript
async function validateAddress(address: ShippingAddress): Promise<ValidationResult> {
  // Option 1: Google Maps Geocoding API
  // Option 2: Loqate Address Verification
  // Option 3: Custom validation rules
  
  const response = await fetch('/api/validate-address', {
    method: 'POST',
    body: JSON.stringify(address),
  });
  
  return response.json();
}
```

---

## 📊 Implementation Priority Order

### Week 1: Critical Features
1. ✅ Status change confirmation (DONE)
2. Orders page status cards
3. Date filters (today/yesterday)
4. Download orders functionality
5. Add/Remove order items
6. No stock status per item

### Week 2: Table Enhancements
7. Column visibility toggle
8. Sorting on all columns
9. Date/Time column
10. Tracking links

### Week 3: Products & Discounts
11. Team enum with auto league
12. Product duplication
13. Discount type improvements
14. Default product sorting

### Week 4: Advanced Features
15. Dashboard date range
16. 14-day sales graph
17. Address validation
18. Image upload flow
19. SEO preview
20. Variant editing

---

## 🎨 UI/UX Patterns

### Status Cards (Orders Page Header)
```tsx
<div className="grid gap-4 md:grid-cols-4">
  <Card>
    <CardHeader>
      <CardTitle>Total Orders</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{totalOrders}</div>
    </CardContent>
  </Card>
  {/* More cards... */}
</div>
```

### Date Filter Buttons
```tsx
<div className="flex gap-2">
  <Button variant={filter === 'today' ? 'default' : 'outline'} 
          onClick={() => setFilter('today')}>
    Today
  </Button>
  <Button variant={filter === 'yesterday' ? 'default' : 'outline'}
          onClick={() => setFilter('yesterday')}>
    Yesterday
  </Button>
  {/* More filters... */}
</div>
```

### Column Visibility Dropdown
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      <Settings className="mr-2 h-4 w-4" />
      Columns
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {columns.map(col => (
      <DropdownMenuCheckboxItem
        key={col.id}
        checked={col.visible}
        onCheckedChange={() => toggleColumn(col.id)}
      >
        {col.label}
      </DropdownMenuCheckboxItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

---

## ✅ Completed Features
- [x] Analytics page
- [x] Reports page
- [x] Refunds page
- [x] Abandoned carts page
- [x] Activity logs page
- [x] Settings page
- [x] Status change confirmation

## 🚀 Ready to Implement
All features documented and ready for implementation!
