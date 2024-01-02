import {
  Callout,
  ErrorComponent,
  Page,
  usePermissionsContext,
} from '@app-builder/components';
import { DeleteList } from '@app-builder/routes/ressources+/lists+/delete';
import { EditList } from '@app-builder/routes/ressources+/lists+/edit';
import { NewListValue } from '@app-builder/routes/ressources+/lists+/value_create';
import { DeleteListValue } from '@app-builder/routes/ressources+/lists+/value_delete';
import { serverServices } from '@app-builder/services/init.server';
import { fromParams } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import {
  type ColumnDef,
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
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const listId = fromParams(params, 'listId');
  const { custom_list } = await apiClient.getCustomList(listId);

  return json(custom_list);
}

export const handle = {
  i18n: ['lists', 'common'] satisfies Namespace,
};

type ListValues = {
  id: string;
  value: string;
};

export default function Lists() {
  const customList = useLoaderData<typeof loader>();
  const listValues = customList.values ?? [];
  const { t } = useTranslation(handle.i18n);
  const { canManageListItem, canManageList } = usePermissionsContext();

  const columns = useMemo<ColumnDef<ListValues>[]>(
    () => [
      {
        accessorKey: 'value',
        header: t('lists:value', { count: listValues.length }),
        size: 600,
        sortingFn: 'text',
        enableSorting: true,
        cell: ({ cell }) => {
          return (
            <div className="group flex items-center justify-between">
              <p className="text-grey-100 text-s font-medium">
                {cell.row.original.value}
              </p>

              {canManageListItem ? (
                <DeleteListValue
                  listId={customList.id}
                  listValueId={cell.row.original.id}
                  value={cell.row.original.value}
                >
                  <button
                    className="text-grey-00 group-hover:text-grey-100 transition-colors duration-200 ease-in-out"
                    name="delete"
                    tabIndex={-1}
                  >
                    <Icon icon="delete" className="h-6 w-6 shrink-0" />
                  </button>
                </DeleteListValue>
              ) : null}
            </div>
          );
        },
      },
    ],
    [customList.id, listValues.length, t, canManageListItem],
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
      <Page.Header className="justify-between ">
        <div className="flex w-full flex-row items-center justify-between	gap-4">
          <div className="flex flex-row items-center gap-4">
            <Link to="./.." className="mr-4">
              <Page.BackButton />
            </Link>
            {customList.name}
          </div>
          {canManageList ? (
            <EditList
              listId={customList.id}
              name={customList.name}
              description={customList.description}
            />
          ) : null}
        </div>
      </Page.Header>
      <Page.Content scrollable={false} className="max-w-3xl">
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
            {canManageListItem ? <NewListValue listId={customList.id} /> : null}
          </div>
          {virtualTable.isEmpty ? (
            <div className="bg-grey-00 border-grey-10 flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-4">
              <p className="text-s font-medium">
                {t('lists:empty_custom_list_values_list')}
              </p>
            </div>
          ) : (
            <Table.Default {...virtualTable}></Table.Default>
          )}
        </div>
        {canManageList ? <DeleteList listId={customList.id} /> : null}
      </Page.Content>
    </Page.Container>
  );
}
export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <ErrorComponent error={error} />;
}

// Correspond to this part of the UI : https://www.figma.com/file/JW6QvnhBtdZDcKvLdg9s5T/Marble-Portal?node-id=6377%3A53150&mode=dev
//
// const MAX_SCENARIOS = 4;
// function ScenariosList({ scenarios }: { scenarios: string[] }) {
//   const { t } = useTranslation(handle.i18n);

//   return (
//     <>
//       <div className="flex flex-row gap-2">
//         <Scenarios height="24px" width="24px" className="flex-shrink-0" />
//         <p className="text-m text-grey-100 font-semibold">
//           {t('lists:used_in_scenarios')}
//         </p>
//       </div>
//       <div className="flex flex-wrap gap-2">
//         {scenarios.slice(0, MAX_SCENARIOS).map((scenario) => (
//           <div
//             key={scenario}
//             className="border-grey-10 text-s text-grey-100 flex h-10 items-center rounded border px-4 align-middle font-medium"
//           >
//             {scenario}
//           </div>
//         ))}
//         {scenarios.length > MAX_SCENARIOS && (
//           <Dialog.Root>
//             <Dialog.Trigger asChild>
//               <Button variant="secondary">
//                 {t('lists:other_scenarios', {
//                   count: scenarios.length - MAX_SCENARIOS,
//                 })}
//               </Button>
//             </Dialog.Trigger>
//             <Dialog.Portal>
//               <Dialog.Overlay className="bg-grey-100 animate-overlayShow fixed inset-0 items-center justify-center bg-opacity-40" />
//               <Dialog.Content className="bg-grey-00 fixed left-1/2 top-1/2 flex w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-6 rounded-lg p-6">
//                 <Dialog.Title className="flex flex-row gap-2">
//                   <Scenarios
//                     height="24px"
//                     width="24px"
//                     className="flex-shrink-0"
//                   />
//                   <p className="text-m text-grey-100 flex-1 font-semibold">
//                     {t('lists:used_in_scenarios')}
//                   </p>
//                   <Dialog.Close aria-label="Close">
//                     <Cross
//                       height="24px"
//                       width="24px"
//                       className="flex-shrink-0"
//                     />
//                   </Dialog.Close>
//                 </Dialog.Title>
//                 <ScrollArea.Root>
//                   <ScrollArea.Viewport className="max-h-72">
//                     <div className="flex flex-col gap-2 pr-4">
//                       {scenarios.map((scenario) => (
//                         <div
//                           key={scenario}
//                           className="border-grey-10 text-s text-grey-100 flex h-14 items-center rounded border px-4 align-middle font-medium"
//                         >
//                           {scenario}
//                         </div>
//                       ))}
//                     </div>
//                   </ScrollArea.Viewport>
//                   <ScrollArea.Scrollbar>
//                     <ScrollArea.Thumb />
//                   </ScrollArea.Scrollbar>
//                 </ScrollArea.Root>
//               </Dialog.Content>
//             </Dialog.Portal>
//           </Dialog.Root>
//         )}
//       </div>
//     </>
//   );
// }
