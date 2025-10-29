import { CollapsiblePaper, Page } from '@app-builder/components';
import { CreateFilter } from '@app-builder/components/Settings/Scenario/CreateFilter';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { isAdmin } from '@app-builder/models';
import {
  type DeleteExportedFieldPayload,
  useDeleteFilterMutation,
} from '@app-builder/queries/settings/scenarios/delete-filter';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { type Namespace } from 'i18next';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Modal, Table, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'settings'] satisfies Namespace,
};
type FilterRow = {
  id: string;
  tableId: string;
  associatedObject: string;
  definition: string;
  kind: 'trigger' | 'ingested';
  field?: string;
  path?: string[];
  name?: string;
};

type TriggerFieldItem = {
  tableId: string;
  tableName: string;
  fieldName: string;
  label: string;
};

type LinkPivotFieldItem = {
  baseTableId: string;
  pathLinks: string[];
  fieldName: string;
  label: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { user, dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  if (!isAdmin(user)) {
    return redirect(getRoute('/'));
  }
  const dataModel = await dataModelRepository.getDataModel();

  const exportedEntries = await Promise.all(
    dataModel.map(async (table) => {
      const exported = await dataModelRepository.getDataModelTableExportedFields(table.id);
      return [table.id, exported] as const;
    }),
  );
  const exportedFieldsByTable = Object.fromEntries(exportedEntries);

  const tableIdToName = new Map<string, string>(dataModel.map((t) => [t.id, t.name] as const));

  const filters: FilterRow[] = Object.entries(exportedFieldsByTable).flatMap(
    ([tableId, exported]) => {
      const tableName = tableIdToName.get(tableId) ?? '';

      const triggerFilters: FilterRow[] = (exported.triggerObjectFields ?? []).map((field) => ({
        id: `${tableId}::trigger::${field}`,
        tableId,
        associatedObject: tableName,
        definition: tableName ? `${tableName}.${field}` : field,
        kind: 'trigger' as const,
        field,
      }));

      const ingestedFilters: FilterRow[] = (exported.ingestedDataFields ?? [])
        .filter((field): field is NonNullable<typeof field> => Boolean(field?.name))
        .map((field) => {
          const pathArr = Array.isArray(field.path) ? field.path : [];
          const pathStr = pathArr.join('->');
          return {
            id: `${tableId}::ingested::${pathStr}.${field.name}`,
            tableId,
            associatedObject: tableName,
            definition: `${tableName}->${pathStr}.${field.name}`,
            kind: 'ingested' as const,
            field: field.name,
            name: field.name,
            path: pathArr,
          };
        });

      return [...triggerFilters, ...ingestedFilters];
    },
  );

  // Compute allowed tables (those with less than 5 filters)
  const MAX_FILTERS_PER_TABLE = 5;
  const filterCountByTableId = filters.reduce(
    (acc, filter) => {
      acc[filter.tableId] = (acc[filter.tableId] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const allowedTables = dataModel
    .filter((table) => (filterCountByTableId[table.id] ?? 0) < MAX_FILTERS_PER_TABLE)
    .map((t) => t.id);

  // Create a Set of existing filter IDs to exclude duplicates
  const existingFilterIds = new Set(filters.map((f) => f.id));

  // Compute all possible trigger filters
  const triggerFieldItems: TriggerFieldItem[] = dataModel
    .filter((t) => allowedTables.includes(t.id))
    .flatMap((table) =>
      table.fields.map((field) => ({
        tableId: table.id,
        tableName: table.name,
        fieldName: field.name,
        label: `${table.name}.${field.name}`,
      })),
    )
    .filter((item) => !existingFilterIds.has(`${item.tableId}::trigger::${item.fieldName}`));

  // Compute all possible linked field filters
  const pivots = await dataModelRepository.listPivots({});
  const linkedFieldItems: LinkPivotFieldItem[] = pivots
    .filter((p): p is Extract<typeof p, { type: 'link' }> => p.type === 'link')
    .flatMap((p) => {
      const targetTable = dataModel.find((t) => t.id === p.pivotTableId);
      if (!targetTable) return [];
      return targetTable.fields.map((f) => ({
        baseTableId: p.baseTableId,
        pathLinks: p.pathLinks,
        fieldName: f.name,
        label: `${p.baseTable}->${p.pathLinks.join('->')}.${f.name}`,
      }));
    })
    .filter((item) => {
      const pathStr = item.pathLinks.join('->');
      return !existingFilterIds.has(`${item.baseTableId}::ingested::${pathStr}.${item.fieldName}`);
    });

  return {
    filters,
    dataModel,
    pivots,
    allowedTables,
    triggerFieldItems,
    linkedFieldItems,
  };
}

export default function Filters() {
  const revalidate = useLoaderRevalidator();

  const { t } = useTranslation(['settings', 'common']);
  const { filters, dataModel, triggerFieldItems, linkedFieldItems } =
    useLoaderData<typeof loader>();

  const deleteFilterMutation = useDeleteFilterMutation();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<null | FilterRow>(null);
  const columnHelper = createColumnHelper<FilterRow>();
  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.associatedObject, {
        id: 'associatedObject',
        header: t('settings:filters.associated-object.row.header.label'),
        size: 240,
      }),
      columnHelper.accessor((row) => row.definition, {
        id: 'definition',
        header: t('settings:filters.definition.row.header.label'),
      }),
      columnHelper.display({
        id: 'actions',
        size: 80,
        cell: ({ row }) => {
          return (
            <div className="flex justify-center">
              <ButtonV2
                variant="secondary"
                mode="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={async (e) => {
                  e.stopPropagation();
                  setItemToDelete(row.original);
                  setIsConfirmOpen(true);
                }}
                aria-label="Delete filter"
                title="Delete filter"
              >
                <Icon icon="delete" className="size-4" />
              </ButtonV2>
            </div>
          );
        },
      }),
    ];
  }, [columnHelper, deleteFilterMutation]);

  const {
    table,
    getBodyProps,
    rows: tableRows,
    getContainerProps,
  } = useTable({
    data: filters,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });
  return (
    <Page.Container>
      <Page.Content>
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:filters-settings')}</span>
            <CreateFilter
              dataModel={dataModel}
              triggerFieldItems={triggerFieldItems}
              linkedFieldItems={linkedFieldItems}
            />
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content className="flex flex-col h-full">
            <div className="flex flex-col gap-4 flex-1 min-h-0">
              <Table.Container {...getContainerProps()} className="flex-1 min-h-0">
                <Table.Header headerGroups={table.getHeaderGroups()} />
                <Table.Body {...getBodyProps()}>
                  {tableRows.map((row) => (
                    <Table.Row key={row.id} row={row} className="hover:bg-purple-98 group" />
                  ))}
                </Table.Body>
              </Table.Container>
            </div>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
        <Modal.Root open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <Modal.Content size="medium">
            <Modal.Title>{t('settings:filters.delete_filter.title')}</Modal.Title>
            <Modal.Description>
              <div className="p-6 text-left">{t('settings:filters.delete_filter.content')}</div>
            </Modal.Description>
            <Modal.Footer>
              <div className="bg-grey-98 flex justify-end gap-3 border-t p-4">
                <ButtonV2 variant="secondary" onClick={() => setIsConfirmOpen(false)}>
                  {t('common:cancel')}
                </ButtonV2>
                <ButtonV2
                  variant="destructive"
                  onClick={() => {
                    if (!itemToDelete) return;
                    const payload: DeleteExportedFieldPayload =
                      itemToDelete.kind === 'trigger'
                        ? { triggerObjectField: itemToDelete.field! }
                        : {
                            ingestedDataField: {
                              path: itemToDelete.path ?? [],
                              name: itemToDelete.name!,
                            },
                          };
                    deleteFilterMutation
                      .mutateAsync({
                        tableId: itemToDelete.tableId,
                        payload,
                      })
                      .then((res) => {
                        setIsConfirmOpen(false);
                        setItemToDelete(null);
                        revalidate();
                      });
                  }}
                >
                  {t('settings:filters.delete_filter')}
                </ButtonV2>
              </div>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Root>
      </Page.Content>
    </Page.Container>
  );
}
