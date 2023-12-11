import { Page } from '@app-builder/components';
import { isAdmin, type User } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type InboxUserDto } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Table, useVirtualTable } from 'ui-design-system';
import { Delete, Edit, Plus } from 'ui-icons';

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient, user } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  if (isAdmin(user)) {
    return redirect(getRoute('/'));
  }

  const { inbox_users } = await apiClient.listAllInboxUsers();

  return json({ inboxUsers: inbox_users });
}

const columnHelper = createColumnHelper<User>();

export default function Users() {
  const { t } = useTranslation(['settings', 'cases']);
  const { inboxUsers } = useLoaderData<{ inboxUsers: InboxUserDto[] }>();
  const { orgUsers } = useOrganizationUsers();

  const inboxUsersByUserId = R.pipe(
    inboxUsers,
    R.groupBy((user) => user.user_id),
    R.mapValues((value) =>
      R.pipe(
        value,
        R.groupBy((v) => v.role),
      ),
    ),
  );

  const columns = useMemo(() => {
    const columns = [
      columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
        id: 'name',
        header: t('settings:users.name'),
        size: 100,
      }),
      columnHelper.accessor((row) => row.email, {
        id: 'email',
        header: t('settings:users.email'),
        size: 100,
      }),
      columnHelper.accessor((row) => row.role, {
        id: 'role',
        header: t('settings:users.role'),
        size: 100,
        cell: ({ getValue }) => t(tKeyForUserRole(getValue<User['role']>())),
      }),
      columnHelper.display({
        id: 'inbox_user_role',
        header: t('settings:users.inbox_user_role'),
        size: 200,
        cell: ({ cell }) => {
          const inboxUsers = inboxUsersByUserId[cell.row.original.userId];
          if (!inboxUsers) return null;

          const inboxUsersSummary = Object.keys(inboxUsers)
            .map((role) => {
              console.log(role);
              const count = inboxUsers[role].length;
              return t(tKeyForInboxUserRole(role), { count });
            })
            .join(', ');

          return (
            <div className="flex items-center justify-between">
              {inboxUsersSummary}
              <div className="text-grey-00 group-hover:text-grey-100 relative flex gap-2 rounded p-2 transition-colors ease-in-out">
                <Edit width={'24px'} height={'24px'} />
                <Delete width={'24px'} height={'24px'} />
              </div>
            </div>
          );
        },
      }),
    ];
    return columns;
  }, [inboxUsersByUserId, t]);

  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: orgUsers,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Page.Container>
      <Page.Content>
        <div className="border-grey-10 w-full overflow-hidden rounded-lg border px-8 py-4 ">
          <div className="flex flex-row items-center justify-between px-8 py-4 font-bold capitalize">
            {t('settings:users')}
            <Button>
              <Plus />
              {t('settings:users.new_user')}
            </Button>
          </div>
          <Table.Container {...getContainerProps()}>
            <Table.Header headerGroups={table.getHeaderGroups()} />
            <Table.Body {...getBodyProps()}>
              {rows.map((row) => {
                return (
                  <Table.Row
                    key={row.id}
                    tabIndex={0}
                    className={clsx('hover:bg-grey-02 cursor-pointer')}
                    row={row}
                  />
                );
              })}
            </Table.Body>
          </Table.Container>
        </div>
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
