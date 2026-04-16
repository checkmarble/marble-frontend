import { CollapsiblePaper, Page } from '@app-builder/components';
import { Nudge } from '@app-builder/components/Nudge';
import { CreateInboxUser } from '@app-builder/components/Settings/Inboxes/CreateInboxUser';
import { DeleteInbox } from '@app-builder/components/Settings/Inboxes/DeleteInbox';
import { DeleteInboxUser } from '@app-builder/components/Settings/Inboxes/DeleteInboxUser';
import { UpdateInbox } from '@app-builder/components/Settings/Inboxes/UpdateInbox';
import { UpdateInboxUser } from '@app-builder/components/Settings/Inboxes/UpdateInboxUser';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { type FeatureAccesses } from '@app-builder/models/feature-access';
import {
  type InboxMetadata,
  type InboxUser,
  InboxWithCasesCount,
  tKeyForInboxUserRole,
} from '@app-builder/models/inbox';
import { useEditInboxUserAutoAssignMutation } from '@app-builder/queries/settings/inboxes/edit-inbox-user-auto-assign';
import {
  getInboxUserRoles,
  isAutoAssignmentAvailable,
  isCreateInboxUserAvailable,
  isDeleteInboxAvailable,
  isDeleteInboxUserAvailable,
  isEditInboxAvailable,
  isEditInboxUserAvailable,
  isInboxAdmin,
} from '@app-builder/services/feature-access';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { fromParams } from '@app-builder/utils/short-uuid';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { createColumnHelper, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, Switch, Table, Tooltip, useTable } from 'ui-design-system';

type LoaderData = {
  inbox: InboxWithCasesCount;
  inboxesList: InboxWithCasesCount[];
  escalationInboxes: InboxMetadata[];
  escalationInbox: InboxMetadata | null;
  caseCount: number;
  entitlements: FeatureAccesses;
  inboxUserRoles: ReturnType<typeof getInboxUserRoles>;
  isEditInboxAvailable: boolean;
  isDeleteInboxAvailable: boolean;
  isCreateInboxUserAvailable: boolean;
  isEditInboxUserAvailable: boolean;
  isDeleteInboxUserAvailable: boolean;
  isAutoAssignmentAvailable: boolean;
};

const inboxDetailLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function inboxDetailLoader({ context, data }) {
    const { user, inbox: inboxApi, entitlements } = context.authInfo;

    const inboxId = fromParams(data?.params ?? {}, 'inboxId');
    const inboxesList = await inboxApi.listInboxesWithCaseCount();
    const inbox = inboxesList.find((inbox) => inbox.id === inboxId);

    if (!inbox) throw redirect({ to: '/settings/inboxes' });
    if (!isAdmin(user) && !isInboxAdmin(user, inbox)) {
      throw redirect({ to: '/' });
    }

    const escalationInboxes = await inboxApi.listInboxesMetadata();

    const result: LoaderData = {
      inbox,
      inboxesList,
      escalationInboxes,
      escalationInbox: inbox.escalationInboxId ? await inboxApi.getInboxMetadata(inbox.escalationInboxId) : null,
      caseCount: inbox.casesCount,
      entitlements,
      isAutoAssignmentAvailable: isAutoAssignmentAvailable(entitlements),
      inboxUserRoles: getInboxUserRoles(entitlements),
      isEditInboxAvailable: isEditInboxAvailable(user, inbox),
      isDeleteInboxAvailable: isDeleteInboxAvailable(user),
      isCreateInboxUserAvailable: isCreateInboxUserAvailable(user, inbox),
      isEditInboxUserAvailable: isEditInboxUserAvailable(user, inbox),
      isDeleteInboxUserAvailable: isDeleteInboxUserAvailable(user, inbox),
    };

    return result;
  });

export const Route = createFileRoute('/_app/_builder/settings/inboxes/$inboxId')({
  loader: ({ params }) => inboxDetailLoader({ data: { params } }),
  component: Inbox,
});

const columnHelper = createColumnHelper<InboxUser>();

