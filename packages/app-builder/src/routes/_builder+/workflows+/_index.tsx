import {
  adaptOffsetPaginationButtonsProps,
  Callout,
  ErrorComponent,
  OffsetPaginationButtons,
  Page,
} from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { Highlight } from '@app-builder/components/Highlight';
import { type Scenario } from '@app-builder/models/scenario';
import { workflowsDocHref } from '@app-builder/services/documentation-href';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData, useRouteError } from '@remix-run/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
} from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { assertNever } from 'typescript-utils';
import { Input, Table, Tag, Tooltip, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['workflows', 'navigation', 'common'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const scenarios = await scenario.listScenarios();

  return json({
    scenarios,
  });
}

const columnHelper = createColumnHelper<Scenario>();

export default function WorkflowsPage() {
  const { t } = useTranslation(handle.i18n);
  const { scenarios } = useLoaderData<typeof loader>();

  const columns = React.useMemo(
    () => [
      columnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('workflows:name'),
        size: 100,
        sortingFn: 'text',
        enableSorting: true,
        cell: ({ getValue, table }) => {
          const tableState = table.getState();
          const query =
            typeof tableState.globalFilter === 'string'
              ? tableState.globalFilter
              : '';

          return (
            <p className="text-grey-100 text-s font-medium">
              <Highlight text={getValue()} query={query} />
            </p>
          );
        },
      }),
      columnHelper.accessor((row) => row.description, {
        id: 'description',
        header: t('workflows:description'),
        size: 200,
        sortingFn: 'text',
        enableSorting: true,
        cell: ({ getValue, table }) => {
          const tableState = table.getState();
          const query =
            typeof tableState.globalFilter === 'string'
              ? tableState.globalFilter
              : '';

          return (
            <p className="text-grey-100 text-s font-normal">
              <Highlight text={getValue()} query={query} />
            </p>
          );
        },
      }),
      columnHelper.accessor((row) => row.decisionToCaseWorkflowType, {
        id: 'workflow-type',
        header: t('workflows:workflow_type'),
        size: 100,
        sortingFn: 'text',
        enableSorting: true,
        enableGlobalFilter: false,
        cell: ({ getValue }) => {
          const value = getValue();
          if (value === 'DISABLED') {
            return (
              <Tag color="grey" border="square">
                -
              </Tag>
            );
          }
          let tag, tooltip;
          if (value === 'CREATE_CASE') {
            tag = t('workflows:workflow_type.create_case');
            tooltip = t('workflows:workflow_type.create_case.tooltip');
          } else if (value === 'ADD_TO_CASE_IF_POSSIBLE') {
            tag = t('workflows:workflow_type.add_to_case_if_possible');
            tooltip = t(
              'workflows:workflow_type.add_to_case_if_possible.tooltip',
            );
          } else {
            assertNever('Invalid workflow type', value);
          }
          return (
            <Tag color="purple" border="square" className="gap-px uppercase">
              {tag}
              <Tooltip.Default className="max-w-60" content={tooltip}>
                <Icon className="relative size-4 shrink-0" icon="tip" />
              </Tooltip.Default>
            </Tag>
          );
        },
      }),
    ],
    [t],
  );

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const { rows, table, getBodyProps, getContainerProps } = useTable({
    data: scenarios,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    rowLink: (scenario) => (
      <Link
        to={getRoute('/workflows/:scenarioId', {
          scenarioId: fromUUID(scenario.id),
        })}
      />
    ),
  });

  return (
    <Page.Container>
      <Page.Header>
        <Icon icon="rule-settings" className="mr-2 size-6" />
        {t('navigation:workflows')}
      </Page.Header>
      <Page.Content className="max-w-screen-lg">
        <Callout className="w-full" variant="outlined">
          <p className="whitespace-pre text-wrap">
            <Trans
              t={t}
              i18nKey="workflows:workflows_description"
              components={{
                DocLink: <ExternalLink href={workflowsDocHref} />,
              }}
            />
          </p>
        </Callout>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 lg:gap-4">
            <div className="flex flex-row gap-2 lg:gap-4">
              <form className="flex grow items-center">
                <Input
                  className="w-full max-w-md"
                  disabled={scenarios.length === 0}
                  type="search"
                  aria-label={t('common:search')}
                  placeholder={t('common:search')}
                  startAdornment="search"
                  onChange={(event) => {
                    table.setGlobalFilter(event.target.value);
                  }}
                />
              </form>
            </div>
            {rows.length === 0 ? (
              <div className="bg-grey-00 border-grey-10 flex h-28 flex-col items-center justify-center rounded-lg border border-solid p-4">
                <p className="text-s font-medium">
                  {scenarios.length === 0
                    ? t('workflows:no_scenarios')
                    : t('workflows:no_matching_scenarios')}
                </p>
              </div>
            ) : (
              <>
                <Table.Container
                  {...getContainerProps()}
                  className="bg-grey-00"
                >
                  <Table.Header headerGroups={table.getHeaderGroups()} />
                  <Table.Body {...getBodyProps()}>
                    {rows.map((row) => {
                      return (
                        <Table.Row
                          key={row.id}
                          tabIndex={0}
                          className="hover:bg-grey-02 relative cursor-pointer"
                          row={row}
                        />
                      );
                    })}
                  </Table.Body>
                </Table.Container>
                <OffsetPaginationButtons
                  {...adaptOffsetPaginationButtonsProps(table)}
                />
              </>
            )}
          </div>
        </div>
      </Page.Content>
    </Page.Container>
  );
}

export function ErrorBoundary() {
  return <ErrorComponent error={useRouteError()} />;
}
