# React Query Implementation Guide

## ✅ What's Been Implemented

### 1. React Query Setup

- **Provider**: Wraps entire app in `src/app/layout.tsx`
- **Configuration**: 5-minute cache, automatic refetching, keeps old data while loading
- **Hooks**: Ready-to-use hooks for products CRUD operations

### 2. Benefits You'll See Immediately

#### Before (Without Caching):

```
1. Create product → API call (2-3s)
2. Navigate to products list → API call (3-6s) ❌ Product not visible
3. Manual refresh → API call (3-6s) ✅ Product appears
```

#### After (With Caching):

```
1. Create product → API call (2-3s) + Auto-invalidate cache
2. Navigate to products list → Instant from cache ✅ Product visible immediately
3. Sort/filter → Shows old data while loading new (no flicker)
```

---

## 📝 How to Use in Your Components

### Example: Products Page

**BEFORE (Old way - no caching):**

```typescript
// ❌ Old approach - no caching, manual state management
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchProducts() {
    setLoading(true);
    const response = await fetch("/api/products");
    const data = await response.json();
    setProducts(data);
    setLoading(false);
  }
  fetchProducts();
}, [page, sortBy]); // Refetches every time
```

**AFTER (New way - with caching):**

```typescript
// ✅ New approach - automatic caching, refetching, and state management
import { useProducts } from "@/hooks/use-products";

function ProductsPage() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // This hook handles everything: caching, loading, errors, refetching
  const { data, isLoading, error, isFetching } = useProducts({
    page,
    limit: 100,
    sortBy,
    sortOrder,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const products = data?.data.data || [];
  const pagination = data?.data.pagination;

  return (
    <div>
      {/* isFetching shows loading indicator while keeping old data visible */}
      {isFetching && <div className="opacity-50">Updating...</div>}

      {/* Products list */}
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}

      {/* Pagination */}
      <Pagination
        page={pagination?.page}
        totalPages={pagination?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

---

### Example: Create Product

**BEFORE:**

```typescript
// ❌ Manual API call, manual state update, manual error handling
async function handleCreate(data: any) {
  try {
    setLoading(true);
    const response = await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed");

    // Manually refetch products list
    await fetchProducts();
    toast.success("Created!");
  } catch (error) {
    toast.error("Failed!");
  } finally {
    setLoading(false);
  }
}
```

**AFTER:**

```typescript
// ✅ Automatic cache invalidation, error handling, loading states
import { useCreateProduct } from "@/hooks/use-products";

