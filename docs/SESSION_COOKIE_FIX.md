# Session Cookie Fix - "Not authenticated" After Login

## Problem
After successfully logging in, subsequent API calls returned `{success: false, error: "Not authenticated"}`.

## Root Cause
**Cross-origin cookie issue** between frontend and backend:

```
Frontend: localhost:3001
Backend:  localhost:3000

Problem: Cookies set by backend (port 3000) are not sent 
         by frontend (port 3001) due to different origins
```

## The Fix

### Before (Broken)
```typescript
// Frontend calls backend API for login
const response = await api.auth.login(email, password)
// Backend sets cookie for localhost:3000
// Frontend on localhost:3001 can't access it ❌
```

### After (Fixed)
```typescript
// Frontend uses Supabase client directly
const { data } = await supabase.auth.signInWithPassword({ email, password })
// Supabase sets cookie in browser (works across all localhost ports) ✅

// Then fetch user role from backend
const response = await api.auth.me()
// Cookie is sent with request ✅
```

## Changes Made

### 1. Created Supabase Client for Frontend
**File:** `/src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2. Added Environment Variables
**File:** `/.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ajolgsdqowkjleqnlkbn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Updated Login Flow
**File:** `/src/app/login/page.tsx`

**Old:**
```typescript
const response = await api.auth.login(email, password)
```

**New:**
```typescript
// Step 1: Login with Supabase (sets session cookie)
const { data: authData, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

// Step 2: Fetch user role from backend
const response = await api.auth.me()
```

## Why This Works

### Supabase Session Management
When you login with Supabase client in the browser:
1. Supabase sets session cookies in the browser
2. These cookies work across all `localhost` ports
3. Backend can validate these cookies using Supabase SDK

### Flow Diagram
```
┌─────────────────────────────────────────────────────┐
│ Frontend (localhost:3001)                           │
│                                                     │
│  1. Login with Supabase client                     │
│     supabase.auth.signInWithPassword()             │
│                                                     │
│  2. Supabase sets cookies in browser ✅            │
│                                                     │
│  3. Call backend /api/me with cookies              │
│     api.auth.me()                                  │
└──────────────────┬──────────────────────────────────┘
                   │ (Cookies sent automatically)
                   ↓
┌─────────────────────────────────────────────────────┐
│ Backend (localhost:3000)                            │
│                                                     │
│  1. Receive request with cookies ✅                │
│                                                     │
│  2. Validate session with Supabase                 │
│     supabase.auth.getUser()                        │
│                                                     │
│  3. Fetch user role from database                  │
│     prisma.user.findUnique()                       │
│                                                     │
│  4. Return user data ✅                            │
└─────────────────────────────────────────────────────┘
```

## Testing

### Test 1: Login Flow
1. Go to `http://localhost:3001/login`
2. Enter credentials
3. Should login successfully ✅
4. Should redirect to dashboard ✅
5. Should NOT see "Not authenticated" error ✅

### Test 2: Session Persistence
1. Login successfully
2. Refresh the page
3. Session should persist ✅
4. User should stay logged in ✅

### Test 3: API Calls
1. Login successfully
2. Make any authenticated API call
3. Should work without "Not authenticated" error ✅

## Signup Flow (No Changes Needed)

Signup can continue using the backend API because:
- It creates user in both Supabase Auth AND database
- User is redirected to login page after signup
- Login flow handles session properly

## Important Notes

### For Development
- Frontend: `http://localhost:3001`
- Backend: `http://localhost:3000`
- Supabase cookies work across both ports ✅

### For Production
- Frontend and backend should be on same domain
- Or use proper CORS configuration
- Supabase cookies will work seamlessly

## Troubleshooting

### Still seeing "Not authenticated"?

**Check 1: Environment Variables**
```bash
cd FE_Shadcn
cat .env.local
# Should show NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Check 2: Restart Frontend**
```bash
cd FE_Shadcn
npm run dev
```

**Check 3: Clear Browser Cookies**
- Open DevTools → Application → Cookies
- Clear all localhost cookies
- Try login again

**Check 4: Check Browser Console**
- Look for Supabase errors
- Check if cookies are being set

### Cookies Not Being Set?

**Check Supabase Configuration:**
1. Go to Supabase Dashboard
2. Settings → API
3. Verify URL and anon key match `.env.local`

## Related Files
- `/src/lib/supabase.ts` - Supabase client
- `/src/app/login/page.tsx` - Login page with fix
- `/.env.local` - Environment variables
- `/BE_Internal/src/app/api/me/route.ts` - User info endpoint
- `/BE_Internal/src/middleware/auth.ts` - Auth middleware
