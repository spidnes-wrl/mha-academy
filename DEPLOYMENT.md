# MHA Academy - Deployment Guide

## Overview

This guide contains all necessary steps to deploy MHA Academy to production on Vercel and connect it to Supabase.

## Prerequisites

- Vercel account (vercel.com)
- Supabase account (supabase.com)
- GitHub account with access to this repository

## Step 1: Prepare Supabase Project

### 1.1 Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings → API**
3. Note down these values:
   - `Project URL` → This is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → This is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → This is `SUPABASE_SERVICE_ROLE_KEY` (KEEP THIS PRIVATE)

### 1.2 Apply Database Migrations

1. Go to your Supabase project → **SQL Editor**
2. Click **New Query**
3. Copy the entire content from `supabase/migrations/001_init_mha_schema.sql`
4. Paste it into the SQL editor and click **Run**
5. Repeat step 2-4 for `supabase/migrations/002_messaging_and_groups.sql`
6. Repeat step 2-4 for `supabase/migrations/003_library_and_documents.sql`

### 1.3 Enable Row Level Security (RLS)

1. In Supabase, go to **Authentication → Policies**
2. Verify all tables have RLS enabled:
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

## Step 2: Configure Vercel Deployment

### 2.1 Connect Repository to Vercel

1. Go to vercel.com and sign in
2. Click **Add New Project**
3. Select **Import Git Repository**
4. Search for `mha-academy` and click **Import**
5. Configure project name: `mha-academy`
6. Framework preset: **Next.js** (should auto-detect)
7. Click **Deploy**

### 2.2 Add Environment Variables

1. After import, go to **Settings → Environment Variables**
2. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=<your_project_url_from_step_1.1>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key_from_step_1.1>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key_from_step_1.1>
NEXT_PUBLIC_APP_URL=https://<your-vercel-deployment-url>
NODE_ENV=production
```

⚠️ **CRITICAL**: 
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public (exposed in browser)
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to frontend - only use in server-side code
- Mark `SUPABASE_SERVICE_ROLE_KEY` as **Secret** in Vercel settings

3. Click **Save**

### 2.3 Configure Deployment Settings

1. Go to **Settings → Git**
2. Ensure:
   - Production Branch: `main`
   - Auto-deploy on push: Enabled
   - Framework: `Next.js`
3. Go to **Settings → Build & Development**
4. Build command: `npm run build`
5. Output directory: `.next`

## Step 3: Verify Deployment

### 3.1 Check Deployment Status

1. Go to **Deployments** tab in Vercel
2. Wait for the build to complete (should take 2-5 minutes)
3. Click on the production deployment to view logs
4. Verify no TypeScript or build errors

### 3.2 Test Public Routes

1. Visit your deployment URL (e.g., `https://mha-academy.vercel.app`)
2. Verify:
   - ✅ Home page loads
   - ✅ Navigation menu works
   - ✅ No console errors

### 3.3 Test Authentication Flow

1. Go to `/auth/register`
2. Create a test student account
3. Verify registration succeeds
4. Go to `/auth/login`
5. Login with the test account
6. Verify redirect to `/dashboard`

### 3.4 Test Admin Dashboard

1. Go back to Supabase
2. In **hma_profiles** table, find your test user
3. Change `role` from `student` to `director`
4. Save changes
5. In your app, go to `/admin`
6. Verify admin panel loads with:
   - ✅ Student/Exam/Mission/Event counters
   - ✅ Admin modules list
   - ✅ No unauthorized errors

### 3.5 Test Protected API Endpoints

Use curl or Postman to test (replace `YOUR_URL` with your Vercel domain):

```bash
# Test: Get current user profile (requires auth token)
curl -X GET "https://YOUR_URL/api/student/overview" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Expected: 200 OK with user profile data
# If unauthorized: 401 Unauthorized (correct behavior)

# Test: Get shop items (requires auth)
curl -X GET "https://YOUR_URL/api/student/shop" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Expected: 200 OK with available items
```

### 3.6 Test Permission Enforcement

1. Create a regular student account
2. Try accessing `/admin` while logged in as student
3. Verify you get a **403 Forbidden** or are redirected
4. Try calling `/api/admin/dashboard` as student
5. Verify you get **403 Forbidden** response

## Step 4: Database Backup & Monitoring

### 4.1 Enable Automatic Backups

1. In Supabase, go to **Settings → Backups**
2. Enable daily backups
3. Choose retention period (recommended: 30 days)

### 4.2 Set Up Monitoring

1. In Vercel, go to **Monitoring** (if available in your plan)
2. Enable error tracking
3. Set up alerts for failed deployments

### 4.3 Check Database Usage

1. In Supabase, go to **Settings → Database**
2. Verify:
   - ✅ Row count is reasonable
   - ✅ Storage usage is acceptable
   - ✅ No unexpected data growth

## Step 5: Final Checklist

- [ ] All Supabase migrations applied successfully
- [ ] All environment variables set in Vercel
- [ ] Home page loads without errors
- [ ] Student registration works
- [ ] Student login works
- [ ] Student dashboard accessible
- [ ] Admin panel accessible only to admin/director roles
- [ ] Protected API endpoints return 401 for unauthenticated users
- [ ] Protected API endpoints return 403 for non-authorized roles
- [ ] Database backups enabled
- [ ] No TypeScript or build errors in Vercel logs
- [ ] Custom domain configured (if applicable)

## Troubleshooting

### Build Fails with "Missing Environment Variables"

**Solution**: Ensure all three Supabase variables are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Then trigger a new deployment: **Deployments → ... → Redeploy**

### "Unauthorized" Errors on API Routes

**Solution**: 
1. Verify your auth token is valid
2. Check that your Supabase session cookie is present
3. Ensure RLS policies are correctly applied
4. Check Supabase logs for policy violation errors

### Database Queries Return Empty

**Solution**:
1. Verify migrations were applied completely
2. Check that tables exist in Supabase
3. Ensure RLS policies allow reads for your role
4. Check browser console for detailed error messages

### Admin Dashboard Shows "Forbidden"

**Solution**:
1. Verify your user role is set to `teacher` or `director` in `hma_profiles`
2. Check the `requireAdminAccess()` function is being called
3. Verify the Supabase service role key is set correctly

## Production Best Practices

1. **Never commit secrets** - All sensitive keys must be in Vercel environment variables
2. **Regular backups** - Enable automatic Supabase backups
3. **Monitor errors** - Set up Vercel error tracking and alerts
4. **Test updates** - Always test in a staging environment first
5. **Update dependencies** - Run `npm update` regularly and test
6. **Review logs** - Check Vercel and Supabase logs weekly
7. **RLS policies** - Never disable Row Level Security
8. **Database access** - Only expose data through properly secured API routes

## Support & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
