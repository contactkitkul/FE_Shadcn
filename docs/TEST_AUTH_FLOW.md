# Test Authentication Flow

## Changes Made

### 1. Fixed API Client to Use Supabase Session
**File:** `/src/lib/api.ts`

**Before:**
```typescript
// Used localStorage (wrong!)
return localStorage.getItem("authToken")
```

**After:**
```typescript
// Uses Supabase session (correct!)
const { data } = await supabase.auth.getSession()
return data.session?.access_token || null
```

### 2. Added Credentials to Fetch Requests
```typescript
fetch(url, {
  credentials: 'include',  // ← Sends cookies with request
  headers: {
    Authorization: `Bearer ${token}`  // ← Also sends JWT token
  }
})
```

## How It Works Now

```
┌─────────────────────────────────────────┐
│ 1. User logs in                         │
│    supabase.auth.signInWithPassword()   │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 2. Supabase sets session in browser     │
│    - Session stored in localStorage     │
│    - Cookies set for auth               │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 3. Frontend calls /api/me               │
│    - Gets token from Supabase session   │
│    - Sends in Authorization header      │
│    - Sends cookies with credentials     │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 4. Backend validates                    │
│    - Checks Authorization header JWT    │
│    - OR checks cookies                  │
│    - Validates with Supabase            │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 5. Returns user data ✅                 │
└─────────────────────────────────────────┘
```

## Testing Steps

### Step 1: Restart Frontend
```bash
cd FE_Shadcn
# Kill the dev server (Ctrl+C)
npm run dev
```

### Step 2: Clear Browser Data
1. Open DevTools (F12)
2. Application → Storage → Clear site data
3. Or use Incognito/Private window

### Step 3: Sign Up
1. Go to `http://localhost:3001/signup`
2. Enter email and password
3. Should succeed ✅

### Step 4: Sign In
1. Go to `http://localhost:3001/login`
2. Use SAME email and password
3. Should login successfully ✅
4. Should NOT see 401 error ✅

### Step 5: Verify Session
1. Check browser console - no errors
2. Check Network tab:
   - `/api/me` should return 200 ✅
   - Request should include Authorization header ✅

## Debugging

### If Still Getting 401

**Check 1: Token is being sent**
```javascript
// Open browser console on login page
const { data } = await supabase.auth.getSession()
console.log('Token:', data.session?.access_token)
// Should show a JWT token
```

**Check 2: Request includes token**
```
// Network tab → /api/me request
// Headers should show:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Check 3: Backend logs**
```bash
# Check BE_Internal terminal
# Should NOT show "Not authenticated" errors
```

**Check 4: Supabase session exists**
```javascript
// Browser console
localStorage.getItem('sb-ajolgsdqowkjleqnlkbn-auth-token')
// Should show session data
```

### Common Issues

**Issue 1: "Failed to fetch"**
- Backend not running
- Solution: `cd BE_Internal && npm run dev`

**Issue 2: CORS error**
- Frontend URL not in allowed origins
- Solution: Already fixed in middleware

**Issue 3: Token is null**
- User not logged in
- Solution: Login again

**Issue 4: 401 even with token**
- Token expired
- Solution: Login again (gets new token)

## What Changed Summary

| Component | Before | After |
|-----------|--------|-------|
| **Token Source** | localStorage | Supabase session |
| **Token in Requests** | ❌ No | ✅ Yes (Authorization header) |
| **Credentials** | ❌ Not sent | ✅ Sent with requests |
| **Session Validation** | ❌ Broken | ✅ Works |

## Expected Behavior

✅ **Signup** → Success  
✅ **Login** → Success  
✅ **API Calls** → Include auth token  
✅ **Backend** → Validates token  
✅ **No 401 errors** → Everything works!

## Files Modified

1. `/src/lib/api.ts` - Fixed token retrieval and added credentials
2. `/src/lib/supabase.ts` - Created Supabase client
3. `/src/app/login/page.tsx` - Use Supabase for login
4. `/.env.local` - Added Supabase credentials

## Next Steps

1. Restart frontend: `npm run dev`
2. Clear browser cache
3. Try signup → login flow
4. Should work perfectly! 🎉
