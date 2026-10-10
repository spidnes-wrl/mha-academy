# MHA Academy - Security Policies

## Overview

This document outlines the security architecture and policies implemented in MHA Academy.

## Authentication & Authorization

### 1. Authentication Method

- **Provider**: Supabase Auth (uses Postgres auth tables)
- **Method**: Email/Password with session tokens
- **Session Storage**: HTTP-only cookies (secure by default)
- **Token Type**: JWT in cookies, not localStorage

### 2. Authorization Levels

#### Role-Based Access Control (RBAC)

```
student (base user)
├── Read: Own profile, public documents, public events
├── Write: Own profile, messages to unblocked users
└── Limited access to: Shop, academy resources

teacher (instructor)
├── All student permissions
├── Read: All profiles (name/public data only)
├── Write: Create missions, events, documents
├── Admin: Manage students in assignments
└── Access to: Admin dashboard

director (administrator)
├── All teacher permissions
├── Read: All data (audit access)
├── Write: All data with admin verification
├── Admin: Full system administration
└── Access to: Full admin dashboard, system settings
```

#### Class Ranks (Academic Hierarchy)

```
S - Strongest (hero class)
A - Advanced
B - Balanced
C - Common (default)
E - Emerging
```

Class ranks do NOT grant additional permissions, only indicate student level.

### 3. Protected Routes

**Public Routes** (no authentication required):
- `/` - Home page
- `/auth/login` - Login page
- `/auth/register` - Registration page

**Authenticated Routes** (any logged-in user):
- `/dashboard` - Student dashboard
- `/library` - Document library (public resources only)
- `/api/student/*` - Student-scoped API endpoints
- `/api/messages/*` - Messaging endpoints

**Admin Routes** (teacher/director only):
- `/admin` - Admin dashboard
- `/api/admin/*` - Admin-scoped API endpoints

## Data Protection

### 1. Sensitive Data Classification

**Public Data** (safe to expose to frontend):
- Username
- First/Last name
- Avatar URL
- Class rank
- Creation date
- Public profile info

**Private Data** (never exposed to unauthenticated users):
- Email address
- Virtual coins balance
- XP/Points
- Role
- Internal user ID (use public ID instead)
- Transaction history
- Private documents

**Admin-Only Data** (restricted to director/teacher):
- User roles
- User emails
- Financial transactions
- Admin logs
- System configuration

### 2. Data Visibility Rules

#### Profile Data
```javascript
// Public profile visibility
if (profile.is_public && !isBlocked) {
  // Return: id, username, first_name, last_name, avatar_url, class_rank, created_at
} else if (profile.is_private) {
  // Return: Limited public data only
} else if (isAdmin) {
  // Return: All profile data
}
```

#### Messages
```javascript
// Message visibility
if (isParticipant || isAdmin) {
  // Can read message
} else {
  // 403 Forbidden
}
```

#### Documents
```javascript
// Document visibility
if (document.access_level === 'public') {
  // All authenticated users can read
} else if (document.access_level === 'private' && isTeacher) {
  // Only teachers/directors can read
} else {
  // 403 Forbidden
}
```

### 3. Point/Balance Protection

**Virtual Coins**:
- Stored server-side in `hma_profiles.virtual_coins`
- Never passed to frontend except as JSON response
- Modified only through verified `/api/*/shop` endpoints
- All transactions logged in `hma_point_transactions`

**XP/Exam Points**:
- Stored server-side only
- Modified only by authorized administrators
- All changes audited

## Row Level Security (RLS)

### 1. RLS Policy Architecture

All tables use PostgreSQL Row Level Security to enforce data access at database level.

**Example: hma_profiles**
```sql
-- Users see own profile
CREATE POLICY "Users can read own profile"
  ON hma_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Admins see all profiles
CREATE POLICY "Admins can read all profiles"
  ON hma_profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM hma_profiles p
    WHERE p.user_id = auth.uid() AND p.role IN ('teacher','director')
  ));
```

### 2. Protected Tables

- ✅ `hma_profiles` - User profiles
- ✅ `hma_messages` - Private messages
- ✅ `hma_groups` - Group membership
- ✅ `hma_user_blocks` - Block lists
- ✅ `hma_documents` - Access-controlled documents
- ✅ `hma_shop_items` - Shop catalog (public, but transactions protected)
- ✅ `hma_point_transactions` - Transaction history
- ✅ `hma_missions` - Mission data
- ✅ `hma_events` - Event data
- ✅ `hma_rules` - System rules (admin only)

### 3. RLS Enforcement

**Database Level**:
- RLS enabled on all sensitive tables
- Policies enforce user isolation
- Admin bypass for authorized operations