function Inbox() {
  const {
    caseCount,
    inbox,
    escalationInboxes,
    escalationInbox,
    inboxUserRoles,
    entitlements,
    isEditInboxAvailable,
    isDeleteInboxAvailable,
    isCreateInboxUserAvailable,
    isEditInboxUserAvailable,
    isDeleteInboxUserAvailable,
    isAutoAssignmentAvailable,
  } = Route.useLoaderData();
  const { t } = useTranslation(['settings', 'common']);
  const { orgUsers } = useOrganizationUsers();
  const editAutoAssignMutation = useEditInboxUserAutoAssignMutation();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.userId, {
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
      ...(isAutoAssignmentAvailable
        ? [
            columnHelper.accessor((row) => row.autoAssignable, {
              id: 'autoAssignable',
              header: t('settings:inboxes.inbox_details.auto_assign_enabled.label'),
              size: 150,
              cell: ({ getValue, row }) => {
                const [value, setValue] = useState(getValue());
                const handleChange = (checked: boolean) => {
                  setValue(checked);
                  editAutoAssignMutation.mutateAsync({
                    id: row.original.id,
                    autoAssignable: checked,
                  });
                };

                return isEditInboxUserAvailable ? (
                  <Switch checked={value} onCheckedChange={handleChange} disabled={!isEditInboxUserAvailable} />
                ) : getValue() ? (
                  t('settings:inboxes.inbox_details.auto_assign_enabled')
                ) : (
                  t('settings:inboxes.inbox_details.auto_assign_disabled')
                );
              },
            }),
          ]
        : []),
      ...(isEditInboxUserAvailable || isDeleteInboxUserAvailable
        ? [
            columnHelper.display({
              id: 'actions',
              size: 100,
              cell: ({ cell }) => {
                return (
                  <div className="flex gap-2">
                    {isEditInboxUserAvailable ? (
                      <div className="group-hover/row:text-grey-primary focus-within:text-grey-primary text-transparent cursor-pointer">
                        <UpdateInboxUser
                          inboxUser={cell.row.original}
                          inboxUserRoles={inboxUserRoles}
                          access={entitlements.userRoles}
                        />
                      </div>
                    ) : null}
                    {isDeleteInboxUserAvailable ? (
                      <div className="group-hover/row:text-grey-primary focus-within:text-grey-primary text-transparent cursor-pointer">
                        <DeleteInboxUser inboxUser={cell.row.original} />
                      </div>
                    ) : null}
                  </div>
                );
              },
            }),
          ]
        : []),
    ];
  }, [inboxUserRoles, isDeleteInboxUserAvailable, isEditInboxUserAvailable, orgUsers, t, entitlements.userRoles]);

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: inbox.users ?? [],
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const nonInboxUsers = orgUsers.filter((user) => !inbox.users?.some((u) => u.userId === user.userId));

  return (
    <Page.Container>
      <Page.Content className="max-w-(--breakpoint-xl)">
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:inboxes.inbox_details.title')}</span>
            {isEditInboxAvailable ? (
              <UpdateInbox
                inbox={inbox}
                escalationInboxes={escalationInboxes}
                redirectRoutePath="/settings/inboxes/$inboxId"
                isAutoAssignmentAvailable={isAutoAssignmentAvailable}
              />
            ) : null}
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <div className="grid auto-rows-fr grid-cols-[max-content_1fr] items-center gap-x-10 gap-y-4">
              <span className="font-bold">{t('settings:inboxes.name')}</span>
              {inbox.name}
              <span className="font-bold">{t('settings:inboxes.inbox_details.case_count')}</span>
              {caseCount}
              <span className="font-bold">{t('settings:inboxes.inbox_details.escalation_inbox')}</span>
              {escalationInbox?.name ?? t('settings:inboxes.inbox_details.no_escalation_inbox')}
              <span className="font-bold flex items-center gap-2">
                {t('settings:inboxes.inbox_details.auto_assign_enabled.label')}
                {!isAutoAssignmentAvailable ? (
                  <Nudge
                    className="size-5"
                    kind="restricted"
                    content={t('settings:inboxes.auto_assign_queue_limit.nudge', {
                      defaultValue: 'N/A',
                    })}
                  />
                ) : null}
              </span>
              <span className={cn({ 'blur-xs': !isAutoAssignmentAvailable })}>
                {inbox.autoAssignEnabled
                  ? t('settings:inboxes.inbox_details.auto_assign_enabled')
                  : t('settings:inboxes.inbox_details.auto_assign_disabled')}
              </span>
            </div>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>

        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:inboxes.inbox_details.members')}</span>
            {isCreateInboxUserAvailable ? (
              <CreateInboxUser
                inboxId={inbox.id}
                users={nonInboxUsers}
                inboxUserRoles={inboxUserRoles}
                access={entitlements.userRoles}
                isAutoAssignmentAvailable={isAutoAssignmentAvailable}
              />
            ) : null}
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <Table.Container {...getContainerProps()} className="max-h-96">
              <Table.Header headerGroups={table.getHeaderGroups()} />
              <Table.Body {...getBodyProps()}>
                {rows.map((row) => {
                  return <Table.Row key={row.id} row={row} />;
                })}
              </Table.Body>
            </Table.Container>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>

        {isDeleteInboxAvailable ? (
          caseCount === 0 ? (
            <DeleteInbox inbox={inbox} />
          ) : (
            <Tooltip.Default
              content={<p className="p-2">{t('settings:inboxes.inbox_details.delete_inbox.tooltip')}</p>}
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
