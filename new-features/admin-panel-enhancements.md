# Role-Based Access Control (RBAC) & Admin Panel

**Date:** March 8, 2026  
**Status:** ✅ Complete  
**Branch:** `fix/add_some_features`

---

## What Is This?

The ChainGuard Evidence Platform had a `UserRole` enum in the database schema (`ADMIN`, `SUPERVISOR`, `DETECTIVE`, `OFFICER`, `FORENSIC_TECH`, `READONLY`) but it was **barely enforced** — any logged-in user could see all cases, access admin functions, and edit anything.

This feature adds a **full RBAC system** that actually restricts what each role can see and do, enforced at every layer: API routes, database queries, and UI rendering. The admin panel is one outcome of this — it exists because RBAC created the need for a role-restricted management interface.

---

## Roles Explained — What Each Role Can Do

### ADMIN
- **Full access** to everything — all cases, all departments, all evidence
- Manage users (create, edit, delete, reset passwords)
- Assign roles and manage departments
- Delete cases and evidence
- Access admin panel, audit logs, system monitor
- Emergency override capability
- **Cannot** demote themselves or delete their own account (self-protection rule)

### SUPERVISOR
- See all cases in **their own department** + their own cases
- Create and assign cases within their department
- Upload, download, and verify evidence
- View audit logs
- **Cannot** access admin panel, manage users, or see other departments' cases

### DETECTIVE
- **Full access** to their own assigned cases
- **Read-only** access to other cases in their department
- Create cases, upload/download/verify evidence
- **Cannot** assign cases, delete anything, or access admin features

### OFFICER
- Same permissions as Detective
- Full access to own cases, read-only for department cases
- Create cases, upload/download/verify evidence
- **Cannot** assign cases, delete anything, or access admin features

### FORENSIC_TECH
- **Evidence-only** access across **all departments** (cross-department for lab/forensic work)
- Can verify evidence integrity
- **Cannot** create cases, upload/download evidence, or access admin features

### READONLY
- **Read-only** access where explicitly granted
- By default sees **no cases** (access filter blocks all)
- **Cannot** create, edit, or delete anything

---

## How RBAC Works — The Big Picture

### 1. Roles Flow Through the Entire Stack

```
Database (UserRole enum)
    ↓ 
Auth (NextAuth JWT — role & department stored in token)
    ↓
API Routes (hasPermission() checks on every request)
    ↓
Database Queries (buildCaseAccessFilter() limits what data is returned)
    ↓
UI Pages (conditional rendering based on role)
```

When a user logs in:
- NextAuth reads their `role` and `department` from the database
- These are embedded in the **JWT token** via auth callbacks (`src/lib/auth.ts`)
- The **session** carries `user.role` and `user.department` to every API call and page render
- Every API route and page checks permissions before doing anything

### 2. The Permission System (`src/lib/rbac.ts`)

Instead of checking roles directly (e.g., `if (role === 'ADMIN')`), the system uses **named permissions**. Each role maps to a set of permissions:

| Permission | ADMIN | SUPERVISOR | DETECTIVE | OFFICER | FORENSIC_TECH | READONLY |
|------------|:-----:|:----------:|:---------:|:-------:|:-------------:|:--------:|
| **MANAGE_USERS** | ✅ | | | | | |
| **ASSIGN_ROLES** | ✅ | | | | | |
| **VIEW_ALL_USERS** | ✅ | | | | | |
| **CREATE_CASE** | ✅ | ✅ | ✅ | ✅ | | |
| **ASSIGN_CASE** | ✅ | ✅ | | | | |
| **VIEW_ALL_CASES** | ✅ | | | | | |
| **VIEW_DEPARTMENT_CASES** | | ✅ | | | | |
| **MODIFY_ANY_CASE** | ✅ | | | | | |
| **DELETE_CASE** | ✅ | | | | | |
| **UPLOAD_EVIDENCE** | ✅ | ✅ | ✅ | ✅ | | |
| **DOWNLOAD_EVIDENCE** | ✅ | ✅ | ✅ | ✅ | | |
| **DELETE_EVIDENCE** | ✅ | | | | | |
| **VERIFY_EVIDENCE** | ✅ | ✅ | ✅ | ✅ | ✅ | |
| **VIEW_ALL_EVIDENCE** | ✅ | | | | ✅ | |
| **ACCESS_ADMIN_PANEL** | ✅ | | | | | |
| **VIEW_AUDIT_LOGS** | ✅ | ✅ | | | | |
| **MANAGE_DEPARTMENTS** | ✅ | | | | | |
| **EMERGENCY_OVERRIDE** | ✅ | | | | | |

