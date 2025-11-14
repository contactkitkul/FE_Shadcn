# DRY Violations Found in Codebase

## 🔴 Critical Violations (High Priority)

### 1. **Duplicate Fetch Pattern** (10+ occurrences)
**Location:** All dashboard pages (`products`, `orders`, `customers`, `discounts`, `shipments`, `payments`, `refunds`)

**Problem:** Same fetch logic repeated in every page:
```typescript
const fetchProducts = async () => {
  try {
    setLoading(true);
    const response = await api.products.getAll({
      page: 1,
      limit: 100,
      sortBy: sortColumn,
      sortOrder: sortDirection,
      search: searchTerm,
    });
    if (response.success) {
      setProducts(response.data.data || []);
    } else {
      toast.error("Failed to load products");
    }
  } catch (error: any) {
    console.error("Error fetching products:", error);
    toast.error(error.message || "Failed to load products");
  } finally {
    setLoading(false);
  }
};
```

**Solution:** Create a custom hook `useFetchData`

---

### 2. **Duplicate Loading State** (10+ occurrences)
**Location:** All dashboard pages

**Problem:**
```typescript
const [loading, setLoading] = useState(true);
```

Every page manages loading state identically.

**Solution:** Include in `useFetchData` hook

---

### 3. **Duplicate Search Debounce** (7+ occurrences)
**Location:** All list pages

**Problem:**
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    if (searchTerm !== "") {
      fetchProducts();
    }
  }, 500);
  return () => clearTimeout(timer);
}, [searchTerm]);
```

**Solution:** Create `useDebounce` hook

---

### 4. **Duplicate Logout Logic** (2 occurrences)
**Location:** 
- `/components/dashboard/navbar.tsx`
- `/components/auth/LogoutButton.tsx`

**Problem:**
```typescript
const handleLogout = async () => {
  try {
    await api.auth.logout();
    localStorage.removeItem('user');
    toast.success("Logged out successfully");
    router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Logout failed");
  }
};
```

**Solution:** Create `useAuth` hook with logout method

---

### 5. **Duplicate Toast Messages** (50+ occurrences)
**Location:** Throughout the app

**Problem:**
```typescript
toast.error("Failed to load products");
toast.error("Failed to load orders");
toast.error("Failed to load customers");
// ... etc
```

**Solution:** Create standardized toast message constants

---

## 🟡 Medium Priority Violations

### 6. **Duplicate Sort State** (7+ occurrences)
```typescript
const [sortColumn, setSortColumn] = useState<string>("createdAt");
const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
```

**Solution:** Include in `useFetchData` hook

---

### 7. **Duplicate Filter State** (Multiple occurrences)
```typescript
const [statusFilter, setStatusFilter] = useState<string>("all");
const [searchTerm, setSearchTerm] = useState("");
```

**Solution:** Create `useFilters` hook

---

## 📋 Recommended Solutions

### Solution 1: Create `useFetchData` Hook
```typescript
// /src/hooks/useFetchData.ts
export function useFetchData<T>(
  fetchFn: (params: any) => Promise<any>,
  options?: {
    initialSort?: string;
    initialSortOrder?: 'asc' | 'desc';
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState(options?.initialSort || 'createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    options?.initialSortOrder || 'desc'
  );

  const fetchData = async (searchTerm?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFn({
        page: 1,
        limit: 100,
        sortBy: sortColumn,
        sortOrder: sortDirection,
        search: searchTerm,
      });
      
      if (response.success) {
        setData(response.data.data || []);
      } else {
        throw new Error(response.error || 'Failed to fetch data');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    sortColumn,
    sortDirection,
    setSortColumn,
    setSortDirection,
    refetch: fetchData,
  };
}
```

### Solution 2: Create `useDebounce` Hook
```typescript
// /src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### Solution 3: Create `useAuth` Hook
```typescript
// /src/hooks/useAuth.ts
export function useAuth() {
  const router = useRouter();

  const logout = async () => {
    try {
      await api.auth.logout();
      localStorage.removeItem('user');
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  const getUser = () => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  };

  return { logout, getUser };
}
```

### Solution 4: Create Toast Message Constants
```typescript
// /src/config/messages.ts
export const TOAST_MESSAGES = {
  // Success messages
  success: {
    logout: "Logged out successfully",
    login: "Login successful!",
    created: (entity: string) => `${entity} created successfully`,
    updated: (entity: string) => `${entity} updated successfully`,
    deleted: (entity: string) => `${entity} deleted successfully`,
  },
  // Error messages
  error: {
    logout: "Logout failed",
    login: "Login failed. Please try again.",
    loadFailed: (entity: string) => `Failed to load ${entity}`,
    createFailed: (entity: string) => `Failed to create ${entity}`,
    updateFailed: (entity: string) => `Failed to update ${entity}`,
    deleteFailed: (entity: string) => `Failed to delete ${entity}`,
  },
};
```

## 📊 Impact Summary

| Violation | Occurrences | Lines Saved | Priority |
|-----------|-------------|-------------|----------|
| Fetch Pattern | 10+ | ~300 lines | 🔴 Critical |
| Loading State | 10+ | ~50 lines | 🔴 Critical |
| Search Debounce | 7+ | ~100 lines | 🔴 Critical |
| Logout Logic | 2 | ~30 lines | 🔴 Critical |
| Toast Messages | 50+ | ~100 lines | 🔴 Critical |
| Sort State | 7+ | ~50 lines | 🟡 Medium |
| Filter State | Multiple | ~50 lines | 🟡 Medium |

**Total Estimated Reduction:** ~680 lines of duplicate code

## ✅ Next Steps

1. Create custom hooks (`useFetchData`, `useDebounce`, `useAuth`)
2. Create message constants
3. Refactor dashboard pages to use hooks
4. Remove duplicate code
5. Test thoroughly

## 🎯 Benefits

- **Maintainability:** Update logic in one place
- **Consistency:** Same behavior across all pages
- **Testability:** Test hooks independently
- **Bundle Size:** Reduce code duplication
- **Developer Experience:** Faster development
