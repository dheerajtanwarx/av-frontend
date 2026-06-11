# Admin Panel — Layout & Navigation

The shared shell (sidebar + topbar + content) for every `/admin/*` route. Built
on the storefront's "Pink City" design tokens (`app/styles/theme.css`). No data
or APIs are wired up yet — pages are placeholders.

## Structure

```
app/admin/layout.tsx              ← applies the shell to all /admin/* routes
  └─ components/admin/AdminLayout.tsx   ← client shell (wraps AdminGuard)
       ├─ AdminSidebar.tsx              ← nav + active highlighting
       ├─ AdminProfileMenu.tsx         ← profile dropdown + logout
       ├─ nav.ts                        ← single source of truth for nav items
       └─ icons.tsx                     ← admin nav icons
```

Because the shell lives in `app/admin/layout.tsx`, it **persists across admin
navigations** — moving between sections doesn't re-mount the sidebar or re-run
the auth check (Next.js App Router layout behaviour).

## Auth

`AdminLayout` wraps everything in `<AdminGuard>` (see `ADMIN_RBAC.md`). The
chrome only paints for a signed-in `ADMIN`; everyone else is redirected
(`/login` or `/`) before any panel UI renders. The guarded admin user is handed
to the layout via AdminGuard's render-prop and used by the profile menu.

## Navigation

`components/admin/nav.ts` defines `ADMIN_NAV` (label + href + icon) — the one
place to edit nav items. Both the sidebar and the topbar title read from it.

| Link | Route |
|---|---|
| Dashboard | `/admin/dashboard` |
| Orders | `/admin/orders` |
| Products | `/admin/products` |
| Customers | `/admin/customers` |
| Inventory | `/admin/inventory` |
| Reviews | `/admin/reviews` *(already functional — review moderation)* |
| Reports | `/admin/reports` |
| Settings | `/admin/settings` |

- `/admin` redirects to `/admin/dashboard`.
- **Active highlighting**: `activeNavItem(pathname)` (in `nav.ts`) matches the
  current `usePathname()` by exact path or prefix, so the highlight is correct
  after refresh, deep-link, or back/forward — not just on click.
- `/admin/reviews` keeps its existing moderation UI; it was adapted to the new
  page shell (its own `Header`/`AdminGuard` were removed since the layout now
  provides them). A `/admin/settings` placeholder was added so the eighth nav
  link doesn't 404.

## Responsiveness

- **Desktop (> 900px)**: fixed 252px sidebar, scrolling content, sticky topbar.
- **Mobile (≤ 900px)**: sidebar becomes an off-canvas drawer. A hamburger in the
  topbar opens it; a dimmed overlay or any nav link / route change closes it.
  The profile name collapses to just the avatar.

All styling is in `app/styles/admin-layout.css` (imported via `globals.css`).

## Profile dropdown & logout

`AdminProfileMenu` shows the admin's avatar (initials) + name. The dropdown lists
the signed-in identity with an "Administrator" badge, a **View storefront** link,
and **Log out**. Logout calls `POST /api/auth/logout` then hard-redirects to
`/login` (so `AdminGuard` re-checks on the way back). Closes on outside-click,
matching the storefront `AccountMenu`.

## Not done yet (by design)

No API wiring, no dashboard metrics, no tables/forms — just the shell, navigation
and placeholders.
