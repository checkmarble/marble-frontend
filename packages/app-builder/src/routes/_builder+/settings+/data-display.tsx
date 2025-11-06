import { CollapsiblePaper, Page } from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  type DataModel,
  type DataModelWithTableOptions,
  mergeDataModelWithTableOptions,
  type SetDataModelTableOptionsBody,
  type TableModel,
  type TableModelWithOptions,
} from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { handleSubmit } from '@app-builder/utils/form';
import { reorder } from '@app-builder/utils/list';
import { getRoute } from '@app-builder/utils/routes';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useCallbackRef } from '@marble/shared';
import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { Dict } from '@swan-io/boxed';
import { useForm } from '@tanstack/react-form';
import { cva } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

function createTableOptionSchema(dataModel: DataModel) {
  return z.object(
    R.pipe(
      dataModel,
      R.map(
        (table) =>
          [
            table.id,
            z.object({
              displayedFields: z.array(z.string()).default([]),
              fieldOrder: z.array(z.string()),
            }),
          ] as const,
      ),
      R.fromEntries(),
    ),
  );
}

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

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const dataModel = await dataModelRepository.getDataModel();

  const schema = createTableOptionSchema(dataModel);
  const data = await request.json();
  const submission = schema.safeParse(data);

  const session = await getSession(request);

  if (!submission.success) {
    return { success: false, errors: z.treeifyError(submission.error) };
  }

  try {
    const payloadEntries = Dict.entries(submission.data);

    await Promise.all(
      payloadEntries.map(([tableId, body]) =>
        dataModelRepository.setDataModelTableOptions(tableId, {
          ...body,
          displayedFields: body.displayedFields ?? [],
        }),
      ),
    );

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return Response.json({ success: true }, { headers: { 'Set-Cookie': await commitSession(session) } });
  } catch (_err) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return Response.json({ status: 'error', errors: [] }, { headers: { 'Set-Cookie': await commitSession(session) } });
  }
}

export default function DataDisplaySettings() {
  const { t } = useTranslation(['common', 'settings']);
  const { dataModelWithTableOptions } = useLoaderData<typeof loader>();
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
    <Page.Container>
      <Page.Content className="max-w-(--breakpoint-xl)">
        <form onSubmit={handleSubmit(form)} className="contents">
          <div className="flex items-center justify-between p-2">
            <div>{t('settings:data_display.global_explanation')}</div>
            <Button type="submit">{t('common:save')}</Button>
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
