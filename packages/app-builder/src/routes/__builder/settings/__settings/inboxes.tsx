import { Page } from '@app-builder/components';
import { isAdmin } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs, redirect } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type InboxDto, type InboxUserRole, type Tag } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Table, useVirtualTable } from 'ui-design-system';

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient, user } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  if (!isAdmin(user)) {
    return redirect(getRoute('/'));
  }

  const { inboxes } = await apiClient.listInboxes({ withCaseCount: true });

  return json({ inboxes });
}

const columnHelper = createColumnHelper<InboxDto>();

export default function Inboxes() {
  const { t } = useTranslation(['settings']);
  const { inboxes } = useLoaderData<typeof loader>();
  console.log(inboxes);

  const navigate = useNavigate();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('settings:inboxes.name'),
        size: 100,
      }),
      columnHelper.display({
        id: 'users',
        header: t('settings:inboxes.users'),
        size: 200,
        cell: ({ cell }) => {
          if (!cell.row.original.users) return null;
          const inboxUsersPerRoles = R.groupBy(
            cell.row.original.users,
            (u) => u.role,
          );

          return Object.keys(inboxUsersPerRoles)
            .map((role) => {
              const count = inboxUsersPerRoles[role].length;
              return t(tKeyForInboxUserRole(role), { count });
            })
            .join(', ');
        },
      }),
      columnHelper.accessor((row) => row.cases_count, {
        id: 'cases',
        header: t('settings:inboxes.cases'),
        size: 100,
      }),
    ];
  }, [t]);

  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: inboxes,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Page.Container>
      <Page.Content>
        <div className="border-grey-10 w-full overflow-hidden rounded-lg border px-8 py-4 ">
          <div className="flex flex-row items-center justify-between py-4 font-bold capitalize">
            {t('settings:inboxes')}
            <Button>{t('settings:inboxes.new_inbox')}</Button>
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
                    onClick={() => {
                      navigate(
                        getRoute('/inboxes/:inboxId', {
                          inboxId: fromUUID(row.original.id),
                        }),
                      );
                    }}
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

const tKeyForInboxUserRole = (role: string) => {
  switch (role) {
    case 'admin':
      return 'settings:inboxes.user_role.admin';
    case 'member':
      return 'settings:inboxes.user_role.member';
    default:
      return 'settings:inboxes.user_role.unknown';
  }
};
