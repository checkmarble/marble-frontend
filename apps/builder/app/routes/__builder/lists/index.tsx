import { faker } from '@faker-js/faker';
import { Page } from '@marble-front/builder/components';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { getRoute } from '@marble-front/builder/services/routes';
import { parseFormSafe } from '@marble-front/builder/utils/input-validation';
import { fromUUID } from '@marble-front/builder/utils/short-uuid';
import { Button, HiddenInputs, Table, Tag, useVirtualTable } from '@marble-front/ui/design-system';
import { Lists } from '@marble-front/ui/icons';
import { type ActionArgs, json, type LoaderArgs } from '@remix-run/node';
import { Link, useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

type List = {
  id: string;
  name: string;
  description: string;
};

const formSchema = z.object({
  listId: z.string().uuid()
});

export async function action({ request }: ActionArgs) {
  const { apiClient } = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  console.log(request.method)
  switch (request.method) {
    case 'POST': {
      await apiClient.createCustomLists({name: 'New test list', description: 'test pour add une liste'});
      break;
    }
    case 'PATCH': {
      const parsedForm = await parseFormSafe(request, formSchema);
      const { listId } = parsedForm.data;
      console.log('patch listId: ', listId)
      await apiClient.updateCustomList(listId, {name: 'Updated test list', description: 'test pour update une liste'});
      break;
    }
    case 'DELETE': {
      const parsedForm = await parseFormSafe(request, formSchema);
      const { listId } = parsedForm.data;
      console.log('delete listId: ', listId)
      await apiClient.deleteCustomList(listId);
      break;
    }
  }
  return null;
}

export async function loader({ request }: LoaderArgs) {
  const { apiClient } = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const customList = await apiClient.listCustomLists();

  return json(customList);
}
export const handle = {
  i18n: ['lists', 'navigation'] satisfies Namespace,
};

export default function ListsPage() {
  const { t } = useTranslation(handle.i18n);
  const customList = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const navigate = useNavigate();
  const data = customList.custom_lists

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
    data,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnVisibility: { _id: false },
  },
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
      <Table.Container {...getContainerProps()}>
          <Table.Header headerGroups={table.getHeaderGroups()} />
          <Table.Body {...getBodyProps()}>
            {rows.map((row) => (
              <Table.Row
                key={row.id}
                className="hover:bg-grey-02 cursor-pointer"
                row={row}
                onClick={() => {
                  navigate(`./${row.original.id}`);
                }}
              />
            ))}
          </Table.Body>
        </Table.Container>
      </Page.Content>
    </Page.Container>
  );
}
