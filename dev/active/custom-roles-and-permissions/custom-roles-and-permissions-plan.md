# Custom Roles & Permissions — Implementation Plan

Last Updated: 2026-07-10

## Executive Summary

Marble organizations can now define **custom roles** (backed by three new
endpoints in commit `6226b5`) and assign them to users. Two pieces of work
follow from this:

1. **Role management UI** — a new Settings tab where users with the
   `MANAGE_ROLES` permission can list custom roles, create roles, and edit each
   role's permission set.
2. **Role → permission migration** — the app currently gates UI on hard-coded
   roles (`isAdmin`, `isAnalyst`, `isMarbleAdmin`). Because a user may now hold a
   custom role that is neither ADMIN nor ANALYST, gating must move to
   **permission checks** (`user.permissions.canX`).

## Current State Analysis

- `models/user.ts`: `CurrentUser` already carries `roles: string[]` **and** a
  mapped `permissions: UserPermissions` (built from `credentials.permissions` via
  `NewPermissionsList()`). The PoC commit `5f5215d` already migrated most of
  `feature-access.ts` to permissions.
- **Still role-based** in `feature-access.ts`: `isReadUserAvailable`,
  `isReadAllInboxesAvailable`, `isReadTagAvailable` (`isAdmin || isMarbleAdmin`),
  `canAccessInboxesSettings` (`isAdmin`).
- **~45 direct call sites** of `isAdmin` / `isAnalyst` / `isMarbleAdmin` across
  route loaders, `settings-access.ts`, the sidebar (`_builder.tsx`), and case
  components.
- **Two role endpoints exist:**
  - `listRolesAndPermissions()` (PoC) → `{ roles: string[], permissions: string[] }`,
    role *names* for user assignment. Wired via `OrganizationRepository.listRoles()`.
    **Keep.**
  - `iamListRoles` / `iamCreateRole` / `iamUpdateRolePermissions` (new) → full
    `RoleAndPermissions` objects for role CRUD. **New feature.**
- **Blocker:** generated `iamUpdateRolePermissions` references `roleId` but does
  not declare it as a parameter — the OpenAPI path `/roles/{roleId}/permissions`
  is missing its `parameters:` entry. Must be fixed + regenerated first.

## Proposed Future State

- A `MANAGE_ROLES`-gated **Roles** settings tab (its own tab, per product
  decision) with list / create / edit-permissions.
- All UI gating driven by `user.permissions.*`. Admin-only areas with no
  domain-specific permission (audit logs, IP whitelisting, screening providers,
  analytics filter settings) gate on **`ORGANIZATIONS_UPDATE`** (product decision).
- Inbox-user `.role === 'admin'/'member'` (per-inbox concept) and `isMarbleAdmin`
  (platform super-admin / org switching) are **unchanged**.

## Implementation Phases

### Phase 0 — API spec fix (prerequisite)
Add the `roleId` path parameter to `/roles/{roleId}/permissions` in `admin.yml`
and regenerate the client so the signature is
`iamUpdateRolePermissions(roleId, dto, opts?)`.

### Phase A — Role management UI
- A1 Model (`models/roles.ts`) + permission catalog (grouped, i18n keys)
- A2 Repository methods (`listCustomRoles`, `createRole`, `updateRolePermissions`)
- A3 Zod schemas + server-fns (guarded by `MANAGE_ROLES`)
- A4 Query hooks (list + two mutations, invalidate list)
- A5 Route `settings/roles.tsx` (guarded loader)
- A6 Components (`RolesList`, `CreateRole`, `EditRolePermissions`)
- A7 Own settings tab in `settings-access.ts` + `Navigation/Tabs.tsx` + i18n

### Phase B — Role → permission migration
- B1 Extend `UserPermissions` mapping (`canManageRoles`, `canReadUser`,
  `canReadTags`, `canUpdateOrganization`, plus reads needed for gates)
- B2 Convert remaining role-based `feature-access.ts` helpers
- B3 Replace the ~45 `isAdmin`/`isAnalyst`/`isMarbleAdmin` call sites per mapping
- B4 Verify type-check + smoke test each migrated surface

## Permission mapping (Phase B)

| Current check | New permission |
|---|---|
| `isReadUserAvailable` | `MARBLE_USER_LIST` (`canReadUser`) |
| `isReadTagAvailable` | `TAG_READ` (`canReadTags`) |
| `isReadAllInboxesAvailable` / `canAccessInboxesSettings` | `INBOX_EDITOR` (`canEditInboxes`) `|| isInboxAdmin` |
| `isAnalyst` gate on detection/decisions | `DECISION_READ` |
| `isAnalyst` gate on data | `DATA_MODEL_READ` |
| `isAnalyst` gate on scenarios | `SCENARIO_READ` |
| `isAnalyst` gate on user-scoring | `SCORING_*` |
| `isAdmin` scenario settings | `SCENARIO_*` / `SCORING_UPDATE_SETTINGS` |
| `isAdmin` audit logs / IP whitelist / screening providers / analytics filters | **`ORGANIZATIONS_UPDATE`** |
| `MANAGE_ROLES` (new tab) | `MANAGE_ROLES` (`canManageRoles`) |

**Unchanged:** inbox-user `.role`; `isMarbleAdmin` (org switching).

## Risk Assessment & Mitigation

- **R1 — Over/under-permissioning after migration.** A wrong mapping hides or
  exposes UI. *Mitigate:* migrate one surface at a time, type-check + smoke test,
  keep the mapping table as the source of truth.
- **R2 — Admin-area permission mismatch.** `ORGANIZATIONS_UPDATE` may not be
  granted to every current ADMIN. *Mitigate:* confirm backend seeds it for ADMIN
  role before shipping Phase B.
- **R3 — Spec regen drift.** Regenerating the client may touch unrelated types.
  *Mitigate:* isolate the regen diff, review before commit.
- **R4 — Full permission array size.** Editing UI must handle ~60 permissions.
  *Mitigate:* group by domain in the catalog, checkbox groups.

## Success Metrics

- Users with `MANAGE_ROLES` can create a role and set its permissions end-to-end.
- No remaining `isAdmin`/`isAnalyst` gate on org-role semantics (inbox role +
  `isMarbleAdmin` excepted).
- `bun run type-check` passes for `app-builder` and `marble-api`.

## Dependencies & Resources

- Backend endpoints (commit `6226b5`) live.
- Backend must grant `ORGANIZATIONS_UPDATE` + `MANAGE_ROLES` to ADMIN role.
- oazapfts client regeneration tooling.

## Timeline (rough)

- Phase 0: S
- Phase A: L
- Phase B: L (spread across many files)
