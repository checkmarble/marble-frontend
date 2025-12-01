import { CollapsiblePaper, Page } from '@app-builder/components';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  createTableOptionSchema,
  type DataModelWithTableOptions,
  mergeDataModelWithTableOptions,
  type SetDataModelTableOptionsBody,
  type TableModel,
  type TableModelWithOptions,
} from '@app-builder/models';
import { useUpdateDisplayDataMutation } from '@app-builder/queries/data/update-display-data';
import { initServerServices } from '@app-builder/services/init.server';
import { handleSubmit } from '@app-builder/utils/form';
import { reorder } from '@app-builder/utils/list';
import { getRoute } from '@app-builder/utils/routes';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useCallbackRef } from '@marble/shared';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { cva } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const dataModel = await dataModelRepository.getDataModel();
  const dataModelWithTableOptions = (await Promise.all(
    dataModel.map<Promise<TableModelWithOptions>>((table) =>
      dataModelRepository.getDataModelTableOptions(table.id).then((options) => {
        return mergeDataModelWithTableOptions(table, options);
      }),
    ),
  )) satisfies DataModelWithTableOptions;

  return { dataModelWithTableOptions };
}

export default function DataDisplaySettings() {
  const { t } = useTranslation(['common', 'settings']);
  const { dataModelWithTableOptions } = useLoaderData<typeof loader>();
  const revalidate = useLoaderRevalidator();
  const updateDataDisplayMutation = useUpdateDisplayDataMutation();

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
        return updateDataDisplayMutation.mutateAsync(value).then((_) => {
          revalidate();
        });
      }
    },
  });

  return (
    <Page.Container>
      <Page.Content className="max-w-(--breakpoint-xl)">
        <form onSubmit={handleSubmit(form)} className="contents">
          <div className="flex items-center justify-between p-2">
            <div>{t('settings:data_display.global_explanation')}</div>
            <form.Subscribe selector={(state) => [state.isSubmitting]}>
              {([isSubmitting]) => (
                <Button type="submit" disabled={isSubmitting}>
                  {t('common:save')}
                </Button>
              )}
            </form.Subscribe>
          </div>
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
                  <CollapsiblePaper.Container defaultOpen={false}>
                    <CollapsiblePaper.Title>
                      <span className="flex-1">{tableModelWithOptions.name}</span>
                    </CollapsiblePaper.Title>
                    <CollapsiblePaper.Content>
                      <TableModelFieldDnD
                        tableModel={tableModelWithOptions}
                        options={field.state.value}
                        onChange={field.handleChange}
                      />
                    </CollapsiblePaper.Content>
                  </CollapsiblePaper.Container>
                );
              }}
            </form.Field>
          ))}
        </form>
      </Page.Content>
    </Page.Container>
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
      true: 'bg-purple-98 rounded-sm',
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
                            className="hover:bg-grey-95 flex size-6 items-center justify-center rounded-sm"
                            {...dragProvided.dragHandleProps}
                          >
                            <Icon icon="drag" className="text-grey-80 size-3" />
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
