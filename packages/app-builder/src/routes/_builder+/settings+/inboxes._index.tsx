import { CollapsiblePaper, Page } from '@app-builder/components';
import { CreateInbox } from '@app-builder/components/Settings/Inboxes/CreateInbox';
import { UpdateOrganizationSettings } from '@app-builder/components/Settings/Organization/UpdateOrganization';
import { CreateTag } from '@app-builder/components/Settings/Tags/CreateTag';
import { DeleteTag } from '@app-builder/components/Settings/Tags/DeleteTag';
import { UpdateTag } from '@app-builder/components/Settings/Tags/UpdateTag';
import { ColorPreview } from '@app-builder/components/Tags/ColorPreview';
import {
  type DataModel,
  type DataModelWithTableOptions,
  isAdmin,
  mergeDataModelWithTableOptions,
  type SetDataModelTableOptionsBody,
  type TableModel,
  type TableModelWithOptions,
} from '@app-builder/models';
import { type InboxWithCasesCount, tKeyForInboxUserRole } from '@app-builder/models/inbox';
import { type TagColor } from '@app-builder/models/tags';
import {
  isAutoAssignmentAvailable,
  isCreateInboxAvailable,
  isCreateTagAvailable,
  isDeleteTagAvailable,
  isEditTagAvailable,
  isInboxAdmin,
  isReadTagAvailable,
} from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { handleSubmit } from '@app-builder/utils/form';
import { reorder } from '@app-builder/utils/list';
import { getRoute } from '@app-builder/utils/routes';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useCallbackRef } from '@marble/shared';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { cva } from 'class-variance-authority';
import { type Namespace } from 'i18next';
import { type Tag } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Collapsible, Switch, Table, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { entitlements, inbox, user, organization, dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const [allInboxes, currentOrganization] = await Promise.all([
    inbox.listInboxesWithCaseCount(),
    organization.getCurrentOrganization(),
  ]);

  const inboxes = allInboxes.filter((inbox) => isAdmin(user) || isInboxAdmin(user, inbox));
  if (inboxes.length === 0 && !isAdmin(user)) {
    return redirect(getRoute('/'));
  }

  // Tags data
  const canReadTags = isReadTagAvailable(user);
  let tags: (Tag & { target: 'case' | 'object' })[] = [];
  if (canReadTags) {
    const [caseTags, objectTags] = await Promise.all([
      organization
        .listTags({ withCaseCount: true })
        .then((tags) => tags.map((t) => ({ ...t, target: 'case' as const }))),
      organization
        .listTags({ target: 'object' })
        .then((tags) => tags.map((t) => ({ ...t, target: 'object' as const }))),
    ]);
    tags = [...caseTags, ...objectTags];
  }

  // Data display data
  const canReadDataDisplay = isAdmin(user);
  let dataModelWithTableOptions: DataModelWithTableOptions = [];
  if (canReadDataDisplay) {
    const dataModel = await dataModelRepository.getDataModel();
    dataModelWithTableOptions = await Promise.all(
      dataModel.map<Promise<TableModelWithOptions>>((table) =>
        dataModelRepository.getDataModelTableOptions(table.id).then((options) => {
          return mergeDataModelWithTableOptions(table, options);
        }),
      ),
    );
  }

  return Response.json({
    isAutoAssignmentAvailable: isAutoAssignmentAvailable(entitlements),
    inboxes,
    organizationId: currentOrganization.id,
    isCreateInboxAvailable: isCreateInboxAvailable(user),
    autoAssignQueueLimit: currentOrganization.autoAssignQueueLimit ?? 0,
    // Tags
    canReadTags,
    tags,
    isCreateTagAvailable: canReadTags && isCreateTagAvailable(user),
    isEditTagAvailable: canReadTags && isEditTagAvailable(user),
    isDeleteTagAvailable: canReadTags && isDeleteTagAvailable(user),
    // Data display
    canReadDataDisplay,
    dataModelWithTableOptions,
  });
}

const inboxColumnHelper = createColumnHelper<InboxWithCasesCount>();
const tagColumnHelper = createColumnHelper<(Tag & { target: 'case' }) | (Tag & { target: 'object' })>();

