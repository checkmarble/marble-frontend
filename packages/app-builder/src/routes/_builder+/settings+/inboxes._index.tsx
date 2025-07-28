import { CollapsiblePaper, Page } from '@app-builder/components';
import { isAdmin } from '@app-builder/models';
import { type InboxWithCasesCount, tKeyForInboxUserRole } from '@app-builder/models/inbox';
import { CreateInbox } from '@app-builder/routes/ressources+/settings+/inboxes+/create';
import { UpdateGlobalSettings } from '@app-builder/routes/ressources+/settings+/inboxes+/global.update';
import { isCreateInboxAvailable, isInboxAdmin } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Table, useTable } from 'ui-design-system';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { inbox, user, organization } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const [allInboxes, currentOrganization] = await Promise.all([
    inbox.listInboxesWithCaseCount(),
    organization.getCurrentOrganization(),
  ]);

  const inboxes = allInboxes.filter((inbox) => isAdmin(user) || isInboxAdmin(user, inbox));
  if (inboxes.length === 0) {
    return redirect(getRoute('/'));
  }

  return Response.json({
    inboxes,
    organizationId: currentOrganization.id,
    isCreateInboxAvailable: isCreateInboxAvailable(user),
    autoAssignQueueLimit: currentOrganization.autoAssignQueueLimit,
  });
}

const columnHelper = createColumnHelper<InboxWithCasesCount>();

export default function Inboxes() {
  const { t } = useTranslation(['settings']);
  const { inboxes, isCreateInboxAvailable, autoAssignQueueLimit, organizationId } =
    useLoaderData<typeof loader>();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('settings:inboxes.name'),
        size: 100,
      }),
      columnHelper.accessor((row) => row.users, {
        id: 'users',
        header: t('settings:inboxes.users'),
        size: 200,
        cell: ({ getValue }) => {
          const users = getValue();
          if (!users) return null;

          return R.pipe(
            users,
            R.groupBy((u) => u.role),
            R.entries(),
            R.map(([role, users]) => {
              return t(tKeyForInboxUserRole(role), { count: users.length });
            }),
            R.join(', '),
          );
        },
      }),
      columnHelper.accessor((row) => row.casesCount, {
        id: 'cases',
        header: t('settings:inboxes.cases'),
        size: 100,
      }),
    ];
  }, [t]);

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: inboxes,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
    rowLink: ({ id }) => (
      <Link
        to={getRoute('/settings/inboxes/:inboxId', {
          inboxId: fromUUIDtoSUUID(id),
        })}
      />
    ),
  });

  return (
    <Page.Container>
      <Page.Content className="max-w-screen-xl">
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:inboxes')}</span>
            {isCreateInboxAvailable ? (
              <CreateInbox redirectRoutePath="/settings/inboxes/:inboxId" />
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
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:global_settings.title')}</span>
            {isCreateInboxAvailable ? (
              <UpdateGlobalSettings
                organizationId={organizationId}
                autoAssignQueueLimit={autoAssignQueueLimit}
              />
            ) : null}
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <div className="grid w-full grid-cols-[max-content_1fr] gap-4">
              <span className="first-letter:capitalize">
                {t('settings:global_settings.auto_assign_queue_limit')}
              </span>
              <span>{autoAssignQueueLimit}</span>
            </div>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
      </Page.Content>
    </Page.Container>
  );
}
