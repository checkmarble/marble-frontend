import { CollapsiblePaper, Page } from '@app-builder/components';
import { isAdmin } from '@app-builder/models';
import {
  type InboxWithCasesCount,
  tKeyForInboxUserRole,
} from '@app-builder/models/inbox';
import { CreateInbox } from '@app-builder/routes/ressources+/settings+/inboxes+/create';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Table, useTable } from 'ui-design-system';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { inbox, user } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  if (!isAdmin(user)) {
    return redirect(getRoute('/'));
  }

  const inboxes = await inbox.listInboxesWithCaseCount();

  return json({ inboxes });
}

const columnHelper = createColumnHelper<InboxWithCasesCount>();

export default function Inboxes() {
  const { t } = useTranslation(['settings']);
  const { inboxes } = useLoaderData<typeof loader>();

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

          return R.pipe(
            cell.row.original.users,
            R.groupBy.strict((u) => u.role),
            R.entries.strict(),
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
  });

  return (
    <Page.Container>
      <Page.Content>
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:inboxes')}</span>
            <CreateInbox redirectRoutePath="/settings/inboxes/:inboxId" />
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
                      className={clsx('hover:bg-grey-02 cursor-pointer')}
                      row={row}
                      onClick={() => {
                        navigate(
                          getRoute('/settings/inboxes/:inboxId', {
                            inboxId: fromUUID(row.original.id),
                          }),
                        );
                      }}
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
