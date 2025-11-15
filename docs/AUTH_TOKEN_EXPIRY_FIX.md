# Auth Token Expiry - Fixed

## 🔍 The Problem

You suddenly got **401 Unauthorized** errors on all API requests:

```
GET /api/products?... 401 in 631ms
GET /api/discounts?... 401 in 671ms
```

## 🎯 Root Cause

**JWT token expired** - Supabase tokens typically expire after 1 hour.

The frontend stores the token in `localStorage.getItem('auth_token')`, but when it expires:

- Backend rejects all requests with 401
- Frontend keeps trying with expired token
- User appears "logged out" but UI doesn't update

## ✅ What I Fixed

### 1. **Auto-Logout on Token Expiry**

**File:** `src/lib/api-client.ts`

```typescript
// Handle errors
if (!response.ok) {
  // If 401, clear token and redirect to login
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
  }
  // ... rest of error handling
}
```

**Now when token expires:**

1. ✅ API returns 401
2. ✅ Frontend detects 401
3. ✅ Clears expired token from localStorage
4. ✅ Redirects to login page automatically
5. ✅ User can login again with fresh token

## 🚀 Immediate Fix

**Just re-login:**

1. Go to `/login`
2. Login with your email
3. Fresh token will be issued
4. Everything works again

## 📋 How Token Auth Works

### Login Flow:

```
1. User enters email/password
2. POST /api/auth/login
3. Backend validates with Supabase
4. Backend returns JWT token
5. Frontend stores in localStorage
6. Frontend sends token with every request
```

### Token Expiry:

```
1. Token expires after ~1 hour
2. Backend rejects requests (401)
3. Frontend auto-redirects to login ✅ (NEW!)
4. User logs in again
5. Fresh token issued
```

## 🔧 Future Improvements

### Option 1: Token Refresh (Recommended)

Implement automatic token refresh before expiry:

```typescript
// Check token expiry before each request
// Refresh if < 5 minutes remaining
// Use Supabase refresh token
```

### Option 2: Longer Token Expiry

Configure Supabase to use longer token expiry:

- Default: 1 hour
- Can extend to 24 hours or more
- Trade-off: Security vs UX

### Option 3: Remember Me

Store refresh token for longer sessions:

- Use Supabase refresh token
- Auto-refresh on app load
- Better UX for returning users

## 📊 Summary

### Before Fix:

- ❌ Token expires
- ❌ All requests fail with 401
- ❌ User stuck with errors
- ❌ Must manually clear localStorage and navigate to login

### After Fix:

- ✅ Token expires
- ✅ First 401 detected
- ✅ Auto-clears expired token
- ✅ Auto-redirects to login
- ✅ User can login again immediately

**No more confusion when tokens expire!** 🎉
