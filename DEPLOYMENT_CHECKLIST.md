# MHA Academy - Automated Deployment Checklist for Claude Code

This file contains the exact steps Claude Code should execute to fully deploy MHA Academy.

## Phase 1: Environment Preparation

### Task 1.1: Verify Repository Structure
- [ ] Confirm all files exist in `/src/app/api/*` routes
- [ ] Verify `supabase/migrations/` folder has all 3 SQL files
- [ ] Check `src/lib/supabase/` has: `server.ts`, `browser.ts`, `admin.ts`, `client.ts`
- [ ] Ensure `.env.example` and `.env.local.example` exist
- [ ] Verify `vercel.json` is present
- [ ] Confirm `package.json` has all required dependencies

**Command to verify**:
```bash
ls -la src/app/api/ && ls -la supabase/migrations/ && ls -la src/lib/supabase/
```

### Task 1.2: Verify TypeScript Configuration
- [ ] Run type check: `npm run type-check`
- [ ] Verify no TypeScript errors
- [ ] Confirm all imports resolve correctly

**Command to verify**:
```bash
npm run type-check
```

**Expected Output**: `No errors detected`

## Phase 2: Supabase Configuration

### Task 2.1: Get Supabase Project URL
**Source**: From spidnes-wrl's Supabase dashboard
- [ ] Navigate to: Project Settings → API
- [ ] Copy: `Project URL` (format: `https://xxxxxxxxxxxxx.supabase.co`)
- [ ] Store as: `SUPABASE_URL_VALUE`

**Do NOT commit this value**

### Task 2.2: Get Supabase Anon Key
**Source**: From spidnes-wrl's Supabase dashboard
- [ ] Navigate to: Project Settings → API
- [ ] Copy: `anon` (public) key (format: `eyJhbG...`)
- [ ] Store as: `SUPABASE_ANON_KEY_VALUE`

**Do NOT commit this value**

### Task 2.3: Get Supabase Service Role Key
**Source**: From spidnes-wrl's Supabase dashboard
- [ ] Navigate to: Project Settings → API
- [ ] Copy: `service_role` key (format: `eyJhbG...`)
- [ ] Store as: `SUPABASE_SERVICE_ROLE_VALUE`

⚠️ **CRITICAL**: This key should ONLY be in Vercel, never in code or browser

### Task 2.4: Apply Database Migrations
**Location**: Supabase SQL Editor

**For Migration 001**:
1. Open: https://supabase.com → Your Project → SQL Editor
2. Click: "New Query"
3. Copy entire content from: `supabase/migrations/001_init_mha_schema.sql`
4. Paste into SQL editor
5. Click: "Run"
6. Verify: No errors in output

**For Migration 002**:
1. Repeat steps 1-6 for: `supabase/migrations/002_messaging_and_groups.sql`

**For Migration 003**:
1. Repeat steps 1-6 for: `supabase/migrations/003_library_and_documents.sql`

**Verification**:
- [ ] All 3 migrations executed without errors
- [ ] Tables appear in: Supabase → Tables list
- [ ] Expected tables:
  - `hma_profiles`
  - `hma_messages`
  - `hma_groups`
  - `hma_group_members`
  - `hma_user_blocks`
  - `hma_documents`
  - `hma_shop_items`
  - `hma_point_transactions`
  - `hma_missions`
  - `hma_events`
  - `hma_rules`

### Task 2.5: Verify Row Level Security (RLS)
**Location**: Supabase → Authentication → Policies

For each table, verify RLS is enabled:
- [ ] `hma_profiles` - RLS enabled
- [ ] `hma_messages` - RLS enabled
- [ ] `hma_groups` - RLS enabled
- [ ] `hma_group_members` - RLS enabled
- [ ] `hma_user_blocks` - RLS enabled
- [ ] `hma_documents` - RLS enabled
- [ ] `hma_shop_items` - RLS enabled
- [ ] `hma_point_transactions` - RLS enabled
- [ ] `hma_missions` - RLS enabled
- [ ] `hma_events` - RLS enabled
- [ ] `hma_rules` - RLS enabled

