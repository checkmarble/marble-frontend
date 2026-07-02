# Tasks — Custom Roles & Permissions

Last Updated: 2026-07-10

## Phase 0 — API spec fix
- [x] Add `roleId` path param to `/roles/{roleId}/permissions` in `admin.yml` (S)
- [x] Regenerate client; confirm `iamUpdateRolePermissions(roleId, dto, opts?)` (S)
- [x] (User removed duplicate PoC `/roles`; repointed `listRoles()` at `iamListRoles`)

## Phase A — Role management UI
- [x] A1 `models/roles.ts`: `CustomRole`, `RolesAndPermissions`, adapters (M)
- [x] A1 Permission catalog grouped by domain (`permissionGroups`/`groupPermissions`) (M)
- [x] A2 `OrganizationRepository`: `listCustomRoles`, `createRole`, `updateRolePermissions` (S)
- [x] A3 `schemas/roles.ts` zod payloads (S)
- [x] A3 `server-fns/roles.ts` guarded by `canManageRoles` (M)
- [x] A4 `queries/settings/roles/{create-role,update-role-permissions}.ts` (S)
- [x] A5 `routes/_app/_builder/settings/roles.tsx` with guarded loader (M)
- [x] A6 `components/Settings/Roles/CreateRole.tsx` (M)
- [x] A6 `components/Settings/Roles/EditRolePermissions.tsx` (L)
- [x] A7 Add `roles` own tab to `settings-access.ts` + `Navigation/Tabs.tsx` (S)
- [x] A7 i18n keys en/fr/ar (M)
- [x] A route tree regenerated; app-builder + marble-api type-check pass

## Phase B — Role → permission migration
- [x] B1 Extend `NewPermissionsList()` (`canManageRoles`, `canReadUser`, `canReadTags`,
      `canReadDecisions`, `canReadScenarios`, `canReadDataModel`, `canUpdateOrganization`,
      `canManageScoring`, `canReadContinuousScreening`) (S)
- [x] B2 Convert `feature-access.ts` role-based helpers to permissions + add section
      capability helpers (`canAccessScenarios/Decisions/DataModel/UserScoring/ContinuousScreeningSection`) (S)
- [x] B3 Migrate `settings-access.ts` gates → `canUpdateOrganization` / inbox perms (S)
- [x] B3 Migrate sidebar `_builder.tsx` `isAnalyst` gates → capability helpers (M)
- [x] B3 Migrate route-loader `isAdmin`/`isAnalyst` guards (L)
- [x] B3 Migrate case/component call sites (M)
- [x] B4 `bun run type-check` app-builder + marble-api pass; biome clean (S)
- [ ] B4 Runtime smoke test each migrated surface (M) — pending

## Verification
- [x] Type-check + biome + 3-locale key parity green
- [ ] Create role + set permissions end-to-end (runtime)
- [ ] Non-`MANAGE_ROLES` user cannot see/reach Roles tab (runtime)
- [x] No org-role `isAdmin`/`isAnalyst` gates remain (inbox role + `isMarbleAdmin` excepted;
      `isAdmin`/`isAnalyst`/`isMarbleAdmin` defs now unused but kept in `models/user.ts`)

## ⚠️ Mapping assumptions to verify against backend
The migration encodes these assumptions about the standard roles' permission sets:
- ADMIN holds `ORGANIZATIONS_UPDATE` (audit, IP allow-list, screening providers,
  scenario settings, timezone-setup hint) and `MANAGE_ROLES`.
- ANALYST lacks `SCENARIO_READ` / `DECISION_READ` / `DATA_MODEL_READ` /
  `SCORING_UPDATE_SETTINGS` / `CONTINUOUS_SCREENING_CONFIG_READ` (used to hide the
  builder/data/decisions/scoring/monitoring surfaces from analysts).
- "Case-manager admin" affordances (escalate, screening-hit dismiss, `isUserAdmin`)
  mapped to `INBOX_EDITOR` (`canEditInboxes`) — a coarse fit; could be split into finer
  permissions (e.g. `CONTINUOUS_SCREENING_HIT_DISMISS`) later.