export default function CaseManagerSettings() {
  const { t } = useTranslation(['common', 'settings']);
  const {
    isAutoAssignmentAvailable,
    inboxes,
    isCreateInboxAvailable,
    autoAssignQueueLimit,
    organizationId,
    canReadTags,
    tags,
    isCreateTagAvailable,
    isEditTagAvailable,
    isDeleteTagAvailable,
    canReadDataDisplay,
    dataModelWithTableOptions,
  } = useLoaderData<typeof loader>();

  const inboxColumns = useMemo(() => {
    return [
      inboxColumnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('settings:inboxes.name'),
        size: 100,
      }),
      inboxColumnHelper.accessor((row) => row.users, {
        id: 'users',
        header: t('settings:inboxes.users'),
        size: 200,
        cell: ({ getValue }) => {
          const users = getValue();
          if (!users) return null;

          return R.pipe(
            users,
            R.groupBy((u) => u.role),
            R.entries(),
            R.map(([role, users]) => {
              return t(tKeyForInboxUserRole(role), { count: users.length });
            }),
            R.join(', '),
          );
        },
      }),
      inboxColumnHelper.accessor((row) => row.casesCount, {
        id: 'cases',
        header: t('settings:inboxes.cases'),
        size: 100,
      }),
    ];
  }, [t]);

  const inboxTable = useTable({
    data: inboxes,
    columns: inboxColumns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
    rowLink: ({ id }) => (
      <Link
        to={getRoute('/settings/inboxes/:inboxId', {
          inboxId: fromUUIDtoSUUID(id),
        })}
      />
    ),
  });

  return (
    <Page.Container>
      <Page.Content className="max-w-(--breakpoint-xl)">
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:inboxes')}</span>
            <UpdateOrganizationSettings
              isAutoAssignmentAvailable={isAutoAssignmentAvailable}
              organizationId={organizationId}
              autoAssignQueueLimit={autoAssignQueueLimit}
            />
            {isCreateInboxAvailable ? <CreateInbox redirectRoutePath="/settings/inboxes/:inboxId" /> : null}
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <Table.Container {...inboxTable.getContainerProps()} className="max-h-96">
              <Table.Header headerGroups={inboxTable.table.getHeaderGroups()} />
              <Table.Body {...inboxTable.getBodyProps()}>
                {inboxTable.rows.map((row) => {
                  return <Table.Row key={row.id} row={row} />;
                })}
              </Table.Body>
            </Table.Container>
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
        {canReadTags ? (
          <TagsSection
            tags={tags}
            isCreateTagAvailable={isCreateTagAvailable}
            isEditTagAvailable={isEditTagAvailable}
            isDeleteTagAvailable={isDeleteTagAvailable}
          />
        ) : null}
        {canReadDataDisplay ? <DataDisplaySection dataModelWithTableOptions={dataModelWithTableOptions} /> : null}
      </Page.Content>
    </Page.Container>
  );
}

// Tags Section

function TagsSection({
  tags,
  isCreateTagAvailable,
  isEditTagAvailable,
  isDeleteTagAvailable,
}: {
  tags: (Tag & { target: 'case' | 'object' })[];
  isCreateTagAvailable: boolean;
  isEditTagAvailable: boolean;
  isDeleteTagAvailable: boolean;
}) {
  const { t } = useTranslation(['settings']);

  const columns = useMemo(() => {
    return [
      tagColumnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('settings:tags.name'),
        size: 200,
      }),
      tagColumnHelper.accessor((row) => row.color, {
        id: 'color',
        header: t('settings:tags.color'),
        size: 100,
        cell: ({ getValue }) => <ColorPreview color={getValue() as TagColor} />,
      }),
      tagColumnHelper.accessor((row) => row.cases_count, {
        id: 'cases',
        header: t('settings:tags.cases'),
        size: 200,
      }),
      tagColumnHelper.accessor((row) => row.target, {
        id: 'target',
        header: t('settings:tags.target'),
        cell: ({ cell }) => {
          return t(`settings:tags.target.${cell.getValue()}`);
        },
        size: 100,
      }),
      ...(isEditTagAvailable || isDeleteTagAvailable
        ? [
            tagColumnHelper.display({
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
  );
}

// Data Display Section

function createTableOptionSchema(dataModel: DataModel) {
  return z.object(
    R.pipe(
      dataModel,
      R.map(
        (table) =>
          [
            table.id,
            z.object({
              displayedFields: protectArray(z.array(z.string())).default([]),
              fieldOrder: protectArray(z.array(z.string())),
            }),
          ] as const,
      ),
      R.fromEntries(),
    ),
  );
}

function DataDisplaySection({ dataModelWithTableOptions }: { dataModelWithTableOptions: DataModelWithTableOptions }) {
  const { t } = useTranslation(['common', 'settings']);
  const fetcher = useFetcher();
  const form = useForm({
    defaultValues: R.pipe(
      dataModelWithTableOptions,
      R.map(
        (table) =>
          [
            table.id,
            {
              ...table.options,
              displayedFields: R.pipe(
                table.fields,
                R.filter((f) => f.displayed && f.name !== 'object_id'),
                R.map((f) => f.id),
              ),
            },
          ] as const,
      ),
      R.fromEntries(),
    ),
    validators: {
      onChange: createTableOptionSchema(dataModelWithTableOptions) as unknown as any,
    },
    onSubmit: async ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          action: getRoute('/settings/data-display'),
          method: 'POST',
          encType: 'application/json',
        });
      }
    },
  });

  return (
    <form onSubmit={handleSubmit(form)} className="contents">
      <CollapsiblePaper.Container>
        <CollapsiblePaper.Title>
          <span className="flex-1">{t('settings:data_display')}</span>
          <Button type="submit" variant="primary" onClick={(e) => e.stopPropagation()}>
            {t('common:save')}
          </Button>
        </CollapsiblePaper.Title>
        <CollapsiblePaper.Content>
          <div className="flex flex-col gap-2">
            {dataModelWithTableOptions.map((tableModelWithOptions) => (
              <form.Field
                key={tableModelWithOptions.id}
                name={tableModelWithOptions.id}
                validators={{
                  onChange: createTableOptionSchema(dataModelWithTableOptions).shape[
                    tableModelWithOptions.id
                  ] as unknown as any,
                  onBlur: createTableOptionSchema(dataModelWithTableOptions).shape[
                    tableModelWithOptions.id
                  ] as unknown as any,
                }}
              >
                {(field) => {
                  return (
                    <Collapsible.Container defaultOpen={false}>
                      <Collapsible.Title size="small" className="!px-4 !py-3">
                        <span className="flex-1 truncate font-normal">{tableModelWithOptions.name}</span>
                      </Collapsible.Title>
                      <Collapsible.Content className="[&>div]:!p-2">
                        <TableModelFieldDnD
                          tableModel={tableModelWithOptions}
                          options={field.state.value}
                          onChange={field.handleChange}
                        />
                      </Collapsible.Content>
                    </Collapsible.Container>
                  );
                }}
              </form.Field>
            ))}
          </div>
        </CollapsiblePaper.Content>
      </CollapsiblePaper.Container>
    </form>
  );
}