function CreateProductForm() {
  const createProduct = useCreateProduct();

  async function handleCreate(data: any) {
    // This automatically:
    // 1. Calls the API
    // 2. Shows success/error toast
    // 3. Invalidates products cache
    // 4. Refetches products list
    await createProduct.mutateAsync(data);
  }

  return (
    <form onSubmit={handleSubmit(handleCreate)}>
      {/* Form fields */}
      <button disabled={createProduct.isPending}>
        {createProduct.isPending ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
}
```

---

### Example: Update Product

```typescript
import { useUpdateProduct } from "@/hooks/use-products";

function EditProductDialog({ product }: { product: Product }) {
  const updateProduct = useUpdateProduct();

  async function handleUpdate(data: any) {
    await updateProduct.mutateAsync({
      id: product.id,
      data,
    });
    // Cache automatically invalidated, list refreshes
  }

  return (
    <Dialog>
      <form onSubmit={handleSubmit(handleUpdate)}>
        {/* Form fields */}
        <button disabled={updateProduct.isPending}>Save Changes</button>
      </form>
    </Dialog>
  );
}
```

---

### Example: Copy Product

```typescript
import { useCopyProduct } from "@/hooks/use-products";

function CopyProductDialog({ product }: { product: Product }) {
  const copyProduct = useCopyProduct();
  const [sku, setSku] = useState("");
  const [name, setName] = useState(product.name + " (Copy)");
  const [year, setYear] = useState(product.year);

  async function handleCopy() {
    try {
      await copyProduct.mutateAsync({
        id: product.id,
        data: { sku, name, year },
      });
      // Success! Cache invalidated, new product appears in list
    } catch (error) {
      // Error toast shown automatically
    }
  }

  return (
    <Dialog>
      <input
        placeholder="New SKU"
        value={sku}
        onChange={(e) => setSku(e.target.value)}
      />
      <input
        placeholder="New Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Year"
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />
      <button onClick={handleCopy} disabled={copyProduct.isPending}>
        {copyProduct.isPending ? "Copying..." : "Copy Product"}
      </button>
    </Dialog>
  );
}
```

---

## 🎯 Key Features

### 1. Automatic Cache Management

- Data cached for 5 minutes
- Automatically refetches when stale
- Invalidates on mutations (create/update/delete)

### 2. No Flicker During Sort/Filter

```typescript
// Old data stays visible while new data loads
placeholderData: (previousData) => previousData;
```

### 3. Background Refetching

- Refetches on window focus
- Keeps data fresh without user action
- Silent updates in background

### 4. Optimistic Updates (Optional)

```typescript
// Show changes immediately, rollback if fails
const updateProduct = useUpdateProduct({
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["products"] });

    // Snapshot previous value
    const previousProducts = queryClient.getQueryData(["products"]);

    // Optimistically update
    queryClient.setQueryData(["products"], (old) => {
      // Update the product in the list
      return updateProductInList(old, newData);
    });

    return { previousProducts };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(["products"], context.previousProducts);
  },
});
```

---

## 🚀 Migration Checklist

### Step 1: Update Products Page

- [ ] Replace `useState` + `useEffect` with `useProducts` hook
- [ ] Remove manual loading states
- [ ] Remove manual error handling
- [ ] Use `isFetching` for loading indicator

### Step 2: Update Create Product

- [ ] Replace manual API call with `useCreateProduct` hook
- [ ] Remove manual cache invalidation
- [ ] Remove manual toast notifications (handled by hook)

### Step 3: Update Edit Product

- [ ] Replace manual API call with `useUpdateProduct` hook
- [ ] Remove manual cache invalidation

### Step 4: Update Delete Product

- [ ] Replace manual API call with `useDeleteProduct` hook
- [ ] Remove manual list refresh

### Step 5: Add Copy Product

- [ ] Create copy dialog component
- [ ] Use `useCopyProduct` hook
- [ ] Add validation for SKU uniqueness

---

## 🐛 Troubleshooting

### Products not appearing after create?

**Check:**

1. Is `ReactQueryProvider` in `layout.tsx`? ✅
2. Is `useCreateProduct` being called? ✅
3. Is cache being invalidated? ✅ (automatic)
4. Check browser console for errors

### Sorting still slow?

**This is normal!** Sorting requires a new database query. But now:

- Old data stays visible while loading (no blank screen)
- If you sort back, data loads instantly from cache
- Loading indicator shows progress

### Cache not updating?

**Force refetch:**

```typescript
const { refetch } = useProducts();

// Manual refetch
await refetch();
```

---

## 📊 Performance Comparison

### Before React Query:

- Create product: 2-3s
- Navigate to list: 3-6s (full API call)
- Sort: 3-6s (full API call)
- Filter: 3-6s (full API call)
- **Total time to see new product: 5-9 seconds**

### After React Query:

- Create product: 2-3s
- Navigate to list: **Instant** (from cache)
- Sort: 3-6s (but old data visible)
- Filter: 3-6s (but old data visible)
- **Total time to see new product: 2-3 seconds** ⚡

---

## 🎉 Summary

**What you get:**

1. ✅ Products appear immediately after creation
2. ✅ No flicker during sort/filter
3. ✅ Automatic cache management
4. ✅ Background refetching
5. ✅ Consistent error handling
6. ✅ Loading states handled automatically
7. ✅ Less code to maintain

**Next steps:**

1. Update your products page to use the new hooks
2. Test create/edit/delete operations
3. Verify products appear immediately
4. Enjoy the performance boost! 🚀
