import { Page } from '@app-builder/components';
import { SettingCard } from '@app-builder/components/Settings/settingCard';
import { CreateUser } from '@app-builder/components/Settings/Users/CreateUser';
import { EditOrganizationUser } from '@app-builder/components/Settings/Users/EditOrganizationUser';
import { GrantAccess } from '@app-builder/components/Settings/Users/GrantAccess';
import { RevokeAccess } from '@app-builder/components/Settings/Users/RevokeAccess';
import { type UserRoleOption } from '@app-builder/components/Settings/Users/UserRoleSelector';
import { Spinner } from '@app-builder/components/Spinner';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type TenantUser, type User } from '@app-builder/models';
import { tKeyForUserRole } from '@app-builder/models/user';
import { useTenantUsersWithoutAccessQuery } from '@app-builder/queries/settings/users/get-tenant-users-without-access';
import { useOrganizationUsersTfaQuery } from '@app-builder/queries/settings/users/get-users-tfa';
import {
  getUserRoles,
  isAccessible,
  isCreateUserAvailable,
  isDeleteUserAvailable,
  isEditUserAvailable,
  isReadUserAvailable,
} from '@app-builder/services/feature-access';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { createColumnHelper } from '@tanstack/react-table';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import type { MarbleTableFeatures } from 'ui-design-system';
import { Button, Tag, useTable } from 'ui-design-system';

const usersLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function usersLoader({ context }) {
    const { user, inbox, entitlements } = context.authInfo;

    if (!isReadUserAvailable(user)) throw redirect({ to: '/' });

    const [inboxUsers, customRolesResult] = await Promise.all([
      inbox.listAllInboxUsers(),
      context.authInfo.apiClient.listCustomRoles().then(
        (roles) => ({ roles, error: false }),
        () => ({ roles: [], error: true }),
      ),
    ]);

    const inboxUsersByUserId = R.pipe(
      inboxUsers,
      R.groupBy(({ userId }) => userId),
      R.mapValues((value) =>
        R.pipe(
          value,
          R.groupBy((v) => v.role),
          R.mapValues((v) => v.length),
          R.entries(),
        ),
      ),
    );

    return {
      inboxUsersByUserId,
      user,
      entitlements,
      userRoles: getUserRoles(entitlements),
      customRoles: customRolesResult.roles,
      customRolesError: customRolesResult.error,
      isCreateUserAvailable: isCreateUserAvailable(user),
      isEditUserAvailable: isEditUserAvailable(user),
      isDeleteUserAvailable: isDeleteUserAvailable(user),
    };
  });

export const Route = createFileRoute('/_app/_builder/settings/users')({
  loader: () => usersLoader(),
  component: Users,
});

const columnHelper = createColumnHelper<MarbleTableFeatures, User>();

