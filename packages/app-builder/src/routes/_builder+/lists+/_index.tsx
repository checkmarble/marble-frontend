import { ErrorComponent, Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { CreateListModal } from '@app-builder/components/Lists/CreateListModal';
import { type CustomList } from '@app-builder/models/custom-list';
import { isCreateListAvailable } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { createColumnHelper, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useVirtualTable } from 'ui-design-system';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { user, customListsRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const customLists = await customListsRepository.listCustomLists();

  return Response.json({
    customLists,
    isCreateListAvailable: isCreateListAvailable(user),
  });
}

export const handle = {
  i18n: ['lists', 'navigation'] satisfies Namespace,
};

const columnHelper = createColumnHelper<CustomList>();

export default function ListsPage() {
  const { t } = useTranslation(handle.i18n);
  const { customLists, isCreateListAvailable } = useLoaderData<typeof loader>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: t('lists:name'),
        size: 200,
        sortingFn: 'text',
        enableSorting: true,
      }),
      columnHelper.accessor('description', {
        id: 'description',
        header: t('lists:description'),
        size: 500,
      }),
      columnHelper.accessor('ValuesCount', {
        id: 'valuesCount',
        header: t('lists:values_count'),
        size: 80,
        cell: ({ getValue }) => {
          const { count, hasMore } = getValue();
          return (
            <span>
              {count}
              {hasMore ? '+' : null} {t('lists:list.row.values_count', { count })}
            </span>
          );
        },
      }),
    ],
    [t],
  );

  const { table, isEmpty, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: customLists,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    rowLink: ({ id }) => (
      <Link
        to={getRoute('/lists/:listId', {
          listId: fromUUIDtoSUUID(id),
        })}
      />
    ),
  });

  return (
    <Page.Main>
      <Page.Header>
        <BreadCrumbs />
      </Page.Header>
      <Page.Container>
        <Page.Content className="max-w-(--breakpoint-xl)">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-end">
              {isCreateListAvailable ? <CreateListModal /> : null}
            </div>
            {isEmpty ? (
              <div className="bg-grey-100 border-grey-90 flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-4">
                <p className="text-s font-medium">{t('lists:empty_custom_lists_list')}</p>
              </div>
            ) : (
              <Table.Container {...getContainerProps()} className="bg-grey-100 max-h-[70dvh]">
                <Table.Header headerGroups={table.getHeaderGroups()} />
                <Table.Body {...getBodyProps()}>
                  {rows.map((row) => (
                    <Table.Row key={row.id} row={row} />
                  ))}
                </Table.Body>
              </Table.Container>
            )}
          </div>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <ErrorComponent error={error} />;
}
