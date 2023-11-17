import { Page } from '@app-builder/components';
import { casesI18n } from '@app-builder/components/Cases';
import { serverServices } from '@app-builder/services/init.server';
import { formatDateTime } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { type ColumnDef, getCoreRowModel } from '@tanstack/react-table';
import clsx from 'clsx';
import { type Namespace, type ParseKeys } from 'i18next';
import { type Case } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tooltip, useVirtualTable } from 'ui-design-system';
import { CaseManager } from 'ui-icons';

export const handle = {
  i18n: ['navigation', ...casesI18n] satisfies Namespace,
};

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const cases = await apiClient.listCases({});

  return json({ cases });
}

export default function Cases() {
  const {
    t,
    i18n: { language },
  } = useTranslation(handle.i18n);
  const navigate = useNavigate();
  const { cases } = useLoaderData<typeof loader>();

  const columns = useMemo<ColumnDef<Case, string>[]>(
    () => [
      {
        id: 'status',
        accessorFn: (c) => c.status,
        header: t('cases:case.status'),
        size: 50,
        cell: ({ getValue }) => <Status status={getValue<string>()} />,
      },
      {
        id: 'name',
        accessorFn: (c) => c.name,
        header: t('cases:case.name'),
        size: 200,
      },
      {
        id: 'created_at',
        accessorFn: (row) => formatDateTime(row.created_at, { language }),
        header: t('cases:case.date'),
        size: 200,
      },
    ],
    [language, t]
  );
  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: cases,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Page.Container>
      <Page.Header>
        <CaseManager className="mr-2" height="24px" width="24px" />
        {t('navigation:caseManager')}
      </Page.Header>
      <Page.Content>
        <Table.Container {...getContainerProps()}>
          <Table.Header headerGroups={table.getHeaderGroups()} />
          <Table.Body {...getBodyProps()}>
            {rows.map((row) => {
              return (
                <Table.Row
                  key={row.id}
                  className={clsx('hover:bg-grey-02 cursor-pointer')}
                  row={row}
                  onClick={() => {
                    navigate(
                      getRoute('/cases/:caseId', {
                        caseId: fromUUID(row.original.id),
                      })
                    );
                  }}
                />
              );
            })}
          </Table.Body>
        </Table.Container>
      </Page.Content>
    </Page.Container>
  );
}

const Status = ({ status }: { status: Case['status'] }) => {
  const { t } = useTranslation(handle.i18n);
  const { color, tKey } = caseStatusMapping[status];

  return (
    <Tooltip.Default content={t(tKey)}>
      <div
        className={clsx(
          {
            'bg-red-10 text-red-100': color === 'red',
            'bg-blue-10 text-blue-100': color === 'blue',
            'bg-grey-10 text-grey-100': color === 'grey',
            'bg-green-10 text-green-100': color === 'green',
          },
          'flex h-6 w-6 items-center justify-center rounded font-semibold capitalize'
        )}
      >
        {t(tKey)[0]}
      </div>
    </Tooltip.Default>
  );
};

const caseStatusMapping: Record<
  Case['status'],
  { color: string; tKey: ParseKeys<['cases']> }
> = {
  open: { color: 'red', tKey: 'cases:case.status.open' },
  investigating: { color: 'blue', tKey: 'cases:case.status.investigating' },
  discarded: { color: 'grey', tKey: 'cases:case.status.discarded' },
  resolved: { color: 'green', tKey: 'cases:case.status.resolved' },
};
