import { CollapsiblePaper, Page } from '@app-builder/components';
import { CreateFilter } from '@app-builder/components/Settings/Scenario/CreateFilter';
import { type ExportedFields, isAdmin } from '@app-builder/models';
import {
  type DeleteExportedFieldPayload,
  useDeleteFilterMutation,
} from '@app-builder/queries/settings/scenarios/filter';
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
  const exportedFieldsByTable = Object.fromEntries(exportedEntries) as Record<
    string,
    ExportedFields
  >;

  return {
    exportedFieldsByTable,
    dataModel,
    pivots: await dataModelRepository.listPivots({}),
  };
}

export default function Filters() {
  const { t } = useTranslation(['settings', 'common']);
  const { dataModel, exportedFieldsByTable, pivots } = useLoaderData<typeof loader>();

  const totalFiltersCount = useMemo(() => {
    return Object.values(exportedFieldsByTable).reduce(
      (acc, curr) => acc + curr.triggerObjectFields.length + curr.ingestedDataFields.length,
      0,
    );
  }, [exportedFieldsByTable]);

  const [byTable, setByTable] = useState<Record<string, ExportedFields>>(exportedFieldsByTable);
  const deleteFilter = useDeleteFilterMutation();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<null | {
    id: string;
    tableId: string;
    kind: 'trigger' | 'ingested';
    field?: string;
    path?: string[];
    name?: string;
  }>(null);

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

  const rows: FilterRow[] = useMemo(() => {
    const tableIdToName = new Map<string, string>(dataModel.map((t) => [t.id, t.name] as const));

    const result: FilterRow[] = [];
    for (const [tableId, exported] of Object.entries(byTable)) {
      const tableName = tableIdToName.get(tableId) ?? '';
      // trigger object fields
      for (const field of exported.triggerObjectFields ?? []) {
        result.push({
          id: `${tableId}::trigger::${field}`,
          tableId,
          associatedObject: tableName,
          definition: tableName ? `${tableName}.${field}` : field,
          kind: 'trigger',
          field,
        });
      }
      // ingested data fields (objects)
      for (const field of exported.ingestedDataFields ?? []) {
        if (!field || !field.name) continue;
        const pathArr = Array.isArray(field.path) ? field.path : [];
        const pathStr = pathArr.join('->');
        result.push({
          id: `${tableId}::ingested::${pathStr}.${field.name}`,
          tableId,
          associatedObject: tableName,
          definition: `->${pathStr}.${field.name}`,
          kind: 'ingested',
          field: field.name,
          name: field.name,
          path: pathArr,
        });
      }
    }
    return result;
  }, [byTable, dataModel]);
  const columnHelper = createColumnHelper<FilterRow>();
  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.associatedObject, {
        id: 'associatedObject',
        header: 'Associated object',
        size: 240,
      }),
      columnHelper.accessor((row) => row.definition, {
        id: 'definition',
        header: 'Filter definition',
      }),
      columnHelper.display({
        id: 'actions',
        size: 80,
        cell: ({ row }) => {
          return (
            <div className="flex justify-end">
              <ButtonV2
                variant="secondary"
                mode="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={async (e) => {
                  e.stopPropagation();
                  const item = row.original;
                  setItemToDelete({
                    id: item.id,
                    tableId: item.tableId,
                    kind: item.kind,
                    field: item.field,
                    path: item.path,
                    name: item.name,
                  });
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
  }, [byTable, columnHelper, deleteFilter]);

  const {
    table,
    getBodyProps,
    rows: tableRows,
    getContainerProps,
  } = useTable({
    data: rows,
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
            <span className="flex-1">{t('settings:filters')}</span>
            <CreateFilter dataModel={dataModel} pivots={pivots} disabled={totalFiltersCount >= 5} />
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <div className="flex flex-col gap-4">
              <Table.Container {...getContainerProps()} className="max-h-96">
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
            <Modal.Title>
              {t('settings:filters.delete_filter.title', 'Suppression de filtre')}
            </Modal.Title>
            <Modal.Description>
              <div className="p-6 text-left">
                {t(
                  'settings:filters.delete_filter.content',
                  'Êtes-vous sûr de vouloir supprimer ce filtre ? Vous pourrez le créer à nouveau plus tard, mais il n’y aura plus de de stockage de la valeur sur la décision associée à ce filtre.',
                )}
              </div>
            </Modal.Description>
            <Modal.Footer>
              <div className="bg-grey-98 flex justify-end gap-3 border-t p-4">
                <ButtonV2 variant="secondary" onClick={() => setIsConfirmOpen(false)}>
                  {t('common:cancel')}
                </ButtonV2>
                <ButtonV2
                  variant="destructive"
                  onClick={async () => {
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
                    const res = await deleteFilter.mutateAsync({
                      tableId: itemToDelete.tableId,
                      payload,
                    });
                    if (res?.success && res.exportedFields) {
                      setByTable((prev) => ({
                        ...prev,
                        [itemToDelete.tableId]: res.exportedFields as ExportedFields,
                      }));
                    }
                    setIsConfirmOpen(false);
                    setItemToDelete(null);
                  }}
                >
                  {t('settings:filters.delete_filter', 'Supprimer le filtre')}
                </ButtonV2>
              </div>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Root>
      </Page.Content>
    </Page.Container>
  );
}
