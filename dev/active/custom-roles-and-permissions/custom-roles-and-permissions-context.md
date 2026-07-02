# Context — Custom Roles & Permissions

Last Updated: 2026-07-10

## Product decisions

- Admin-only areas (audit logs, IP whitelisting, screening providers, analytics
  filter settings) gate on **`ORGANIZATIONS_UPDATE`**.
- Role management lives in its **own settings tab** (not nested under Users).

## Key files

### API / models
- `packages/marble-api/openapis/marblecore-api/admin.yml` — `/roles` + `/roles/{roleId}/permissions` (needs `roleId` param fix)
- `packages/marble-api/src/generated/marblecore-api.ts` — generated client (`iamListRoles`, `iamCreateRole`, `iamUpdateRolePermissions`, `listRolesAndPermissions`)
- `packages/app-builder/src/models/user.ts` — `CurrentUser`, `NewPermissionsList()`, `UserPermissions`, `isAdmin/isAnalyst/isMarbleAdmin`, role label helpers
- `packages/app-builder/src/models/roles.ts` — **NEW** custom-role model + permission catalog

### Data layer
- `packages/app-builder/src/repositories/OrganizationRepository.ts` — add `listCustomRoles/createRole/updateRolePermissions`; keep `listRoles`
- `packages/app-builder/src/server-fns/roles.ts` — **NEW** server fns (MANAGE_ROLES guarded)
- `packages/app-builder/src/schemas/roles.ts` — **NEW** zod payloads
- `packages/app-builder/src/queries/settings/roles/*` — **NEW** query + mutations

### UI
- `packages/app-builder/src/routes/_app/_builder/settings/roles.tsx` — **NEW** route
- `packages/app-builder/src/components/Settings/Roles/*` — **NEW** RolesList / CreateRole / EditRolePermissions
- `packages/app-builder/src/services/settings-access.ts` — add `roles` section (own tab)
- `packages/app-builder/src/components/Settings/Navigation/Tabs.tsx` — add tab key
- `packages/app-builder/src/locales/{en,fr,ar}/settings.json` — role + permission labels

### Gating to migrate (Phase B)
- `packages/app-builder/src/services/feature-access.ts`
- `packages/app-builder/src/routes/_app/_builder.tsx` (sidebar)
- `packages/app-builder/src/services/settings-access.ts`
- ~45 call sites (see `grep 'isAdmin(\|isAnalyst(\|isMarbleAdmin('`)

## Existing patterns to follow
- Route + loader guard: `routes/_app/_builder/settings/users.tsx`
- Query-per-file + mutation: `queries/settings/users/create-user.ts`
- Modal + TanStack Form: `components/Settings/Users/CreateUser.tsx`
- MultiSelect via MenuCommand: `components/Settings/Users/RolesSelect.tsx`
- Table + CollapsiblePaper: `settings/users.tsx`

## Blocker
- `iamUpdateRolePermissions` generated without `roleId` param → fix `admin.yml`, regenerate.

## Open items to confirm with backend
- ADMIN role is seeded with `ORGANIZATIONS_UPDATE` and `MANAGE_ROLES`.