function Users() {
  const { t } = useTranslation(['settings', 'cases']);
  const router = useRouter();
  const {
    inboxUsersByUserId,
    user,
    entitlements,
    userRoles: builtInRoles,
    customRoles,
    customRolesError,
    isCreateUserAvailable,
    isEditUserAvailable,
    isDeleteUserAvailable,
  } = Route.useLoaderData();
  const { orgUsers } = useOrganizationUsers();

  const customRoleNames = useMemo(() => new Map(customRoles.map(({ slug, name }) => [slug, name])), [customRoles]);
  const userRoles = useMemo<UserRoleOption[]>(
    () => [
      ...builtInRoles.map((role) => ({ value: role, label: t(tKeyForUserRole(role)) })),
      ...(isAccessible(entitlements.userRoles)
        ? customRoles.map(({ slug, name }) => ({ value: slug, label: name }))
        : []),
    ],
    [builtInRoles, customRoles, entitlements.userRoles, t],
  );

  const tfaQuery = useOrganizationUsersTfaQuery();
  const tfaByUserId = useMemo(
    () => new Map((tfaQuery.data ?? []).map((u) => [u.userId, u.tfaEnabled])),
    [tfaQuery.data],
  );

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
        id: 'name',
        header: t('settings:users.name'),
        size: 150,
      }),
      columnHelper.accessor((row) => row.email, {
        id: 'email',
        header: t('settings:users.email'),
        size: 150,
        cell: ({ getValue }) => <div className="overflow-hidden text-ellipsis">{getValue()}</div>,
      }),
      columnHelper.accessor((row) => row.roles, {
        id: 'role',
        header: t('settings:users.role'),
        size: 150,
        cell: ({ getValue }) =>
          getValue()
            .map(({ role }) => customRoleNames.get(role) ?? (role.startsWith('org/') ? role : t(tKeyForUserRole(role))))
            .join(', '),
      }),
      columnHelper.accessor((row) => row.userId, {
        id: 'tfa',
        header: t('settings:users.tfa'),
        size: 120,
        cell: ({ getValue }) => {
          if (tfaQuery.isPending) return <Spinner className="size-4" />;
          const enabled = tfaByUserId.get(getValue());
          if (enabled === undefined) return <span className="text-grey-secondary">-</span>;
          return enabled ? (
            <Tag color="green">{t('settings:users.tfa.enabled')}</Tag>
          ) : (
            <Tag color="grey">{t('settings:users.tfa.disabled')}</Tag>
          );
        },
      }),
      columnHelper.accessor((row) => row.userId, {
        id: 'inbox_user_role',
        header: t('settings:users.inbox_user_role'),
        size: 200,
        cell: ({ getValue }) => {
          const inboxUsers = inboxUsersByUserId[getValue()];
          if (!inboxUsers) return null;

          return (
            <ul>
              {inboxUsers.map(([role, count]) => {
                return <li key={role}>{t(tKeyForInboxUserRole(role), { count })}</li>;
              })}
            </ul>
          );
        },
      }),
      ...(isDeleteUserAvailable || isEditUserAvailable
        ? [
            columnHelper.display({
              id: 'actions',
              size: 50,
              cell: ({ cell }) => {
                const orgUser = cell.row.original;
                // Admins cannot change or revoke their own access
                if (orgUser.userId === user.actorIdentity.userId) return null;

                return (
                  <div className="flex gap-sm">
                    {isEditUserAvailable ? (
                      <div className="group-hover:text-grey-primary focus-within:text-grey-primary text-transparent">
                        <EditOrganizationUser
                          user={orgUser}
                          userRoles={userRoles}
                          access={entitlements.userRoles}
                          roleLabels={customRoleNames}
                        />
                      </div>
                    ) : null}
                    {isDeleteUserAvailable ? (
                      <div className="group-hover:text-grey-primary focus-within:text-grey-primary text-transparent">
                        <RevokeAccess userId={orgUser.userId} />
                      </div>
                    ) : null}
                  </div>
                );
              },
            }),
          ]
        : []),
    ];
  }, [
    inboxUsersByUserId,
    customRoleNames,
    isDeleteUserAvailable,
    isEditUserAvailable,
    t,
    user.actorIdentity.userId,
    userRoles,
    entitlements.userRoles,
    tfaByUserId,
    tfaQuery.isPending,
  ]);

  const table = useTable({
    data: orgUsers,
    columns,
    columnResizeMode: 'onChange',

    enableSorting: false,
  });

  return (
    <Page.Content width="readable">
      {customRolesError ? (
        <div role="alert" className="flex items-center gap-sm">
          <span>{t('settings:custom_roles.load_error')}</span>
          <Button variant="secondary" appearance="stroked" onClick={() => void router.invalidate()}>
            {t('settings:custom_roles.retry')}
          </Button>
        </div>
      ) : null}
      <SettingCard
        table={table}
        addButton={
          isCreateUserAvailable ? (
            <CreateUser orgId={user.organizationId} access={entitlements.userRoles} userRoles={userRoles} />
          ) : null
        }
      />
      {isEditUserAvailable ? <TenantUsersWithoutAccess userRoles={userRoles} access={entitlements.userRoles} /> : null}
    </Page.Content>
  );
}

const tenantUserColumnHelper = createColumnHelper<MarbleTableFeatures, TenantUser>();

// Users of the organization's tenant who have no access to this organization yet.
function TenantUsersWithoutAccess({
  userRoles,
  access,
}: {
  userRoles: readonly UserRoleOption[];
  access: FeatureAccessLevelDto;
}) {
  const { t } = useTranslation(['settings', 'common']);
  const usersQuery = useTenantUsersWithoutAccessQuery();

  const columns = useMemo(
    () => [
      tenantUserColumnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
        id: 'name',
        header: t('settings:users.name'),
        size: 150,
      }),
      tenantUserColumnHelper.accessor((row) => row.email, {
        id: 'email',
        header: t('settings:users.email'),
        size: 200,
        cell: ({ getValue }) => <div className="overflow-hidden text-ellipsis">{getValue()}</div>,
      }),
      tenantUserColumnHelper.display({
        id: 'actions',
        size: 120,
        cell: ({ cell }) => <GrantAccess userId={cell.row.original.userId} userRoles={userRoles} access={access} />,
      }),
    ],
    [t, userRoles, access],
  );

  const table = useTable({
    data: usersQuery.data ?? [],
    columns,
    columnResizeMode: 'onChange',
    enableSorting: false,
  });

  if (usersQuery.isError && !usersQuery.data) {
    return (
      <SettingCard title={t('settings:users.tenant_users_without_access')}>
        <div className="flex flex-col items-start gap-sm">
          <p role="alert" className="text-s text-grey-secondary">
            {t('common:generic_fetch_data_error')}
          </p>
          <Button type="button" variant="secondary" onClick={() => void usersQuery.refetch()}>
            {t('common:retry')}
          </Button>
        </div>
      </SettingCard>
    );
  }

  // Most tenants hold a single organization: only show the section when there is someone to add.
  if (!usersQuery.data || usersQuery.data.length === 0) return null;

  return <SettingCard title={t('settings:users.tenant_users_without_access')} table={table} />;
}

const tKeyForInboxUserRole = (role: string) => {
  switch (role) {
    case 'admin':
      return 'settings:users.inbox_user_role.admin_count';
    case 'member':
      return 'settings:users.inbox_user_role.member_count';
    default:
      return 'settings:users.inbox_user_role.unknown';
  }
};