**Why this design?** If you later want Supervisors to have `DELETE_CASE`, you add one string to the SUPERVISOR array — you don't need to find and change every `if` statement.

### 3. Case Access Filtering — What Each Role Actually Sees

The key function is `buildCaseAccessFilter()`. It returns a **Prisma `where` clause** that gets applied to every database query, so users only see cases they're allowed to see:

| Role | Cases Visible | How |
|------|--------------|-----|
| **ADMIN** | All cases, all departments | No filter applied |
| **SUPERVISOR** | Own department's cases + own cases | `WHERE department = userDepartment OR officerId = userId` |
| **DETECTIVE / OFFICER** | Own cases + department cases (read-only) | `WHERE officerId = userId OR department = userDepartment` |
| **FORENSIC_TECH** | All cases (evidence context only) | No filter, but UI limits to evidence views |
| **READONLY** | None by default | Filter blocks all (`id = 'never-match-readonly'`) |

This filter is used in the **Cases API** (`GET /api/cases`):
```typescript
const accessFilter = buildCaseAccessFilter(
  session.user.role,
  session.user.id,
  session.user.department
)

const cases = await prisma.case.findMany({
  where: { ...accessFilter, ...otherFilters }
})
```

### 4. Case Access Levels — What Each Role Can Do with a Case

`getCaseAccessLevel()` returns fine-grained access for a specific case:

| Role | Own Case | Same Department Case | Other Department | 
|------|----------|---------------------|------------------|
| **ADMIN** | FULL_ACCESS | FULL_ACCESS | FULL_ACCESS |
| **SUPERVISOR** | FULL_ACCESS | FULL_ACCESS | NO_ACCESS |
| **DETECTIVE / OFFICER** | FULL_ACCESS | READ_ONLY | NO_ACCESS |
| **FORENSIC_TECH** | EVIDENCE_ONLY | EVIDENCE_ONLY | EVIDENCE_ONLY |
| **READONLY** | READ_ONLY | READ_ONLY | READ_ONLY |

Access levels:
- **FULL_ACCESS** — view, edit, upload evidence, modify status
- **READ_ONLY** — view case details and evidence, nothing else
- **EVIDENCE_ONLY** — can only view and verify evidence (for lab work)
- **NO_ACCESS** — redirected, can't see the case at all

### 5. Department-Based Isolation

`canAccessDepartment()` checks cross-department access:
- **ADMIN** and **FORENSIC_TECH** can access all departments
- **SUPERVISOR**, **DETECTIVE**, **OFFICER** can only access their own department
- **READONLY** has no department access by default

### 6. Role Hierarchy

`isRoleHierarchyAbove()` prevents lower roles from managing higher roles:
```
ADMIN (5) > SUPERVISOR (4) > DETECTIVE (3) > OFFICER (2) > FORENSIC_TECH (1) > READONLY (0)
```
Used in the admin panel to prevent, e.g., a Supervisor from editing an Admin's account.

---

## Where RBAC Is Enforced (Every Layer)

### Layer 1 — Auth Session (JWT Token)
**File:** `src/lib/auth.ts`  
**What:** When a user logs in, their `role` and `department` are read from the database and stored in the JWT token. The `session` callback copies these to `session.user.role` and `session.user.department`, making them available everywhere.

### Layer 2 — API Routes (Server-Side)
Every admin API route checks permissions before executing:

