# Next Implementation Steps

## ✅ COMPLETED IN THIS SESSION

### 1. Orders Table Enhancements
- ✅ Status cards (5 cards)
- ✅ Date filters (Today, Yesterday, Last 7/30 days)
- ✅ CSV download functionality
- ✅ Sorting on all columns with indicators
- ✅ Column visibility toggle
- ✅ Date & Time column
- ✅ Status change confirmation

### 2. Order Detail Page
- ✅ Tracking links with external URLs
- ✅ Added EnumNoStockStatus to types
- ✅ Added noStockStatus field to OrderItem interface
- ✅ Fixed mock data to include noStockStatus

---

## 🚧 IN PROGRESS - Order Items Management

### Current State
- Order items are displayed at lines 327-360 in `/orders/[id]/page.tsx`
- Each item shows: image placeholder, product name, size/patch, customisation, price, quantity

### What Needs to be Added

#### 1. **No Stock Status Dropdown** (Per Item)

Add a Select dropdown for each order item:

```tsx
<Select
  value={item.noStockStatus}
  onValueChange={(value) => handleNoStockChange(item.id, value as EnumNoStockStatus)}
>
  <SelectTrigger className="w-[180px]">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="NONE">None</SelectItem>
    <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
  </SelectContent>
</Select>
```

**Location**: Add below the customisation string, before the price

**Handler Function**:
```tsx
const handleNoStockChange = (itemId: string, status: EnumNoStockStatus) => {
  if (!order) return;
  
  const updatedItems = order.orderItems?.map(item =>
    item.id === itemId ? { ...item, noStockStatus: status } : item
  );
  
  setOrder({ ...order, orderItems: updatedItems });
  toast.success("Stock status updated");
};
```

#### 2. **Add Item Button**

Add a button at the bottom of the order items list:

```tsx
<Button
  variant="outline"
  size="sm"
  onClick={() => setShowAddItemDialog(true)}
  className="w-full"
>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>
```

**Dialog for Adding Item**:
- Product variant selector (dropdown)
- Quantity input
- Customisation string (optional)
- No stock status selector
- Add button

#### 3. **Remove Item Button** (Mark as Cancelled)

Add a remove button for each item:

```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={() => handleRemoveItem(item.id)}
  title="Remove item"
>
  <Trash2 className="h-4 w-4" />
</Button>
```

**Handler Function**:
```tsx
const handleRemoveItem = (itemId: string) => {
  if (!order) return;
  
  // Mark as cancelled by setting noStockStatus to a cancelled state
  // Or filter out the item
  const updatedItems = order.orderItems?.filter(item => item.id !== itemId);
  
  setOrder({ ...order, orderItems: updatedItems });
  toast.success("Item removed from order");
  
  // Recalculate totals
  recalculateOrderTotals();
};
```

#### 4. **Recalculate Totals**

When items are added/removed, recalculate:
- Subtotal
- Total amount
- Payable amount

```tsx
const recalculateOrderTotals = () => {
  if (!order || !order.orderItems) return;
  
  const subtotal = order.orderItems.reduce((sum, item) => {
    const itemPrice = (item.productVariant?.sellPrice || 0) * item.quantity;
    const customPrice = item.customisationPrice || 0;
    return sum + itemPrice + customPrice;
  }, 0);
  
  setOrder({
    ...order,
    totalAmount: subtotal,
    payableAmount: subtotal - order.discountAmount,
  });
};
```

---

## 📋 REMAINING HIGH-PRIORITY FEATURES

### 1. Product Duplication
**File**: `/dashboard/products/page.tsx`
**What**: Add duplicate button for single/multi-select products
**Complexity**: Medium

### 2. Team/League Auto-Assignment
**Files**: 
- `/dashboard/products/page.tsx` (add/edit product)
- Create `TEAM_LEAGUE_MAP` constant
**What**: When team is selected, auto-fill league field
**Complexity**: Low

### 3. Discount Type Improvements
**File**: `/dashboard/discounts/page.tsx`
**What**: Show only relevant fields based on discount type
- Percentage: `discountPercentage`, `maxDiscountAmount`
- Fixed Amount: `discountAmount`
- X for Y: `offerBuyQty`, `offerFreeQty`
**Complexity**: Medium

### 4. Dashboard Date Range
**File**: `/dashboard/page.tsx`
**What**: Replace single date picker with date range
**Complexity**: Low

### 5. 14-Day Sales Graph
**File**: `/dashboard/page.tsx`
**What**: Add line chart showing last 14 days with 30-day comparison
**Complexity**: Medium

