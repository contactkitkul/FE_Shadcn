# Dashboard Stats Audit & Fix Plan

## Issues Found

### ❌ CRITICAL: Wrong Currency Usage

**Transactions Page** (`transactions/page.tsx:122-127`)

- **WRONG**: Uses `p.order?.totalAmount` (EUR item prices)
- **CORRECT**: Should use `p.amountPaid` with `p.currencyPaid` (actual payment currency)
- **Impact**: Revenue calculations are incorrect

**Dashboard Page** (`page.tsx:218`)

- **WRONG**: Uses `€` hardcoded and `stats?.totalRevenue`
- **CORRECT**: Should group by currency like Orders page does
- **Impact**: Multi-currency revenue not properly displayed

**Analytics Page** (`analytics/page.tsx:228`)

- **WRONG**: Uses `€` hardcoded
- **CORRECT**: Should group by currency
- **Impact**: Multi-currency revenue not properly displayed

### ⚠️ Hardcoded/Estimated Values

**Customers Page** (`customers/page.tsx:105`)

- `subLabel: "+15% from last month"` - **HARDCODED**
- Already commented out: Active Customers (70% estimate), New This Month (20% estimate)

**Analytics Page** (`analytics/page.tsx:132-146`)

- `salesByLeague` - **HARDCODED** fallback data
- `salesByType` - **HARDCODED** fallback data
- `revenue: p.orderCount * 50` (line 162) - **ESTIMATED**
- `new: 0` (line 168) - **TODO**
- `lowStock: 0, outOfStock: 0, totalValue: 0` (lines 177-179) - **TODO**

### ✅ Already Correct (Using Real API Data)

**Orders Page** (`orders/page.tsx:135-199`)

- ✅ All stats calculated from real `orders` data
- ✅ Revenue correctly uses `payableAmount` + `currencyPayment` grouped by currency

**Abandoned Carts Page** (`abandoned-carts/page.tsx:113-150`)

- ✅ All stats calculated from real `carts` data
- ✅ Total Value, Recovery Rate all dynamic

**Activity Page** (`activity/page.tsx`)

- ✅ Stats commented out per user request

**Products/Discounts Pages**

- ✅ No stats displayed, just data tables

---

## Fixes Required

### 1. **Transactions Page** - Fix Currency Usage

Replace `order?.totalAmount` with `amountPaid` and group by currency like Orders page.

### 2. **Dashboard Page** - Fix Revenue Display

Replace hardcoded `€` with multi-currency display grouped by `currencyPayment`.

### 3. **Analytics Page** - Fix Revenue Display

Same as Dashboard - group by currency instead of hardcoded `€`.

### 4. **Customers Page** - Remove Hardcoded Sublabel

Change `"+15% from last month"` to something generic or remove.

### 5. **Analytics Page** - Comment Out Hardcoded Fallbacks

Comment out or clearly mark `salesByLeague`, `salesByType` as demo data until API supports it.

---
