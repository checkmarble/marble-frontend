import { Callout, ErrorComponent, Page } from '@app-builder/components';
import { DetectionNavigationTabs } from '@app-builder/components/Detection';
import { CreateScenario } from '@app-builder/components/Scenario/Actions/CreateScenario';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type Scenario } from '@app-builder/models/scenario';
import { useFormatDateTime } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link, useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import clsx from 'clsx';
import { createColumnHelper, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, Tag, useVirtualTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['scenarios', 'navigation'] satisfies Namespace,
};

export const loader = createServerFn([authMiddleware], async function scenariosLoader({ context }) {
  return {
    scenarios: await context.authInfo.scenario.listScenarios(),
  };
});

const columnHelper = createColumnHelper<Scenario>();

export default function DetectionScenariosPage() {
  const { t } = useTranslation(handle.i18n);
  const { scenarios } = useLoaderData<typeof loader>();
  const formatDateTime = useFormatDateTime();

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => ({ liveVersionId: row.liveVersionId, archived: row.archived }), {
        id: 'status',
        header: t('scenarios:list.column.status'),
        size: 100,
        cell: ({ getValue }) => {
          const { liveVersionId, archived } = getValue();
          if (archived) {
            return (
              <Tag color="grey" size="small" className="capitalize">
                {t('scenarios:archived')}
              </Tag>
            );
          }
          return liveVersionId ? (
            <Tag color="purple" size="small" className="capitalize">
              {t('scenarios:live')}
            </Tag>
          ) : null;
        },
      }),
      columnHelper.accessor('name', {
        id: 'name',
        header: t('scenarios:list.column.name'),
        size: 250,
        sortingFn: 'text',
        enableSorting: true,
      }),
      columnHelper.accessor('description', {
        id: 'description',
        header: t('scenarios:list.column.description'),
        size: 300,
      }),
      columnHelper.accessor('triggerObjectType', {
        id: 'triggerObjectType',
        header: t('scenarios:list.column.trigger_object'),
        size: 140,
        cell: ({ getValue }) => {
          const triggerObjectType = getValue();
          return (
            <Tag color="purple" size="small" border="rounded-sm">
              {triggerObjectType}
            </Tag>
          );
        },
      }),
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        header: t('scenarios:list.column.created_at'),
        size: 200,
        cell: ({ getValue }) => {
          const createdAt = getValue();
          return formatDateTime(createdAt, {
            dateStyle: 'short',
            timeStyle: 'short',
          });
        },
      }),
    ],
    [t, formatDateTime],
  );

  const { table, isEmpty, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: scenarios,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    rowLink: ({ id }) => (
      <Link
        to={getRoute('/detection/scenarios/:scenarioId', {
          scenarioId: fromUUIDtoSUUID(id),
        })}
      />
    ),
  });

  return (
    <Page.Main>
      <Page.Container>
        <Page.ContentV2 className="gap-v2-md max-w-(--breakpoint-xl)">
          <DetectionNavigationTabs
            actions={
              <CreateScenario>
                <Button>
                  <Icon icon="plus" className="size-6" aria-hidden />
                  {t('scenarios:create_scenario.title')}
                </Button>
              </CreateScenario>
            }
          />
          <Callout variant="outlined">{t('scenarios:list.callout')}</Callout>
          <div className="flex flex-col gap-4">
            {isEmpty ? (
              <div className="bg-surface-card border-grey-border flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-4">
                <p className="text-s font-medium">{t('scenarios:empty_scenario_list')}</p>
              </div>
            ) : (
              <Table.Container {...getContainerProps()} className="bg-surface-card max-h-[70dvh]">
                <Table.Header headerGroups={table.getHeaderGroups()} />
                <Table.Body {...getBodyProps()}>
                  {rows.map((row) => (
                    <Table.Row
                      key={row.id}
                      row={row}
                      className={clsx(row.original.archived && 'opacity-50')}
                    />
                  ))}
                </Table.Body>
              </Table.Container>
            )}
          </div>
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <ErrorComponent error={error} />;
}
