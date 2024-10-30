import { CollapsiblePaper, Page } from '@app-builder/components';
import { CreateTag } from '@app-builder/routes/ressources+/settings+/tags+/create';
import { DeleteTag } from '@app-builder/routes/ressources+/settings+/tags+/delete';
import { UpdateTag } from '@app-builder/routes/ressources+/settings+/tags+/update';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { type Tag } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useTable } from 'ui-design-system';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;
  const { organization, user } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  if (!featureAccessService.isReadTagAvailable(user)) {
    return redirect(getRoute('/'));
  }

  const tags = await organization.listTags({ withCaseCount: true });

  return json({
    tags,
    isCreateTagAvailable: featureAccessService.isCreateTagAvailable(user),
    isEditTagAvailable: featureAccessService.isEditTagAvailable(user),
    isDeleteTagAvailable: featureAccessService.isDeleteTagAvailable(user),
  });
}

const columnHelper = createColumnHelper<Tag>();

export default function Tags() {
  const { t } = useTranslation(['settings']);
  const {
    tags,
    isCreateTagAvailable,
    isEditTagAvailable,
    isDeleteTagAvailable,
  } = useLoaderData<typeof loader>();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('settings:tags.name'),
        size: 200,
      }),
      columnHelper.accessor((row) => row.color, {
        id: 'color',
        header: t('settings:tags.color'),
        size: 100,
        cell: ({ getValue }) => (
          <div
            className="size-4 rounded-full"
            style={{ backgroundColor: getValue() }}
          ></div>
        ),
      }),
      columnHelper.accessor((row) => row.cases_count, {
        id: 'cases',
        header: t('settings:tags.cases'),
        size: 200,
      }),
      ...(isEditTagAvailable || isDeleteTagAvailable
        ? [
            columnHelper.display({
              id: 'actions',
              size: 100,
              cell: ({ cell }) => {
                return (
                  <div className="group-hover:text-grey-100 flex gap-2 text-transparent">
                    {isEditTagAvailable ? (
                      <UpdateTag tag={cell.row.original} />
                    ) : null}
                    {isDeleteTagAvailable ? (
                      <DeleteTag tag={cell.row.original} />
                    ) : null}
                  </div>
                );
              },
            }),
          ]
        : []),
    ];
  }, [isDeleteTagAvailable, isEditTagAvailable, t]);

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: tags,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Page.Container>
      <Page.Content className="max-w-screen-xl">
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:tags')}</span>
            {isCreateTagAvailable ? <CreateTag /> : null}
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <Table.Container {...getContainerProps()} className="max-h-96">
              <Table.Header headerGroups={table.getHeaderGroups()} />
              <Table.Body {...getBodyProps()}>
                {rows.map((row) => {
                  return (
                    <Table.Row
                      key={row.id}
                      tabIndex={0}
                      className="hover:bg-purple-05 group"
                      row={row}
                    />
                  );
                })}
              </Table.Body>
            </Table.Container>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
      </Page.Content>
    </Page.Container>
  );
}