| API Route | Permission Required | Check |
|-----------|-------------------|-------|
| `GET /api/admin/users` | `VIEW_ALL_USERS` | `hasPermission(role, 'VIEW_ALL_USERS')` |
| `POST /api/admin/users` | `MANAGE_USERS` | `hasPermission(role, 'MANAGE_USERS')` |
| `PUT /api/admin/users/[id]` | `MANAGE_USERS` | `hasPermission(role, 'MANAGE_USERS')` |
| `DELETE /api/admin/users/[id]` | `MANAGE_USERS` | `hasPermission(role, 'MANAGE_USERS')` |
| `POST /api/admin/users/[id]/reset-password` | `MANAGE_USERS` | `hasPermission(role, 'MANAGE_USERS')` |
| `GET /api/admin/departments` | `ACCESS_ADMIN_PANEL` | `hasPermission(role, 'ACCESS_ADMIN_PANEL')` |
| `GET /api/admin/activities` | `ACCESS_ADMIN_PANEL` | `hasPermission(role, 'ACCESS_ADMIN_PANEL')` |
| `GET /api/admin/activities/export` | `ACCESS_ADMIN_PANEL` | `hasPermission(role, 'ACCESS_ADMIN_PANEL')` |
| `GET /api/admin/system` | `ACCESS_ADMIN_PANEL` | `hasPermission(role, 'ACCESS_ADMIN_PANEL')` |
| `GET /api/cases` | (any authenticated) | `buildCaseAccessFilter()` limits returned data |
| `POST /api/cases` | `CREATE_CASE` | `hasPermission(role, 'CREATE_CASE')` |

Unauthorized requests get a `403 Forbidden` with a descriptive error message.

### Layer 3 — Database Queries (Prisma Filters)
The `buildCaseAccessFilter()` function generates Prisma `where` clauses so the database itself only returns rows the user is allowed to see. This is **defense in depth** — even if a UI bug shows the wrong page, the API only returns permitted data.

### Layer 4 — UI Rendering (Client-Side)

**Dashboard Layout** (`src/app/dashboard/layout.tsx`):
- The "Admin Panel" link in the sidebar/navbar only appears if `hasPermission(role, 'ACCESS_ADMIN_PANEL')` returns true
- Non-admin users never even see the link

**Admin Pages** (all pages in `src/app/dashboard/admin/`):
- Every admin page checks `hasPermission()` in both `useEffect` (redirect if unauthorized) and in the render (show "Access Denied" card)
- The Users page hides "Add User" button, bulk actions bar, and per-row action buttons if `!hasPermission(role, 'MANAGE_USERS')`
- A user with `VIEW_ALL_USERS` but not `MANAGE_USERS` can see the user list but can't edit/delete

### Self-Protection Rules
- Admins **cannot demote themselves** from the ADMIN role
- Admins **cannot delete their own account**
- Users **with assigned cases cannot be deleted** (must reassign first)

---

## What's Built on Top of RBAC — The Admin Panel

The RBAC system enables a proper admin interface. Here's what's available at each URL:

### Navigation
A horizontal tab bar wraps all admin pages (`src/app/dashboard/admin/layout.tsx`):
```
┌──────────────────────────────────────────────────────────────────────┐
│  Overview  │  Users  │  Departments  │  Audit Trail  │  System      │
└──────────────────────────────────────────────────────────────────────┘
```

### Pages

#### Overview (`/dashboard/admin`)
- 5 stat cards: Total Users, Departments, Active Cases, Evidence Items, System Health (live from `/api/admin/system`)
- Role distribution breakdown
- 4 quick-action cards linking to each section

#### User Management (`/dashboard/admin/users`)
- Full user table with search, role filter, department filter
- **CRUD modals:** Create, Edit, Delete, Reset Password (in `src/components/admin/`)
- **Bulk operations:** Checkbox selection → bulk role change or bulk delete
- Stats cards: total users, active users, officers, departments

