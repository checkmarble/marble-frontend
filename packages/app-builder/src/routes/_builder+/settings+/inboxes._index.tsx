import { CollapsiblePaper, Page } from '@app-builder/components';
import { CreateInbox } from '@app-builder/components/Settings/Inboxes/CreateInbox';
import { UpdateOrganizationSettings } from '@app-builder/components/Settings/Organization/UpdateOrganization';
import { CreateTag } from '@app-builder/components/Settings/Tags/CreateTag';
import { DeleteTag } from '@app-builder/components/Settings/Tags/DeleteTag';
import { UpdateTag } from '@app-builder/components/Settings/Tags/UpdateTag';
import { ColorPreview } from '@app-builder/components/Tags/ColorPreview';
import { isAdmin } from '@app-builder/models';
import { type InboxWithCasesCount, tKeyForInboxUserRole } from '@app-builder/models/inbox';
import { type TagColor } from '@app-builder/models/tags';
import {
  isAutoAssignmentAvailable,
  isCreateInboxAvailable,
  isCreateTagAvailable,
  isDeleteTagAvailable,
  isEditTagAvailable,
  isInboxAdmin,
  isReadTagAvailable,
} from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { type Tag } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Table, useTable } from 'ui-design-system';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { entitlements, inbox, user, organization } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const [allInboxes, currentOrganization] = await Promise.all([
    inbox.listInboxesWithCaseCount(),
    organization.getCurrentOrganization(),
  ]);

  const inboxes = allInboxes.filter((inbox) => isAdmin(user) || isInboxAdmin(user, inbox));
  if (inboxes.length === 0 && !isAdmin(user)) {
    return redirect(getRoute('/'));
  }

  // Tags data
  const canReadTags = isReadTagAvailable(user);
  let tags: (Tag & { target: 'case' | 'object' })[] = [];
  if (canReadTags) {
    const [caseTags, objectTags] = await Promise.all([
      organization
        .listTags({ withCaseCount: true })
        .then((tags) => tags.map((t) => ({ ...t, target: 'case' as const }))),
      organization
        .listTags({ target: 'object' })
        .then((tags) => tags.map((t) => ({ ...t, target: 'object' as const }))),
    ]);
    tags = [...caseTags, ...objectTags];
  }

  return Response.json({
    isAutoAssignmentAvailable: isAutoAssignmentAvailable(entitlements),
    inboxes,
    organizationId: currentOrganization.id,
    isCreateInboxAvailable: isCreateInboxAvailable(user),
    autoAssignQueueLimit: currentOrganization.autoAssignQueueLimit ?? 0,
    // Tags
    canReadTags,
    tags,
    isCreateTagAvailable: canReadTags && isCreateTagAvailable(user),
    isEditTagAvailable: canReadTags && isEditTagAvailable(user),
    isDeleteTagAvailable: canReadTags && isDeleteTagAvailable(user),
  });
}

const inboxColumnHelper = createColumnHelper<InboxWithCasesCount>();
const tagColumnHelper = createColumnHelper<(Tag & { target: 'case' }) | (Tag & { target: 'object' })>();