### 6. Product Default Sorting
**File**: `/dashboard/products/page.tsx`
**What**: Sort by `createdAt DESC` by default
**Complexity**: Very Low

### 7. Address Validation
**Files**: 
- `/dashboard/orders/[id]/page.tsx`
- Create validation API route
**What**: Validate shipping address format and deliverability
**Complexity**: High (requires external API)

### 8. Image Upload Flow
**Files**:
- `/dashboard/products/page.tsx`
- Create image upload component
**What**: Upload to Cloudflare with `SKU_position` naming
**Complexity**: High

### 9. Variant Editing
**File**: `/dashboard/products/page.tsx`
**What**: Inline editing of product variants (size, patch, price, stock)
**Complexity**: Medium

---

## 🎯 RECOMMENDED IMPLEMENTATION ORDER

### **Immediate (Next 30 minutes)**
1. ✅ Complete Order Items Management
   - Add noStockStatus dropdown
   - Add/Remove item buttons
   - Recalculate totals

### **Short Term (Next hour)**
2. Product Default Sorting (5 min)
3. Team/League Auto-Assignment (15 min)
4. Discount Type Improvements (20 min)
5. Dashboard Date Range (20 min)

### **Medium Term (Next 2 hours)**
6. Product Duplication (30 min)
7. 14-Day Sales Graph (45 min)
8. Variant Editing (45 min)

### **Long Term (Future sessions)**
9. Address Validation (requires API setup)
10. Image Upload Flow (requires Cloudflare setup)

---

## 🔧 TECHNICAL NOTES

### State Management for Order Items
```tsx
const [order, setOrder] = useState<Order | null>(null);
const [showAddItemDialog, setShowAddItemDialog] = useState(false);

// Update specific item
const updateOrderItem = (itemId: string, updates: Partial<OrderItem>) => {
  if (!order) return;
  
  const updatedItems = order.orderItems?.map(item =>
    item.id === itemId ? { ...item, ...updates } : item
  );
  
  setOrder({ ...order, orderItems: updatedItems });
};
```

### Team-League Mapping
```tsx
const TEAM_LEAGUE_MAP: Record<string, EnumLeague> = {
  // Premier League
  "Manchester United": EnumLeague.PREMIER_LEAGUE,
  "Liverpool": EnumLeague.PREMIER_LEAGUE,
  "Chelsea": EnumLeague.PREMIER_LEAGUE,
  "Arsenal": EnumLeague.PREMIER_LEAGUE,
  "Manchester City": EnumLeague.PREMIER_LEAGUE,
  
  // La Liga
  "Real Madrid": EnumLeague.LA_LIGA,
  "Barcelona": EnumLeague.LA_LIGA,
  "Atletico Madrid": EnumLeague.LA_LIGA,
  
  // Serie A
  "Juventus": EnumLeague.SERIE_A,
  "AC Milan": EnumLeague.SERIE_A,
  "Inter Milan": EnumLeague.SERIE_A,
  
  // Bundesliga
  "Bayern Munich": EnumLeague.BUNDESLIGA,
  "Borussia Dortmund": EnumLeague.BUNDESLIGA,
  
  // Ligue 1
  "PSG": EnumLeague.LIGUE_1,
  
  // Add more...
};

// Usage
const handleTeamChange = (team: string) => {
  setSelectedTeam(team);
  const league = TEAM_LEAGUE_MAP[team];
  if (league) {
    setSelectedLeague(league);
  }
};
```

---

## 📊 PROGRESS TRACKING

### Overall: 50% Complete

**Completed**: 12/24 features
- ✅ Orders status cards
- ✅ Orders date filters
- ✅ Orders download
- ✅ Orders sorting
- ✅ Column visibility
- ✅ Date/Time column
- ✅ Status confirmation
- ✅ Tracking links
- ✅ Inventory removal
- ✅ Types updated
- ✅ Analytics page
- ✅ Reports page

**In Progress**: 1/24 features
- 🚧 Order items management

**Pending**: 11/24 features
- Product sorting
- Team/League mapping
- Discount improvements
- Dashboard date range
- 14-day graph
- Product duplication
- Variant editing
- Address validation
- Image upload
- Returns integration
- Advanced filtering

---

## ✅ QUALITY CHECKLIST

- [x] TypeScript compiles
- [x] No console errors
- [x] All imports correct
- [x] Types match schema
- [x] Mock data includes all fields
- [ ] Order items management complete
- [ ] Totals recalculate correctly
- [ ] UI is responsive
- [ ] Toast notifications work

---

**Ready to continue implementation!** 🚀
