import { ErrorComponent, Page } from '@app-builder/components';
import { DetectionNavigationTabs } from '@app-builder/components/Detection';
import { CreateListModal } from '@app-builder/components/Lists/CreateListModal';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type CustomList } from '@app-builder/models/custom-list';
import { hasAnyEntitlement, isCreateListAvailable } from '@app-builder/services/feature-access';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { createColumnHelper, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tag, useVirtualTable } from 'ui-design-system';

const listsLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { user, customListsRepository, entitlements } = context.authInfo;

    const customLists = await customListsRepository.listCustomLists();

    return {
      customLists,
      isCreateListAvailable: isCreateListAvailable(user),
      isIpGpsAvailable: hasAnyEntitlement(entitlements),
    };
  });

const columnHelper = createColumnHelper<CustomList>();

export const Route = createFileRoute('/_app/_builder/detection/lists/')({
  loader: () => listsLoader(),
  errorComponent: ({ error }) => {
    Sentry.captureException(error);
    return <ErrorComponent error={error} />;
  },
  component: DetectionListsPage,
});

function DetectionListsPage() {
  const { t } = useTranslation(['lists', 'navigation']);
  const { customLists, isCreateListAvailable, isIpGpsAvailable } = Route.useLoaderData();

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
        size: 400,
      }),
      columnHelper.accessor('kind', {
        id: 'kind',
        header: t('lists:kind'),
        size: 180,
        cell: ({ getValue }) => {
          const kind = getValue();
          return <Tag color="purple">{t(`lists:kind.${kind}`)}</Tag>;
        },
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
    rowLink: ({ id }) => <Link to="/detection/lists/$listId" params={{ listId: fromUUIDtoSUUID(id) }} />,
  });

  return (
    <Page.Main>
      <Page.Container>
        <Page.ContentV2 className="gap-v2-md max-w-(--breakpoint-xl)">
          <DetectionNavigationTabs
            actions={isCreateListAvailable ? <CreateListModal isIpGpsAvailable={isIpGpsAvailable} /> : undefined}
          />
          <div className="flex flex-col gap-4">
            {isEmpty ? (
              <div className="bg-surface-card border-grey-border flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-4">
                <p className="text-s font-medium">{t('lists:empty_custom_lists_list')}</p>
              </div>
            ) : (
              <Table.Container {...getContainerProps()} className="bg-surface-card max-h-[70dvh]">
                <Table.Header headerGroups={table.getHeaderGroups()} />
                <Table.Body {...getBodyProps()}>
                  {rows.map((row) => (
                    <Table.Row key={row.id} row={row} />
                  ))}
                </Table.Body>
              </Table.Container>
            )}
          </div>
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
}
