import { CollapsiblePaper, Page } from '@app-builder/components';
import { CreateTag } from '@app-builder/components/Settings/Tags/CreateTag';
import { DeleteTag } from '@app-builder/components/Settings/Tags/DeleteTag';
import { UpdateTag } from '@app-builder/components/Settings/Tags/UpdateTag';
import { ColorPreview } from '@app-builder/components/Tags/ColorPreview';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type TagColor } from '@app-builder/models/tags';
import {
  isCreateTagAvailable,
  isDeleteTagAvailable,
  isEditTagAvailable,
  isReadTagAvailable,
} from '@app-builder/services/feature-access';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { type Tag } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useTable } from 'ui-design-system';

const tagsLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function tagsLoader({ context }) {
    const { organization, user } = context.authInfo;

    if (!isReadTagAvailable(user)) throw redirect({ to: '/' });

    const [caseTags, objectTags] = await Promise.all([
      organization
        .listTags({ withCaseCount: true })
        .then((tags) => tags.map((t) => ({ ...t, target: 'case' as const }))),
      organization
        .listTags({ target: 'object' })
        .then((tags) => tags.map((t) => ({ ...t, target: 'object' as const }))),
    ]);

    return {
      tags: [...caseTags, ...objectTags],
      isCreateTagAvailable: isCreateTagAvailable(user),
      isEditTagAvailable: isEditTagAvailable(user),
      isDeleteTagAvailable: isDeleteTagAvailable(user),
    };
  });

export const Route = createFileRoute('/_app/_builder/settings/tags')({
  loader: () => tagsLoader(),
  component: Tags,
});

const columnHelper = createColumnHelper<(Tag & { target: 'case' }) | (Tag & { target: 'object' })>();

function Tags() {
  const { t } = useTranslation(['settings']);
  const { tags, isCreateTagAvailable, isEditTagAvailable, isDeleteTagAvailable } = Route.useLoaderData();

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
        cell: ({ getValue }) => <ColorPreview color={getValue() as TagColor} />,
      }),
      columnHelper.accessor((row) => row.cases_count, {
        id: 'cases',
        header: t('settings:tags.cases'),
        size: 200,
      }),
      columnHelper.accessor((row) => row.target, {
        id: 'target',
        header: t('settings:tags.target'),
        cell: ({ cell }) => {
          return t(`settings:tags.target.${cell.getValue()}`);
        },
        size: 100,
      }),
      ...(isEditTagAvailable || isDeleteTagAvailable
        ? [
            columnHelper.display({
              id: 'actions',
              size: 100,
              cell: ({ cell }) => {
                return (
                  <div className="flex gap-2">
                    {isEditTagAvailable ? (
                      <div className="group-hover:text-grey-primary focus-within:text-grey-primary text-transparent">
                        <UpdateTag tag={cell.row.original} />
                      </div>
                    ) : null}
                    {isDeleteTagAvailable ? (
                      <div className="group-hover:text-grey-primary focus-within:text-grey-primary text-transparent">
                        <DeleteTag tag={cell.row.original} />
                      </div>
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
      <Page.Content className="max-w-(--breakpoint-xl)">
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
                  return <Table.Row key={row.id} className="hover:bg-surface-row-hover group" row={row} />;
                })}
              </Table.Body>
            </Table.Container>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
      </Page.Content>
    </Page.Container>
  );
}
