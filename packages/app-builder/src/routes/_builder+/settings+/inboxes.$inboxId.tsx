import { CollapsiblePaper, Page } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { Nudge } from '@app-builder/components/Nudge';
import { isAdmin } from '@app-builder/models';
import { type FeatureAccesses } from '@app-builder/models/feature-access';
import {
  type InboxMetadata,
  type InboxUser,
  InboxWithCasesCount,
  tKeyForInboxUserRole,
} from '@app-builder/models/inbox';
import { useEditAutoAssignMutation } from '@app-builder/queries/InboxUsers/edit-auto-assign';
import { DeleteInbox } from '@app-builder/routes/ressources+/settings+/inboxes+/delete';
import { CreateInboxUser } from '@app-builder/routes/ressources+/settings+/inboxes+/inbox-users+/create';
import { DeleteInboxUser } from '@app-builder/routes/ressources+/settings+/inboxes+/inbox-users+/delete';
import { UpdateInboxUser } from '@app-builder/routes/ressources+/settings+/inboxes+/inbox-users+/update';
import { UpdateInbox } from '@app-builder/routes/ressources+/settings+/inboxes+/update';
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
import { initServerServices } from '@app-builder/services/init.server';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getRoute, type RouteID } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import {
  ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
  type SerializeFrom,
} from '@remix-run/node';
import { useLoaderData, useRouteLoaderData } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { pick } from 'radash';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, Switch, Table, Tooltip, useTable } from 'ui-design-system';
import { z } from 'zod/v4';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['settings']);
      return (
        <BreadCrumbLink to={getRoute('/settings/inboxes')} isLast={isLast}>
          {t('settings:inboxes')}
        </BreadCrumbLink>
      );
    },
    ({ isLast }: BreadCrumbProps) => {
      const { inbox } = useRouteLoaderData(
        'routes/_builder+/settings+/inboxes.$inboxId' satisfies RouteID,
      ) as SerializeFrom<typeof loader>;

      return (
        <BreadCrumbLink
          isLast={isLast}
          to={getRoute('/settings/inboxes/:inboxId', {
            inboxId: fromUUIDtoSUUID(inbox.id),
          })}
        >
          {inbox.name}
        </BreadCrumbLink>
      );
    },
  ],
};

type LoaderData = {
  inbox: InboxWithCasesCount;
  inboxesList: InboxWithCasesCount[];
  escalationInboxes: InboxMetadata[];
  escalationInbox: InboxMetadata | null;
  caseCount: number;
  entitlements: FeatureAccesses;
  inboxUserRoles: readonly [string, ...string[]];
  isEditInboxAvailable: boolean;
  isDeleteInboxAvailable: boolean;
  isCreateInboxUserAvailable: boolean;
  isEditInboxUserAvailable: boolean;
  isDeleteInboxUserAvailable: boolean;
  isAutoAssignmentAvailable: boolean;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const {
    user,
    inbox: inboxApi,
    entitlements,
  } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const inboxId = fromParams(params, 'inboxId');
  const inboxesList = await inboxApi.listInboxesWithCaseCount();
  const inbox = inboxesList.find((inbox) => inbox.id === inboxId);

  if (!inbox) return redirect(getRoute('/settings/inboxes'));
  if (!isAdmin(user) && !isInboxAdmin(user, inbox)) {
    return redirect(getRoute('/'));
  }

  const escalationInboxes = await inboxApi.listInboxesMetadata();

  const datas: LoaderData = {
    inbox,
    inboxesList,
    escalationInboxes,
    escalationInbox: inbox.escalationInboxId
      ? await inboxApi.getInboxMetadata(inbox.escalationInboxId)
      : null,
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

  return Response.json(datas);
}

function getUpdateInboxUserFormSchema(inboxUserRoles: readonly [string, ...string[]]) {
  return z.object({
    id: z.uuid(),
    role: z.enum(inboxUserRoles),
    autoAssignable: z.boolean(),
  });
}
export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, rawData, { inbox, entitlements }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = getUpdateInboxUserFormSchema(
    getInboxUserRoles(entitlements),
  ).safeParse(rawData);

  if (!success) {
    return Response.json(
      { status: 'error', errors: z.treeifyError(error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await inbox.updateInboxUser(data.id, pick(data, ['role', 'autoAssignable']));
    return Response.json({ status: 'success' });
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return Response.json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

const columnHelper = createColumnHelper<InboxUser>();

export default function Inbox() {
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
  } = useLoaderData<LoaderData>();
  const { t } = useTranslation(handle.i18n);
  const { orgUsers } = useOrganizationUsers();

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
                const editAutoAssignMutation = useEditAutoAssignMutation();
                const handleChange = (checked: boolean) => {
                  setValue(checked);
                  editAutoAssignMutation.mutate({
                    id: row.original.id,
                    autoAssignable: checked,
                  });
                };

                return isEditInboxUserAvailable ? (
                  <Switch
                    checked={value}
                    onCheckedChange={handleChange}
                    disabled={!isEditInboxUserAvailable}
                  />
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
                      // TODO: inject trigger inside <UpdateTag /> and use style directly on it (so we can remove the container div)
                      <div className="group-hover:text-grey-00 focus-within:text-grey-00 text-transparent">
                        <UpdateInboxUser
                          inboxUser={cell.row.original}
                          inboxUserRoles={inboxUserRoles}
                          access={entitlements.userRoles}
                        />
                      </div>
                    ) : null}
                    {isDeleteInboxUserAvailable ? (
                      // TODO: inject trigger inside <UpdateTag /> and use style directly on it (so we can remove the container div)
                      <div className="group-hover:text-grey-00 focus-within:text-grey-00 text-transparent">
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
  }, [
    inboxUserRoles,
    isDeleteInboxUserAvailable,
    isEditInboxUserAvailable,
    orgUsers,
    t,
    entitlements.userRoles,
  ]);

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: inbox.users ?? [],
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const nonInboxUsers = orgUsers.filter(
    (user) => !inbox.users?.some((u) => u.userId === user.userId),
  );

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
                redirectRoutePath="/settings/inboxes/:inboxId"
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
              <span className="font-bold">
                {t('settings:inboxes.inbox_details.escalation_inbox')}
              </span>
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
                  return <Table.Row key={row.id} className="hover:bg-purple-98 group" row={row} />;
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
              content={
                <p className="p-2">{t('settings:inboxes.inbox_details.delete_inbox.tooltip')}</p>
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
