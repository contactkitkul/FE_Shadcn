# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites

- Node.js 18+ installed
- BE_Internal backend running on port 3000
- Cloudflare Images configured in backend

### Step 1: Install Dependencies

```bash
cd FE_Shadcn
npm install
```

### Step 2: Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Step 3: Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

## 🎯 Quick Feature Tour

### 1. Column Customization (Every Table)

1. Go to any table page (Products, Orders, etc.)
2. Look for **"Columns"** button with ⚙️ icon (top-right)
3. Click to toggle column visibility
4. Changes apply instantly

### 2. Bulk Product Upload

1. Navigate to **Products** page
2. Click **"Bulk Upload"** button
3. Choose **CSV** or **JSON** tab

**CSV Upload:**

```bash
# Download template first
Click "Download Template" → Edit CSV → Upload

# Or create your own:
sku,productStatus,productType,featuresShirt,name,productVariantId
TEST-001,ACTIVE,SHIRT,NORMAL,Test Product,variant-1
```

**With Images:**

```bash
# Name images as: SKU_position.jpg
TEST-001_1.jpg
TEST-001_2.jpg
TEST-001_3.jpg

# Upload CSV + Select images → Click "Upload CSV"
```

### 3. View Order Details

1. Go to **Orders** page
2. Click any order row
3. See Shopify-style detail page with:
   - Timeline
   - Customer info
   - Payment details
   - Shipping address

## 📋 Common Tasks

### Upload 10 Products with Images

**1. Prepare CSV:**

```csv
sku,productStatus,year,team,league,productType,featuresShirt,name,homeAway,productVariantId
MU-HOME-24,ACTIVE,2023/24,Manchester_United_FC,PREMIER_LEAGUE,SHIRT,NORMAL,Man Utd Home,HOME,var1
MU-AWAY-24,ACTIVE,2023/24,Manchester_United_FC,PREMIER_LEAGUE,SHIRT,NORMAL,Man Utd Away,AWAY,var2
```

**2. Prepare Images:**

```
MU-HOME-24_1.jpg
MU-HOME-24_2.jpg
MU-AWAY-24_1.jpg
MU-AWAY-24_2.jpg
```

**3. Upload:**

- Go to `/dashboard/products/bulk-upload`
- Select CSV file
- Select all image files
- Click "Upload CSV"
- Wait for progress bar
- Check results summary

### Customize Table Columns

**Hide columns you don't need:**

1. Click "Columns" button
2. Uncheck: `ID`, `Created At`, `Updated At`
3. Keep: `SKU`, `Name`, `Status`, `Actions`

**Result:** Cleaner table with only essential columns

### Search and Filter

**Products:**

- Use search box to find by name or SKU
- Click column headers to sort

**Orders:**

- Filter by status dropdown
- Search by order ID or customer

## 🔧 Troubleshooting

### "API Error" on all requests

**Fix:** Check BE_Internal is running on port 3000

```bash
cd BE_Internal
npm run dev
```

### Images not uploading

**Fix:** Check filename format

- ✅ Correct: `SKU_1.jpg`, `SKU_2.jpg`
- ❌ Wrong: `SKU1.jpg`, `SKU-1.jpg`, `image.jpg`

### Columns button not showing

**Fix:** You're on an old page. New pages with DataTable have it.

### Build errors

**Fix:** Reinstall dependencies

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📖 Documentation

- **Full Integration Guide:** `INTEGRATION_COMPLETE.md`
- **Column Customization:** `COLUMN_CUSTOMIZATION_GUIDE.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`
- **Feature List:** `FEATURES.md`

## 🎯 Key Features at a Glance

| Feature              | Location                          | Description                  |
| -------------------- | --------------------------------- | ---------------------------- |
| Column Customization | All tables                        | ⚙️ Columns button            |
| Bulk Upload          | `/dashboard/products/bulk-upload` | CSV/JSON + Images            |
| Order Details        | Click any order                   | Shopify-style page           |
| API Integration      | Automatic                         | All endpoints connected      |
| Image Upload         | Bulk upload page                  | Cloudflare with SKU_position |

## 💡 Pro Tips

1. **Download CSV template** before creating your own
2. **Name images correctly** - `SKU_position` format is critical
3. **Use column customization** to focus on what matters
4. **Check progress bar** during bulk uploads
5. **Read error messages** in results summary for failed uploads

## ✅ Verification Checklist

After setup, verify:

- [ ] Can login to dashboard
- [ ] Can see products list
- [ ] Columns button appears on tables
- [ ] Can toggle column visibility
- [ ] Can click order to see details
- [ ] Can access bulk upload page
- [ ] Can download CSV template

## 🚀 You're Ready!

Everything is set up and working. Start by:

1. Exploring the dashboard
2. Testing column customization
3. Uploading a few test products
4. Checking the order detail page

Need help? Check the documentation files listed above.