**API Level** (Defense in Depth):
- Server-side permission checks in route handlers
- Role-based access control
- Request validation

## Environment Variables & Secrets

### 1. Public Variables (safe to expose)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
NEXT_PUBLIC_APP_URL=https://mha-academy.vercel.app
```

**These are visible in browser** - do not put secrets here.

### 2. Private Variables (server-only)

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
NODE_ENV=production
```

**These must NEVER be exposed to frontend**.

### 3. Key Management

- Service Role Key: Server-only, used for admin operations
- Anon Key: Public, used for normal user operations
- Never commit `.env.local` or `.env.production`
- Rotate keys every 90 days in production
- Immediately rotate if compromised

## API Security

### 1. Authentication Checks

All API routes start with:
```typescript
const user = await requireAuthenticatedUser();
if (!user) return 401 Unauthorized;
```

### 2. Authorization Checks

Admin routes verify:
```typescript
await requireAdminAccess();
// Throws 403 Forbidden if not admin
```

### 3. Input Validation

All API endpoints validate input:
```typescript
// Validate request body
const payload = validateMessagePayload(body);

// Sanitize strings
const content = String(payload.content ?? '').trim();

// Verify data types
const amount = Number(payload.amount ?? 0);
```

### 4. Rate Limiting

**Current**: Vercel default rate limits apply.
**Recommended for Production**:
- Login attempts: 5/minute per IP
- API calls: 100/minute per user
- File uploads: 10/minute per user

## Blocking & Privacy

### 1. User Blocking

- User can block other users
- Blocked users cannot message blocker
- Blocking is one-way (both directions possible)
- Blocking is immediate, no notification

**Database enforcement**:
```sql
-- Prevent messages to blocked users
CREATE POLICY "Cannot message blocked users"
  ON hma_messages FOR INSERT
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM hma_user_blocks
      WHERE user_id = new.sender_id AND blocked_user_id = new.receiver_id
    )
  );
```

### 2. Profile Privacy

- `is_public` flag controls profile visibility
- Private profiles only visible to:
  - The profile owner
  - Administrators
  - (Users with specific permission if implemented)

### 3. Group Privacy

- Public groups: All authenticated users can see
- Private groups: Only members can see
- Group owner controls who joins

## Audit & Logging

### 1. Transaction Logging

All point transactions logged:
- User ID
- Amount
- Type (purchase, reward, etc.)
- Balance before/after
- Timestamp

### 2. Access Logging

**Recommended**:
- Log all admin API calls
- Log all document accesses
- Log all permission denials (403)

**Example**:
```typescript
const { error } = await supabase
  .from('hma_audit_logs')
  .insert({
    user_id: user.id,
    action: 'admin_dashboard_accessed',
    timestamp: new Date(),
  });
```

### 3. Error Logging

- Log all 5xx errors
- Log all permission violations
- Log database errors
- Do NOT log sensitive data

## Security Checklist

### Development
- [ ] All routes have auth checks
- [ ] Admin routes have admin checks
- [ ] Input validation on all endpoints
- [ ] No secrets in code
- [ ] No secrets in git history
- [ ] TypeScript strict mode enabled
- [ ] No console.log of sensitive data
- [ ] HTTPS enforced (production only)

### Before Deployment
- [ ] Environment variables configured
- [ ] Database RLS enabled
- [ ] Service role key in server only
- [ ] Rate limiting configured
- [ ] CORS configured appropriately
- [ ] Security headers configured
- [ ] Error pages don't expose system info

### Production
- [ ] SSL/TLS certificate valid
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] CORS whitelist configured
- [ ] Rate limiting enabled
- [ ] Monitoring enabled
- [ ] Backups enabled
- [ ] Access logs reviewed weekly

## Incident Response

### 1. Suspected Data Breach

1. Immediately revoke compromised tokens
2. Force password reset for affected users
3. Review access logs
4. Notify users if required by regulation
5. Rotate all API keys
6. Deploy patched version

### 2. Suspected Unauthorized Access

1. Check admin activity logs
2. Review permission changes
3. Verify all admin accounts
4. Check for unusual API calls
5. Review database audit logs
6. Consider temporary lockdown while investigating

### 3. DDoS or Performance Attack

1. Enable rate limiting
2. Consider geographic restrictions
3. Increase resource allocation
4. Review traffic logs
5. Contact infrastructure provider

## Compliance Notes

### GDPR (if applicable)
- User data deletion implemented
- User data export capability
- Privacy policy available
- Consent mechanisms in place

### Data Retention
- Transaction logs: 2 years
- Access logs: 1 year
- User data: Until account deletion
- Backups: 30 days

## Questions & Support

For security concerns, contact: (your-contact-info)

Do NOT post security issues publicly. Use responsible disclosure.
