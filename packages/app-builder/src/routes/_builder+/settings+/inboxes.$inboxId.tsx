import { CollapsiblePaper, Page } from '@app-builder/components';
import { tKeyForInboxUserRole } from '@app-builder/models/inbox';
import { DeleteInbox } from '@app-builder/routes/ressources+/settings+/inboxes+/delete';
import { CreateInboxUser } from '@app-builder/routes/ressources+/settings+/inboxes+/inbox-users.create';
import { DeleteInboxUser } from '@app-builder/routes/ressources+/settings+/inboxes+/inbox-users.delete';
import { UpdateInboxUser } from '@app-builder/routes/ressources+/settings+/inboxes+/inbox-users.update';
import { UpdateInbox } from '@app-builder/routes/ressources+/settings+/inboxes+/update';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { type InboxUserDto } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tooltip, useTable } from 'ui-design-system';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;
  const { user, apiClient, cases } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );

  const inboxId = fromParams(params, 'inboxId');

  const [{ inbox }, caseList, inboxUserRoles] = await Promise.all([
    apiClient.getInbox(inboxId),
    cases.listCases({ inboxIds: [inboxId] }),
    featureAccessService.getInboxUserRoles(),
  ]);

  return json({
    inbox,
    caseList,
    inboxUserRoles,
    isEditInboxAvailable: featureAccessService.isEditInboxAvailable(user),
    isDeleteInboxAvailable: featureAccessService.isDeleteInboxAvailable(user),
    isCreateInboxUserAvailable:
      featureAccessService.isCreateInboxUserAvailable(user),
    isEditInboxUserAvailable:
      featureAccessService.isEditInboxUserAvailable(user),
    isDeleteInboxUserAvailable:
      featureAccessService.isDeleteInboxUserAvailable(user),
  });
}

const columnHelper = createColumnHelper<InboxUserDto>();

export default function Inbox() {
  const {
    caseList,
    inbox,
    inboxUserRoles,
    isEditInboxAvailable,
    isDeleteInboxAvailable,
    isCreateInboxUserAvailable,
    isEditInboxUserAvailable,
    isDeleteInboxUserAvailable,
  } = useLoaderData<typeof loader>();
  const { t } = useTranslation(handle.i18n);
  const { orgUsers } = useOrganizationUsers();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.user_id, {
        id: 'name',
        header: t('settings:inboxes.name'),
        size: 200,
        cell: ({ getValue }) => {
          const user = orgUsers.find((u) => u.userId === getValue());
          if (!user) return;
          return `${user.firstName} ${user.lastName}`;
        },
      }),
      columnHelper.accessor((row) => row.role, {
        id: 'role',
        header: t('settings:inboxes.inbox_details.role'),
        size: 200,
        cell: ({ getValue }) => t(tKeyForInboxUserRole(getValue())),
      }),
      ...(isEditInboxUserAvailable || isDeleteInboxUserAvailable
        ? [
            columnHelper.display({
              id: 'actions',
              size: 100,
              cell: ({ cell }) => {
                return (
                  <div className="group-hover:text-grey-100 flex gap-2 text-transparent">
                    {isEditInboxUserAvailable ? (
                      <UpdateInboxUser
                        inboxUser={cell.row.original}
                        inboxUserRoles={inboxUserRoles}
                      />
                    ) : null}
                    {isDeleteInboxUserAvailable ? (
                      <DeleteInboxUser inboxUser={cell.row.original} />
                    ) : null}
                  </div>
                );
              },
            }),
          ]
        : []),
    ];
  }, [
    inboxUserRoles,
    isDeleteInboxUserAvailable,
    isEditInboxUserAvailable,
    orgUsers,
    t,
  ]);

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: inbox.users ?? [],
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const nonInboxUsers = orgUsers.filter(
    (user) => !inbox.users?.some((u) => u.user_id === user.userId),
  );

  return (
    <Page.Container>
      <Page.Content>
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">
              {t('settings:inboxes.inbox_details.title')}
            </span>
            {isEditInboxAvailable ? (
              <UpdateInbox
                inbox={inbox}
                redirectRoutePath="/settings/inboxes/:inboxId"
              />
            ) : null}
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <div className="grid auto-rows-fr grid-cols-[max-content_1fr] items-center gap-x-10 gap-y-4">
              <span className="font-bold">{t('settings:inboxes.name')}</span>
              {inbox.name}

              <span className="font-bold">
                {t('settings:inboxes.inbox_details.case_count')}
              </span>
              {caseList.totalCount.isMaxCount
                ? caseList.totalCount.value + '+'
                : caseList.totalCount.value}
            </div>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>

        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">
              {t('settings:inboxes.inbox_details.members')}
            </span>
            {isCreateInboxUserAvailable ? (
              <CreateInboxUser
                inboxId={inbox.id}
                users={nonInboxUsers}
                inboxUserRoles={inboxUserRoles}
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
                      tabIndex={0}
                      className={clsx(
                        'hover:bg-purple-05 group cursor-pointer',
                      )}
                      row={row}
                    />
                  );
                })}
              </Table.Body>
            </Table.Container>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>

        {isDeleteInboxAvailable ? (
          caseList.totalCount.value === 0 ? (
            <DeleteInbox inbox={inbox} />
          ) : (
            <Tooltip.Default
              content={
                <p className="p-2">
                  {t('settings:inboxes.inbox_details.delete_inbox.tooltip')}
                </p>
              }
            >
              <span className="w-fit">
                <DeleteInbox inbox={inbox} disabled />
              </span>
            </Tooltip.Default>
          )
        ) : null}
      </Page.Content>
    </Page.Container>
  );
}
