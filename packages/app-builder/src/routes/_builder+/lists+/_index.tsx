import { ErrorComponent, Page } from '@app-builder/components';
import { type CustomList } from '@app-builder/models/custom-list';
import { CreateList } from '@app-builder/routes/ressources+/lists+/create';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useVirtualTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;
  const { user, customListsRepository } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );
  const customLists = await customListsRepository.listCustomLists();

  return json({
    customLists,
    isCreateListAvailable: featureAccessService.isCreateListAvailable(user),
  });
}

export const handle = {
  i18n: ['lists', 'navigation'] satisfies Namespace,
};

const columnHelper = createColumnHelper<CustomList>();

export default function ListsPage() {
  const { t } = useTranslation(handle.i18n);
  const { customLists, isCreateListAvailable } = useLoaderData<typeof loader>();

  const navigate = useNavigate();

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
    ],
    [t],
  );

  const { table, isEmpty, getBodyProps, rows, getContainerProps } =
    useVirtualTable({
      data: customLists,
      columns,
      columnResizeMode: 'onChange',
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
    });

  return (
    <Page.Main>
      <Page.Header>
        <Icon icon="lists" className="mr-2 size-6" />
        {t('navigation:lists')}
      </Page.Header>
      <Page.Container>
        <Page.Content className="max-w-screen-xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-end">
              {isCreateListAvailable ? <CreateList /> : null}
            </div>
            {isEmpty ? (
              <div className="bg-grey-00 border-grey-10 flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-4">
                <p className="text-s font-medium">
                  {t('lists:empty_custom_lists_list')}
                </p>
              </div>
            ) : (
              <Table.Container
                {...getContainerProps()}
                className="bg-grey-00 max-h-[70dvh]"
              >
                <Table.Header headerGroups={table.getHeaderGroups()} />
                <Table.Body {...getBodyProps()}>
                  {rows.map((row) => (
                    <Table.Row
                      key={row.id}
                      className="hover:bg-purple-05 cursor-pointer"
                      row={row}
                      onClick={() => {
                        navigate(
                          getRoute('/lists/:listId', {
                            listId: fromUUID(row.original.id),
                          }),
                        );
                      }}
                    />
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
