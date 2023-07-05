import { Page } from '@marble-front/builder/components';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { getRoute } from '@marble-front/builder/services/routes';
import { fromUUID } from '@marble-front/builder/utils/short-uuid';
import { Table, useVirtualTable } from '@marble-front/ui/design-system';
import { Lists } from '@marble-front/ui/icons';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type List = {
  id: string;
  name: string;
  description: string;
};

export async function loader({ request }: LoaderArgs) {
  const { apiClient } = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const { custom_lists } = await apiClient.listCustomLists();

  return json(custom_lists);
}

// const formSchema = z.object({
//   listId: z.string().uuid(),
// });

// export async function action({ request }: ActionArgs) {
//   const { apiClient } = await authenticator.isAuthenticated(request, {
//     failureRedirect: '/login',
//   });

//   switch (request.method) {
//     case 'POST': {
//       await apiClient.createCustomList({
//         name: 'New test list',
//         description: 'test pour add une liste',
//       });
//       break;
//     }
//     case 'PATCH': {
//       const parsedForm = await parseFormSafe(request, formSchema);
//       const { listId } = parsedForm.data;
//       await apiClient.updateCustomList(listId, {
//         name: 'Updated test list',
//         description: 'test pour update une liste',
//       });
//       break;
//     }
//     case 'DELETE': {
//       const parsedForm = await parseFormSafe(request, formSchema);
//       const { listId } = parsedForm.data;
//       await apiClient.deleteCustomList(listId);
//       break;
//     }
//   }
//   return null;
// }

export const handle = {
  i18n: ['lists', 'navigation'] satisfies Namespace,
};

export default function ListsPage() {
  const { t } = useTranslation(handle.i18n);
  const customList = useLoaderData<typeof loader>();
  // const fetcher = useFetcher<typeof action>();

  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<List>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('lists:name'),
        size: 200,
        sortingFn: 'text',
        enableSorting: true,
      },
      {
        id: 'description',
        accessorFn: (row) => row.description,
        header: t('lists:description'),
        size: 500,
      },
      // {
      //   id: 'action',
      //   header: t('lists:action'),
      //   accessor: 'id',
      //   cell: ({cell}) => (
      //   <div>
      //     <fetcher.Form method="patch">
      //       <HiddenInputs listId={cell.row.original.id}/>
      //       <Button type='submit' name='edit' onClick={(event) => {event.stopPropagation()}}>Edit</Button>
      //     </fetcher.Form>
      //     <fetcher.Form method="delete">
      //       <HiddenInputs listId={cell.row.original.id}/>
      //       <Button type='submit' name='delete' onClick={(event) => {event.stopPropagation()}}>Delete</Button>
      //     </fetcher.Form>
      //   </div>
      //   )
      // },
    ],
    [t]
  );

  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: customList,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Page.Container>
      <Page.Header>
        <Lists className="mr-2" height="24px" width="24px" />
        {t('navigation:lists')}
      </Page.Header>
      <Page.Content scrollable={false}>
        {/* <fetcher.Form method="POST">
          <Button>Create List</Button>
        </fetcher.Form> */}
        {rows.length > 0 ? (
          <Table.Container {...getContainerProps()}>
            <Table.Header headerGroups={table.getHeaderGroups()} />
            <Table.Body {...getBodyProps()}>
              {rows.map((row) => (
                <Table.Row
                  key={row.id}
                  className="hover:bg-grey-02 cursor-pointer"
                  row={row}
                  onClick={() => {
                    navigate(
                      getRoute('/lists/:listId', {
                        listId: fromUUID(row.original.id),
                      })
                    );
                  }}
                />
              ))}
            </Table.Body>
          </Table.Container>
        ) : (
          <div className="bg-grey-00 border-grey-10 flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-4">
            <p className="text-s font-medium">
              {t('lists:empty_custom_lists_list')}
            </p>
          </div>
        )}
      </Page.Content>
    </Page.Container>
  );
}
