import { Callout, ErrorComponent, Page } from '@app-builder/components';
import { DeleteList } from '@app-builder/routes/ressources+/lists+/delete';
import { EditList } from '@app-builder/routes/ressources+/lists+/edit';
import { NewListValue } from '@app-builder/routes/ressources+/lists+/value_create';
import { DeleteListValue } from '@app-builder/routes/ressources+/lists+/value_delete';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Table, useVirtualTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;
  const { user, customListsRepository } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );

  const listId = fromParams(params, 'listId');
  const customList = await customListsRepository.getCustomList(listId);

  return json({
    customList: customList,
    listFeatureAccess: {
      isCreateListValueAvailable:
        featureAccessService.isCreateListValueAvailable(user),
      isDeleteListValueAvailable:
        featureAccessService.isDeleteListValueAvailable(user),
      isEditListAvailable: featureAccessService.isEditListAvailable(user),
      isDeleteListAvailable: featureAccessService.isDeleteListAvailable(user),
    },
  });
}

export const handle = {
  i18n: ['lists', 'common'] satisfies Namespace,
};

type CustomListValue = {
  id: string;
  value: string;
};

const columnHelper = createColumnHelper<CustomListValue>();

export default function Lists() {
  const { customList, listFeatureAccess } = useLoaderData<typeof loader>();
  const listValues = customList.values ?? [];
  const { t } = useTranslation(handle.i18n);

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.value, {
        id: 'value',
        header: t('lists:value', { count: listValues.length }),
        size: 500,
        sortingFn: 'text',
        enableSorting: true,
        cell: ({ getValue, row }) => {
          const value = getValue();
          return (
            <div className="group flex items-center justify-between">
              <p className="text-grey-100 text-s font-medium">{value}</p>
              {listFeatureAccess.isDeleteListValueAvailable ? (
                <DeleteListValue
                  listId={customList.id}
                  listValueId={row.original.id}
                  value={value}
                >
                  <button
                    className="text-grey-00 group-hover:text-grey-100 transition-colors duration-200 ease-in-out"
                    name="delete"
                    tabIndex={-1}
                  >
                    <Icon icon="delete" className="size-6 shrink-0" />
                  </button>
                </DeleteListValue>
              ) : null}
            </div>
          );
        },
      }),
    ],
    [
      t,
      listValues.length,
      listFeatureAccess.isDeleteListValueAvailable,
      customList.id,
    ],
  );

  const virtualTable = useVirtualTable({
    data: listValues,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="flex w-full flex-row items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-4">
            <Page.BackButton />
            <span className="line-clamp-2 text-left">{customList.name}</span>
          </div>
          {listFeatureAccess.isEditListAvailable ? (
            <EditList
              listId={customList.id}
              name={customList.name}
              description={customList.description}
            />
          ) : null}
        </div>
      </Page.Header>
      <Page.Content className="max-w-3xl">
        <Callout className="w-full" variant="outlined">
          {customList.description}
        </Callout>
        {/* <ScenariosList scenarios={scenarios} /> */}
        <div className="flex flex-col gap-2 overflow-hidden lg:gap-4">
          <div className="flex flex-row gap-2 lg:gap-4">
            <form className="flex grow items-center">
              <Input
                className="w-full"
                disabled={listValues.length === 0}
                type="search"
                aria-label={t('common:search')}
                placeholder={t('common:search')}
                startAdornment="search"
                onChange={(event) => {
                  virtualTable.table.setGlobalFilter(event.target.value);
                }}
              />
            </form>
            {listFeatureAccess.isCreateListValueAvailable ? (
              <NewListValue listId={customList.id} />
            ) : null}
          </div>
          {virtualTable.isEmpty ? (
            <div className="bg-grey-00 border-grey-10 flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-4">
              <p className="text-s font-medium">
                {listValues.length > 0
                  ? t('lists:empty_custom_list_matches')
                  : t('lists:empty_custom_list_values_list')}
              </p>
            </div>
          ) : (
            <Table.Default {...virtualTable}></Table.Default>
          )}
        </div>
        {listFeatureAccess.isDeleteListAvailable ? (
          <DeleteList listId={customList.id} />
        ) : null}
      </Page.Content>
    </Page.Container>
  );
}
export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <ErrorComponent error={error} />;
}
