import { CollapsiblePaper, Page } from '@app-builder/components';
import { type User } from '@app-builder/models';
import { CreateUser } from '@app-builder/routes/ressources+/settings+/users+/create';
import { DeleteUser } from '@app-builder/routes/ressources+/settings+/users+/delete';
import { UpdateUser } from '@app-builder/routes/ressources+/settings+/users+/update';
import {
  getUserRoles,
  isCreateUserAvailable,
  isDeleteUserAvailable,
  isEditUserAvailable,
  isReadUserAvailable,
} from '@app-builder/services/feature-access';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Table, useTable } from 'ui-design-system';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { user, inbox, entitlements } = await authService.isAuthenticated(
    request,
    { failureRedirect: getRoute('/sign-in') },
  );

  if (!isReadUserAvailable(user)) return redirect(getRoute('/'));

  const inboxUsers = await inbox.listAllInboxUsers();

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

  return json({
    inboxUsersByUserId,
    user,
    entitlements,
    userRoles: getUserRoles(entitlements),
    isCreateUserAvailable: isCreateUserAvailable(user),
    isEditUserAvailable: isEditUserAvailable(user),
    isDeleteUserAvailable: isDeleteUserAvailable(user),
  });
}

const columnHelper = createColumnHelper<User>();

export default function Users() {
  const { t } = useTranslation(['settings', 'cases']);
  const {
    inboxUsersByUserId,
    user,
    entitlements,
    userRoles,
    isCreateUserAvailable,
    isEditUserAvailable,
    isDeleteUserAvailable,
  } = useLoaderData<typeof loader>();
  const { orgUsers } = useOrganizationUsers();

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
        cell: ({ getValue }) => (
          <div className="overflow-hidden text-ellipsis">{getValue()}</div>
        ),
      }),
      columnHelper.accessor((row) => row.role, {
        id: 'role',
        header: t('settings:users.role'),
        size: 150,
        cell: ({ getValue }) => t(tKeyForUserRole(getValue())),
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
                return (
                  <li key={role}>{t(tKeyForInboxUserRole(role), { count })}</li>
                );
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
                return (
                  <div className="flex gap-2">
                    {isEditUserAvailable ? (
                      // TODO: inject trigger inside <UpdateUser /> and use style directly on it (so we can remove the container div) */}
                      <div className="group-hover:text-grey-100 focus-within:text-grey-100 text-transparent">
                        <UpdateUser
                          user={cell.row.original}
                          userRoles={userRoles}
                        />
                      </div>
                    ) : null}
                    {isDeleteUserAvailable ? (
                      // TODO: inject trigger inside <DeleteUser /> and use style directly on it (so we can remove the container div) */}
                      <div className="group-hover:text-grey-100 focus-within:text-grey-100 text-transparent">
                        <DeleteUser
                          userId={cell.row.original.userId}
                          currentUserId={user.actorIdentity.userId}
                        />
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
    isDeleteUserAvailable,
    isEditUserAvailable,
    t,
    user.actorIdentity.userId,
    userRoles,
  ]);

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: orgUsers,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Page.Container>
      <Page.Content className="max-w-screen-xl">
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:users')}</span>
            {isCreateUserAvailable ? (
              <CreateUser
                orgId={user.organizationId}
                canEditRoles={entitlements.userRoles}
                userRoles={userRoles}
              />
            ) : null}
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <Table.Container {...getContainerProps()} className="max-h-96">
              <Table.Header headerGroups={table.getHeaderGroups()} />
              <Table.Body {...getBodyProps()}>
                {rows.map((row) => {
                  return (
                    <Table.Row
                      key={row.id}
                      className="hover:bg-purple-05 group"
                      row={row}
                    />
                  );
                })}
              </Table.Body>
            </Table.Container>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
      </Page.Content>
    </Page.Container>
  );
}

const tKeyForUserRole = (role: User['role']) => {
  switch (role) {
    case 'ADMIN':
      return 'settings:users.role.admin';
    case 'PUBLISHER':
      return 'settings:users.role.publisher';
    case 'BUILDER':
      return 'settings:users.role.builder';
    case 'VIEWER':
      return 'settings:users.role.viewer';
    default:
      return 'settings:users.role.unknown';
  }
};

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