export default function CaseManagerSettings() {
  const { t } = useTranslation(['common', 'settings']);
  const {
    isAutoAssignmentAvailable,
    inboxes,
    isCreateInboxAvailable,
    autoAssignQueueLimit,
    organizationId,
    canReadTags,
    tags,
    isCreateTagAvailable,
    isEditTagAvailable,
    isDeleteTagAvailable,
  } = useLoaderData<typeof loader>();

  const inboxColumns = useMemo(() => {
    return [
      inboxColumnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('settings:inboxes.name'),
        size: 100,
      }),
      inboxColumnHelper.accessor((row) => row.users, {
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
      inboxColumnHelper.accessor((row) => row.casesCount, {
        id: 'cases',
        header: t('settings:inboxes.cases'),
        size: 100,
      }),
    ];
  }, [t]);

  const inboxTable = useTable({
    data: inboxes,
    columns: inboxColumns,
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
      <Page.Content className="max-w-(--breakpoint-xl)">
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:inboxes')}</span>
            <UpdateOrganizationSettings
              isAutoAssignmentAvailable={isAutoAssignmentAvailable}
              organizationId={organizationId}
              autoAssignQueueLimit={autoAssignQueueLimit}
            />
            {isCreateInboxAvailable ? <CreateInbox redirectRoutePath="/settings/inboxes/:inboxId" /> : null}
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <Table.Container {...inboxTable.getContainerProps()} className="max-h-96">
              <Table.Header headerGroups={inboxTable.table.getHeaderGroups()} />
              <Table.Body {...inboxTable.getBodyProps()}>
                {inboxTable.rows.map((row) => {
                  return <Table.Row key={row.id} row={row} />;
                })}
              </Table.Body>
            </Table.Container>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
        {canReadTags ? (
          <TagsSection
            tags={tags}
            isCreateTagAvailable={isCreateTagAvailable}
            isEditTagAvailable={isEditTagAvailable}
            isDeleteTagAvailable={isDeleteTagAvailable}
          />
        ) : null}
      </Page.Content>
    </Page.Container>
  );
}

// Tags Section

function TagsSection({
  tags,
  isCreateTagAvailable,
  isEditTagAvailable,
  isDeleteTagAvailable,
}: {
  tags: (Tag & { target: 'case' | 'object' })[];
  isCreateTagAvailable: boolean;
  isEditTagAvailable: boolean;
  isDeleteTagAvailable: boolean;
}) {
  const { t } = useTranslation(['settings']);

  const columns = useMemo(() => {
    return [
      tagColumnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('settings:tags.name'),
        size: 200,
      }),
      tagColumnHelper.accessor((row) => row.color, {
        id: 'color',
        header: t('settings:tags.color'),
        size: 100,
        cell: ({ getValue }) => <ColorPreview color={getValue() as TagColor} />,
      }),
      tagColumnHelper.accessor((row) => row.cases_count, {
        id: 'cases',
        header: t('settings:tags.cases'),
        size: 200,
      }),
      tagColumnHelper.accessor((row) => row.target, {
        id: 'target',
        header: t('settings:tags.target'),
        cell: ({ cell }) => {
          return t(`settings:tags.target.${cell.getValue()}`);
        },
        size: 100,
      }),
      ...(isEditTagAvailable || isDeleteTagAvailable
        ? [
            tagColumnHelper.display({
              id: 'actions',
              size: 100,
              cell: ({ cell }) => {
                return (
                  <div className="flex gap-2">
                    {isEditTagAvailable ? (
                      <div className="group-hover:text-grey-primary focus-within:text-grey-primary text-transparent">
                        <UpdateTag tag={cell.row.original} />
                      </div>
                    ) : null}
                    {isDeleteTagAvailable ? (
                      <div className="group-hover:text-grey-primary focus-within:text-grey-primary text-transparent">
                        <DeleteTag tag={cell.row.original} />
                      </div>
                    ) : null}
                  </div>
                );
              },
            }),
          ]
        : []),
    ];
  }, [isDeleteTagAvailable, isEditTagAvailable, t]);

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: tags,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <CollapsiblePaper.Container>
      <CollapsiblePaper.Title>
        <span className="flex-1">{t('settings:tags')}</span>
        {isCreateTagAvailable ? <CreateTag /> : null}
      </CollapsiblePaper.Title>
      <CollapsiblePaper.Content>
        <Table.Container {...getContainerProps()} className="max-h-96">
          <Table.Header headerGroups={table.getHeaderGroups()} />
          <Table.Body {...getBodyProps()}>
            {rows.map((row) => {
              return <Table.Row key={row.id} className="hover:bg-surface-row-hover group" row={row} />;
            })}
          </Table.Body>
        </Table.Container>
      </CollapsiblePaper.Content>
    </CollapsiblePaper.Container>
  );
}
