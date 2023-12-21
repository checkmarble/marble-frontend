import { Page } from '@app-builder/components';
import { DeleteInbox } from '@app-builder/routes/ressources/settings/inboxes/delete';
import { CreateInboxUser } from '@app-builder/routes/ressources/settings/inboxes/inbox-users/create';
import { DeleteInboxUser } from '@app-builder/routes/ressources/settings/inboxes/inbox-users/delete';
import { UpdateInboxUser } from '@app-builder/routes/ressources/settings/inboxes/inbox-users/update';
import { UpdateInbox } from '@app-builder/routes/ressources/settings/inboxes/update';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { fromParams } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { type InboxUserDto, type InboxUserRole } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useVirtualTable } from 'ui-design-system';

import { tKeyForInboxUserRole } from '.';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient, cases } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const inboxId = fromParams(params, 'inboxId');
  const { inbox } = await apiClient.getInbox(inboxId);
  const caseList = await cases.listCases({ inboxIds: [inboxId] });

  return json({ caseList, inbox });
}

const columnHelper = createColumnHelper<InboxUserDto>();

export default function Inbox() {
  const { caseList, inbox } = useLoaderData<typeof loader>();
  const { t } = useTranslation(handle.i18n);
  const { orgUsers } = useOrganizationUsers();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.user_id, {
        id: 'name:',
        header: t('settings:inboxes.name'),
        size: 100,
        cell: ({ getValue }) => {
          const user = orgUsers.find((u) => u.userId === getValue());
          if (!user) return;
          return `${user.firstName} ${user.lastName}`;
        },
      }),
      columnHelper.accessor((row) => row.role, {
        id: 'role:',
        header: t('settings:inboxes.inbox_details.role'),
        size: 100,
        cell: ({ getValue }) =>
          t(tKeyForInboxUserRole(getValue<InboxUserRole>())),
      }),
      columnHelper.display({
        id: 'actions',
        size: 50,
        cell: ({ cell }) => {
          return (
            <div className="text-grey-00 group-hover:text-grey-100 flex gap-2">
              <UpdateInboxUser inboxUser={cell.row.original} />
              <DeleteInboxUser inboxUser={cell.row.original} />
            </div>
          );
        },
      }),
    ];
  }, [orgUsers, t]);

  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: inbox.users ?? [],
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Page.Container>
      <Page.Content>
        <div className="bg-grey-00 border-grey-10 flex w-full flex-col gap-4 overflow-hidden rounded-lg border px-8 py-4">
          <div className="flex flex-row items-center justify-between font-bold capitalize">
            {t('settings:inboxes.inbox_details.title')}
            <UpdateInbox
              inbox={inbox}
              redirectRoutePath="/settings/inboxes/:inboxId"
            />
          </div>
          <div className="text-s grid grid-cols-[200px_2fr]">
            <span className="font-bold">{t('settings:inboxes.name')}</span>
            {inbox.name}
          </div>

          <div className="flex flex-row items-center justify-between font-bold capitalize">
            {t('settings:inboxes.inbox_details.members')}
            <CreateInboxUser inboxId={inbox.id} />
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

          <div className="text-s grid grid-cols-[200px_2fr]">
            <span className="font-bold">
              {t('settings:inboxes.inbox_details.case_count')}
            </span>
            {caseList.total}
          </div>

          {caseList.total === 0 ? (
            <div>
              <DeleteInbox inbox={inbox} />
            </div>
          ) : null}
        </div>
      </Page.Content>
    </Page.Container>
  );
}
