import { Callout, Page } from '@marble-front/builder/components';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { fromParams } from '@marble-front/builder/utils/short-uuid';
import { Input, Table, useVirtualTable } from '@marble-front/ui/design-system';
import { Search } from '@marble-front/ui/icons';
import { json, type LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export async function loader({ request, params }: LoaderArgs) {
  const { apiClient } = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const listId = fromParams(params, 'listId');

  const { custom_list } = await apiClient.getCustomList(listId);

  return json(custom_list);
}

// const formSchema = z.object({
//   listValueId: z.string().uuid(),
// });

// export async function action({ request, params }: ActionArgs) {
//   const { apiClient } = await authenticator.isAuthenticated(request, {
//     failureRedirect: '/login',
//   });
//   invariant(params.listId, `params.listId is required`);

//   switch (request.method) {
//     case 'POST': {
//       await apiClient.createCustomListValue(params.listId, {
//         value: 'Added Value',
//       });
//       break;
//     }
//     case 'DELETE': {
//       const parsedForm = await parseFormSafe(request, formSchema);
//       const { listValueId } = parsedForm.data;
//       await apiClient.deleteCustomListValue(params.listId, { id: listValueId });
//       break;
//     }
//   }
//   return null;
// }

export const handle = {
  i18n: ['lists', 'common'] satisfies Namespace,
};

// Correspond to this part of the UI : https://www.figma.com/file/JW6QvnhBtdZDcKvLdg9s5T/Marble-Portal?node-id=3920%3A31986&mode=dev
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
//               <Dialog.Content className="bg-grey-00 fixed left-1/2 top-1/2 flex w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-8 rounded-lg p-8">
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

type ListValues = {
  id: string;
  value: string;
};

export default function Lists() {
  const customList = useLoaderData<typeof loader>();
  // const fetcher = useFetcher<typeof action>();
  const { t } = useTranslation(handle.i18n);

  const columns = useMemo<ColumnDef<ListValues>[]>(
    () => [
      {
        accessorKey: 'value',
        header: t('lists:values'),
        size: 600,
        sortingFn: 'text',
        enableSorting: true,
      },
      // {
      //   id: 'action',
      //   header: t('lists:action'),
      //   accessor: 'id',
      //   cell: ({cell}) => (
      //   <div>
      //     <fetcher.Form method="delete">
      //       <HiddenInputs listValueId={cell.row.original.id}/>
      //       <Button type='submit' name='delete' onClick={(event) => {event.stopPropagation()}}>Delete</Button>
      //     </fetcher.Form>
      //   </div>
      //   )
      // },
    ],
    [t]
  );

  const virtualTable = useVirtualTable({
    data: customList.values,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Page.Container>
      <Page.Header>
        <Link to="./.." className="mr-4">
          <Page.BackButton />
        </Link>
        {customList.name}
      </Page.Header>
      <Page.Content scrollable={false} className="max-w-3xl">
        <Callout className="w-full">{customList.description}</Callout>
        {/* <ScenariosList scenarios={scenarios} /> */}
        <div className="flex flex-col gap-2 overflow-hidden lg:gap-4">
          <form className="flex items-center">
            <Input
              className="w-full"
              type="search"
              aria-label={t('common:search')}
              placeholder={t('common:search')}
              startAdornment={<Search />}
              onChange={(event) => {
                virtualTable.table.setGlobalFilter(event.target.value);
              }}
            />
          </form>
          {/* <fetcher.Form method="POST">
            <Button>Add List Value</Button>
          </fetcher.Form> */}
          {customList.values.length > 0 && <Table.Default {...virtualTable} />}
        </div>
      </Page.Content>
    </Page.Container>
  );
}