**Verification Command** (in Supabase SQL Editor):
```sql
SELECT table_name, row_level_security_enabled
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected**: All `hma_*` tables should show `row_level_security_enabled = true`

## Phase 3: Vercel Configuration

### Task 3.1: Connect GitHub Repository to Vercel
**Location**: vercel.com

1. Sign in to Vercel (create account if needed)
2. Click: "Add New Project"
3. Select: "Import Git Repository"
4. Authenticate with GitHub if prompted
5. Search and select: `spidnes-wrl/mha-academy`
6. Click: "Import"
7. Configure:
   - **Project name**: `mha-academy`
   - **Framework**: `Next.js` (auto-detected)
   - **Root directory**: (leave default)
8. Click: "Deploy"

**Verification**:
- [ ] Vercel shows "Deploying..."
- [ ] Deployment completes in 2-5 minutes
- [ ] No build errors in deployment log

### Task 3.2: Add Production Environment Variables
**Location**: Vercel → Settings → Environment Variables

Add each variable and select Environment: **Production**

**Variable 1**:
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `<SUPABASE_URL_VALUE from Task 2.1>`
- Environments: `Production`, `Preview`, `Development`

**Variable 2**:
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `<SUPABASE_ANON_KEY_VALUE from Task 2.2>`
- Environments: `Production`, `Preview`, `Development`

**Variable 3** ⚠️ **SENSITIVE**:
- Key: `SUPABASE_SERVICE_ROLE_KEY`
- Value: `<SUPABASE_SERVICE_ROLE_VALUE from Task 2.3>`
- Environments: `Production` ONLY
- Check: "Encrypt" (mark as secret)

**Variable 4**:
- Key: `NEXT_PUBLIC_APP_URL`
- Value: `https://<your-vercel-deployment-url>` (e.g., `https://mha-academy.vercel.app`)
- Environments: `Production`, `Preview`, `Development`

**Variable 5**:
- Key: `NODE_ENV`
- Value: `production`
- Environments: `Production` ONLY

**Verification**:
- [ ] All 5 variables saved
- [ ] Service role key is marked as secret
- [ ] No errors when saving

### Task 3.3: Trigger Deployment with New Variables
**Location**: Vercel → Deployments

1. Click: "Deployments" tab
2. Find latest deployment
3. Click: "..." menu
4. Select: "Redeploy"
5. Click: "Redeploy" confirmation

**Verification**:
- [ ] New deployment starts
- [ ] Deployment completes successfully
- [ ] Build log shows "✓ Build completed"
- [ ] No TypeScript or build errors

## Phase 4: Production Testing

### Task 4.1: Test Home Page
**URL**: `https://<your-vercel-url>`

**Test Steps**:
1. Open URL in browser
2. Verify page loads
3. Open DevTools (F12 → Console)
4. Verify no JavaScript errors
5. Verify no network errors (all requests 2xx or 3xx status)

**Expected**:
- ✅ Page renders
- ✅ No console errors
- ✅ Navigation links visible

### Task 4.2: Test User Registration
**URL**: `https://<your-vercel-url>/auth/register`

**Test Steps**:
1. Fill registration form:
   - Email: `testuser+<timestamp>@example.com` (e.g., `testuser+20231010@example.com`)
   - Password: `TestPassword123!`
   - First Name: `Test`
   - Last Name: `User`
2. Click: "Register"
3. Verify:
   - Page redirects to `/auth/login`
   - No error messages
   - New user created in Supabase → hma_profiles table

**Expected**:
- ✅ Registration succeeds
- ✅ User created with `role: student`
- ✅ User created with `class_rank: C`

### Task 4.3: Test Student Login
**URL**: `https://<your-vercel-url>/auth/login`

**Test Steps**:
1. Enter credentials from Task 4.2
2. Click: "Login"
3. Verify redirect to `/dashboard`
4. Verify student dashboard loads
5. Verify shows student name and class

**Expected**:
- ✅ Login succeeds
- ✅ Redirect to dashboard
- ✅ Student profile displayed

### Task 4.4: Test Student Dashboard
**URL**: `https://<your-vercel-url>/dashboard`

**Test Steps** (while logged in as student):
1. Verify page loads
2. Verify shows:
   - Student name
   - Class rank
   - Virtual coins balance
   - Recent missions
   - Recent events
3. Open DevTools → Console
4. Verify no errors

**Expected**:
- ✅ Dashboard loads
- ✅ All student data displays
- ✅ No console errors

### Task 4.5: Test Admin Access (Unauthorized)
**URL**: `https://<your-vercel-url>/admin`

**Test Steps** (while logged in as student):
1. Navigate to `/admin`
2. Verify:
   - Either redirected to home page
   - OR shows "403 Forbidden"
   - OR shows "Unauthorized" message
3. Verify admin panel is NOT accessible

**Expected**:
- ✅ Access denied
- ✅ No admin data exposed

### Task 4.6: Test Admin Access (Authorized)
**Location**: Supabase Dashboard

**Steps**:
1. In Supabase → Tables → hma_profiles
2. Find the test user from Task 4.2
3. Click on user row to edit
4. Change `role` from `student` to `director`
5. Click: "Update" or press Ctrl+S
6. Wait for save confirmation

