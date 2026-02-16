import { CalloutV2, CollapsiblePaper, Page } from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import {
  type DataModel,
  type DataModelWithTableOptions,
  isAdmin,
  mergeDataModelWithTableOptions,
  type SetDataModelTableOptionsBody,
  type TableModel,
  type TableModelWithOptions,
} from '@app-builder/models';
import { handleSubmit } from '@app-builder/utils/form';
import { reorder } from '@app-builder/utils/list';
import { getRoute } from '@app-builder/utils/routes';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useCallbackRef } from '@marble/shared';
import { redirect } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { Dict } from '@swan-io/boxed';
import { useForm } from '@tanstack/react-form';
import { cva } from 'class-variance-authority';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Collapsible, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

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

export const loader = createServerFn([authMiddleware], async function dataDisplayLoader({ context }) {
  const { user, dataModelRepository } = context.authInfo;

  if (!isAdmin(user)) {
    return redirect(getRoute('/'));
  }

  const dataModel = await dataModelRepository.getDataModel();
  const dataModelWithTableOptions = await Promise.all(
    dataModel.map<Promise<TableModelWithOptions>>((table) =>
      dataModelRepository.getDataModelTableOptions(table.id).then((options) => {
        return mergeDataModelWithTableOptions(table, options);
      }),
    ),
  );

  return { dataModelWithTableOptions };
});

type DataDisplayActionResult = ServerFnResult<{ success: boolean; errors: any }>;

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function dataDisplayAction({ request, context }): DataDisplayActionResult {
    const { toastSessionService } = context.services;
    const toastSession = await toastSessionService.getSession(request);
    const { dataModelRepository } = context.authInfo;

    const dataModel = await dataModelRepository.getDataModel();
    const schema = createTableOptionSchema(dataModel);
    const rawData = await request.json();
    const submission = schema.safeParse(rawData);

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

      setToastMessage(toastSession, {
        type: 'success',
        messageKey: 'common:success.save',
      });

      return data({ success: true, errors: null }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    } catch (_err) {
      setToastMessage(toastSession, {
        type: 'error',
        messageKey: 'common:errors.unknown',
      });

      return data({ success: false, errors: [] }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    }
  },
);

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
          method: 'POST',
          encType: 'application/json',
        });
      }
    },
  });

  return (
    <Page.Container>
      <Page.Content className="max-w-(--breakpoint-xl)">
        <form onSubmit={handleSubmit(form)} className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-4">
            <CalloutV2>{t('settings:data_display.global_explanation')}</CalloutV2>
            <Button type="submit" variant="primary">
              {t('common:save')}
            </Button>
          </div>
          <CollapsiblePaper.Container>
            <CollapsiblePaper.Title>
              <span className="flex-1">{t('settings:data_display')}</span>
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
