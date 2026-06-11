# Admin Role-Based Access Control (RBAC)

How admin-only access works across the AV Creation stack, and what was added
for the frontend `/admin` area.

## Summary

RBAC was **already implemented on the backend** (Express). This change adds the
**frontend route protection** that was missing: a reusable guard plus the
`/admin` and `/admin/dashboard` protected routes, with redirects for
unauthenticated and non-admin users.

## How it fits together

```
Browser  ──GET /api/auth/me (httpOnly av_token cookie)──▶  Express
   ▲                                                          │
   │   { user: { …, role: "USER" | "ADMIN" } }  ◀────────────┘
   │
<AdminGuard>  decides: render | redirect to /login | redirect to /
```

Role lives in the database and is surfaced on the **session response**, not baked
into the JWT — see "Why role is not in the JWT" below.

## Backend (already in place — unchanged)

- **Schema** — `backend/prisma/models/user.prisma`:
  ```prisma
  model User {
    role Role @default(USER)
    ...
  }
  enum Role { USER  ADMIN }
  ```
- **Session carries role** — `GET /api/auth/me` returns `user.role`
  (`backend/src/routes/auth.ts`, `serializeSessionUser`).
- **Server-side guard** — `requireAdmin` in
  `backend/src/middleware/authMiddleware.ts` verifies the `av_token` JWT, then
  reads the user's role **fresh from the DB** and rejects non-admins with `403`.
  Already applied to the admin review routes (`backend/src/routes/reviews.ts`).
- **Seeded admin** — `backend/prisma/seed.ts` creates
  `admin@avcreation.test` / `+919811111111` with `role: ADMIN`.

> The frontend guard is a UX gate. Every admin **API** route is independently
> protected by `requireAdmin`, so the data is never exposed even if the client
> guard is bypassed.

## Frontend (added in this change)

| File | What |
|---|---|
| `app/components/auth/AdminGuard.tsx` | **New.** Reusable client guard. Re-checks the session via `getSession()` on every mount and redirects as needed. |
| `app/admin/page.tsx` | **New.** Protected admin landing page (links to sections). No dashboard features. |
| `app/admin/dashboard/page.tsx` | **New.** Protected dashboard placeholder. No features yet. |
| `app/admin/reviews/page.tsx` | **Refactored** to use `AdminGuard` (now redirects instead of showing an inline "Restricted" message; gating logic de-duplicated). |
| `app/styles/admin.css` | Added `.admin-card*` styles for the admin landing grid. |

### AdminGuard redirect policy

| Visitor | Result |
|---|---|
| Not signed in | full redirect to `/login?next=<current path>` (full redirect so the cross-origin Google OAuth flow honours `next`) |
| Signed in, role ≠ `ADMIN` | `router.replace("/")` → Home (no history entry, so Back doesn't bounce them back) |
| Signed in, role = `ADMIN` | renders the page; the `SessionUser` is passed to render-prop children |

### Usage

```tsx
import AdminGuard from "../components/auth/AdminGuard";

export default function SomeAdminPage() {
  return (
    <AdminGuard>
      {/* admin-only UI; or use a render prop to read the user: */}
      {(user) => <p>Signed in as {user.email}</p>}
    </AdminGuard>
  );
}
```

## Why protection survives refresh / reload / logout-login

There is **no client-cached admin flag**. `AdminGuard` calls
`GET /api/auth/me` on every mount, which reads the `httpOnly` `av_token` cookie:

- **Page refresh / browser reload** — component remounts → session re-checked.
- **Logout** — `POST /api/auth/logout` clears the cookie; the next `/api/auth/me`
  returns `401` → guard redirects to `/login`.
- **Login as a different user** — a new cookie is issued; `/api/auth/me` returns
  that user's current role.

## Why role is not in the JWT

The `av_token` JWT carries only `{ id, email, name }` and lives for 7 days. Role
is read from the DB on each `requireAdmin` / `/api/auth/me` call instead. This
means **a demotion (ADMIN → USER) takes effect immediately**, rather than waiting
up to 7 days for the token to expire. The "session contains the role" requirement
is satisfied via the session endpoint, with stronger revocation semantics than an
embedded claim would give.

## Manual verification

1. Sign in as the seeded admin (`+919811111111`, dev OTP is logged/returned) →
   `/admin` and `/admin/dashboard` render.
2. Refresh / reload either page → still rendered (no flash of content for
   non-admins; guard shows "Checking access…" first).
3. Sign in as an ordinary user → visiting `/admin` redirects to Home.
4. Sign out, then visit `/admin` → redirects to `/login?next=/admin`; after
   logging back in as admin you land back on `/admin`.
```