**Test Steps** (while logged in as director):
1. Navigate to `https://<your-vercel-url>/admin`
2. Verify admin panel loads with:
   - Student statistics
   - Exam counters
   - Mission counters
   - Event counters
   - Admin modules (Students, Academy, Shop, Economy, Community, Security)
3. Verify no "Unauthorized" errors

**Expected**:
- ✅ Admin panel loads
- ✅ All statistics display
- ✅ All modules visible

### Task 4.7: Test Protected API Endpoint (Shop)
**Tool**: curl, Postman, or similar

**Preparation**:
1. While logged in as student, open DevTools → Application → Cookies
2. Note your session cookie (should start with `sb-`)

**Test Command**:
```bash
curl -X GET "https://<your-vercel-url>/api/student/shop" \
  -H "Cookie: <your-session-cookie>" \
  -v
```

**Expected Response**:
- ✅ Status: 200 OK
- ✅ Response body contains: `{"balance": <number>, "items": []}`

### Task 4.8: Test Protected API Endpoint (Admin - Unauthorized)
**Tool**: curl, Postman, or similar

**Test Command** (as logged-in student):
```bash
curl -X GET "https://<your-vercel-url>/api/admin/dashboard" \
  -H "Cookie: <your-session-cookie>" \
  -v
```

**Expected Response**:
- ✅ Status: 403 Forbidden
- ✅ Response body contains: `{"error": "Forbidden"}`

### Task 4.9: Test Protected API Endpoint (Admin - Authorized)
**Tool**: curl, Postman, or similar

**Preparation**:
1. Switch user role to `director` in Supabase (as done in Task 4.6)
2. Get new session cookie

**Test Command** (as logged-in director):
```bash
curl -X GET "https://<your-vercel-url>/api/admin/dashboard" \
  -H "Cookie: <your-director-session-cookie>" \
  -v
```

**Expected Response**:
- ✅ Status: 200 OK
- ✅ Response body contains statistics object

## Phase 5: Production Hardening

### Task 5.1: Enable Supabase Backups
**Location**: Supabase → Settings → Backups

- [ ] Click: "Enable automatic backups"
- [ ] Set backup frequency: "Daily"
- [ ] Set retention: "30 days" (or preferred)
- [ ] Save

**Verification**:
- [ ] Backups enabled
- [ ] Next backup scheduled

### Task 5.2: Verify HTTPS is Enforced
**Location**: Vercel → Settings → Domains

- [ ] Verify deployment domain uses HTTPS
- [ ] Test: Visit `http://<your-url>` → should redirect to HTTPS

### Task 5.3: Enable Vercel Analytics (Optional)
**Location**: Vercel → Analytics

- [ ] Enable Web Analytics if available in plan
- [ ] Enable Performance Analytics

### Task 5.4: Create Monitoring Alert
**Location**: Vercel → Settings → Alerts (if available)

- [ ] Set up alert for failed deployments
- [ ] Set up alert for build timeouts

## Phase 6: Final Verification

### Task 6.1: Check Deployment Health
**Location**: Vercel → Deployments

- [ ] Production deployment shows "✓ Ready"
- [ ] No recent errors or warnings
- [ ] Build time is reasonable (< 5 minutes)

### Task 6.2: Verify Database Integrity
**Location**: Supabase → Database → Inspect

```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'hma_%';
```

**Expected**: `table_count = 11` (or count of all hma_ tables)

### Task 6.3: Final Checklist

- [ ] Home page loads (public)
- [ ] Registration works (public)
- [ ] Login works (public)
- [ ] Student dashboard loads (authenticated)
- [ ] Admin panel blocked for students (403/redirect)
- [ ] Admin panel loads for directors (authenticated)
- [ ] API endpoints respect authentication
- [ ] API endpoints respect authorization
- [ ] No secrets in browser console
- [ ] HTTPS enforced
- [ ] Backups enabled
- [ ] Database integrity verified
- [ ] All TypeScript type checks pass
- [ ] No console errors in browser DevTools

## Success Criteria

✅ **Deployment is successful when**:
1. All 3 database migrations applied without errors
2. All environment variables set in Vercel
3. Vercel deployment shows "✓ Ready"
4. Public routes (home, login, register) load
5. Authenticated routes (dashboard) load with valid auth
6. Admin routes return 403 for non-admins
7. Admin routes load for admins
8. API endpoints enforce authentication
9. API endpoints enforce authorization
10. No secrets are exposed in frontend code

## Post-Deployment

### Monitoring
- Check Vercel logs daily for first week
- Monitor Supabase query performance
- Watch for database growth

### Maintenance
- Update dependencies monthly: `npm update`
- Review and apply security patches immediately
- Keep Supabase connection string secure
- Rotate API keys periodically

### Scaling
- Monitor Supabase connection limits
- Monitor Vercel compute usage
- Scale resources as needed