#### Departments (`/dashboard/admin/departments`)
- Summary cards (total departments, personnel, active cases, evidence)
- Per-department cards showing member count, case stats, role pills

#### Audit Trail (`/dashboard/admin/activities`)
- Filter by activity type, user, date range
- Color-coded type badges (green=create, blue=update, red=delete)
- Pagination controls
- **CSV export** button → downloads via `GET /api/admin/activities/export`

#### System Monitor (`/dashboard/admin/system`)
- Database health banner (green/red with latency)
- Key metrics: users, cases, evidence, storage
- 7-day activity trend bar chart
- Distribution charts: cases by status, users by role, evidence by type, top activities

### Enhanced Activity Tracking
All user management APIs log **detailed metadata** with each activity:
```json
{
  "targetUserId": "abc-123",
  "targetEmail": "user@example.com",
  "changedFields": ["role", "department"],
  "changes": {
    "role": { "from": "OFFICER", "to": "DETECTIVE" }
  },
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0 ..."
}
```

---

## Reusable UI Components

These were created to support the admin panel but are available app-wide:

| Component | File | Purpose |
|-----------|------|---------|
| **DataTable** | `src/components/ui/DataTable.tsx` | Generic table with sorting, pagination, row selection, bulk actions |
| **Select / MultiSelect** | `src/components/ui/Select.tsx` | Styled dropdowns (single and multi-select) |
| **Breadcrumb** | `src/components/ui/Breadcrumb.tsx` | Navigation breadcrumbs (used on all admin pages) |
| **Modal** | `src/components/ui/Modal.tsx` | Reusable modal dialog base |

---

## Key Files

| File | What It Does |
|------|-------------|
| `src/lib/rbac.ts` | **Core RBAC engine** — permissions map, hasPermission(), buildCaseAccessFilter(), getCaseAccessLevel(), canAccessDepartment(), role hierarchy |
| `src/lib/auth.ts` | NextAuth config — injects role + department into JWT and session |
| `src/types/next-auth.d.ts` | TypeScript declarations to add role/department to session type |
| `src/app/api/cases/route.ts` | Cases API — uses buildCaseAccessFilter() + hasPermission('CREATE_CASE') |
| `src/app/dashboard/layout.tsx` | Dashboard layout — conditionally shows Admin link based on role |
| `src/app/api/admin/users/route.ts` | User CRUD — protected by VIEW_ALL_USERS / MANAGE_USERS |
| `src/app/api/admin/users/[id]/route.ts` | User update/delete — protected by MANAGE_USERS |
| `src/app/api/admin/users/[id]/reset-password/route.ts` | Password reset — protected by MANAGE_USERS |
| `src/app/api/admin/departments/route.ts` | Department stats — protected by ACCESS_ADMIN_PANEL |
| `src/app/api/admin/activities/route.ts` | Audit log — protected by ACCESS_ADMIN_PANEL |
| `src/app/api/admin/activities/export/route.ts` | CSV export — protected by ACCESS_ADMIN_PANEL |
| `src/app/api/admin/system/route.ts` | System health — protected by ACCESS_ADMIN_PANEL |

---

## Tech Stack

| Technology | Usage |
|------------|-------|
| Next.js 15 (App Router) | Pages, API routes, layouts |
| Prisma 6 + PostgreSQL | Database ORM, UserRole enum |
| NextAuth.js | Session management, JWT with role/department |
| bcryptjs | Password hashing |
| Tailwind CSS | Styling |
| lucide-react | Icons |

---

## Summary

RBAC is the backbone of this feature set. The `UserRole` schema field is now fully enforced:

1. **Admins** see everything and manage the platform via the admin panel
2. **Supervisors** manage their department's cases and can view audit logs
3. **Detectives and Officers** work on their own cases and see department cases (read-only)
4. **Forensic Techs** can only verify evidence across all cases
5. **Read-Only** users see nothing by default (access granted per case)

Every API route checks permissions. Every database query is scoped by role. The UI hides controls the user can't use. The admin panel is the management interface that makes this role system usable by administrators.