const droppableVariants = cva('not-last:mb-2', {
  variants: {
    isDraggingOver: {
      false: null,
      true: null,
    },
  },
});

const draggableVariants = cva('p-2 grid grid-cols-[auto_1fr_auto] max-w-[500px] gap-2 items-center', {
  variants: {
    isDragging: {
      true: 'bg-purple-background-light rounded-sm',
      false: null,
    },
  },
  defaultVariants: {
    isDragging: false,
  },
});

type TableModelFieldDnDProps = {
  tableModel: TableModel;
  options: SetDataModelTableOptionsBody;
  onChange: (options: SetDataModelTableOptionsBody) => void;
};

function TableModelFieldDnD({ options, tableModel, onChange }: TableModelFieldDnDProps) {
  const handleOnDragEnd = useCallbackRef((result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) {
      return;
    }

    onChange({
      ...options,
      fieldOrder: reorder(options.fieldOrder, result.source.index, result.destination.index),
    });
  });

  const handleOnCheckChange = useCallbackRef((fieldId: string) => {
    const displayedFields = options.displayedFields?.includes(fieldId)
      ? [
          ...options.displayedFields.slice(0, options.displayedFields.indexOf(fieldId)),
          ...options.displayedFields.slice(options.displayedFields.indexOf(fieldId) + 1),
        ]
      : [...(options.displayedFields ?? []), fieldId];

    onChange({
      ...options,
      displayedFields,
    });
  });

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId={`droppable_${tableModel.name}`} ignoreContainerClipping={false}>
        {(dropProvided, snapshot) => {
          return (
            <div
              {...dropProvided.droppableProps}
              ref={dropProvided.innerRef}
              className={droppableVariants({ isDraggingOver: snapshot.isDraggingOver })}
            >
              {options.fieldOrder.map((fieldId, index) => {
                const field = tableModel.fields.find((f) => f.id === fieldId);
                const displayedField = options.displayedFields?.includes(fieldId) ?? false;
                if (!field) {
                  return null;
                }

                return (
                  <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(dragProvided, snapshot) => {
                      return (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={draggableVariants({ isDragging: snapshot.isDragging })}
                        >
                          <div
                            className="hover:bg-grey-background flex size-6 items-center justify-center rounded-sm"
                            {...dragProvided.dragHandleProps}
                          >
                            <Icon icon="drag" className="text-grey-disabled size-3" />
                          </div>
                          {field.name}{' '}
                          <Switch
                            disabled={field.name === 'object_id'}
                            checked={displayedField || field.name === 'object_id'}
                            onCheckedChange={() => field.name !== 'object_id' && handleOnCheckChange(field.id)}
                          />
                        </div>
                      );
                    }}
                  </Draggable>
                );
              })}
              {dropProvided.placeholder}
            </div>
          );
        }}
      </Droppable>
    </DragDropContext>
  );
}
