import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { useCallbackRef } from '@marble/shared';
import { useForm, useStore } from '@tanstack/react-form';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Input, SelectV2, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { UploadDataDrawerContext } from './Drawer';
import { LinkForm } from './LinkForm';
import { FtmEntityV2, ftmEntities, ftmEntityPersonOptions, ftmEntityVehicleOptions } from './uploadData-types';

export function FormTable({ tableId }: { tableId: string }) {
  const { tablesState, updateTableState } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);
  const tableState = tablesState[tableId]!;

  const form = useForm({
    defaultValues: tableState,
    onSubmit: ({ value }) => {
      // TODO: implement save logic
      console.log(value);
    },
  });

  // Persist form values to context on unmount (table switch)
  useEffect(() => {
    return () => {
      updateTableState(tableId, form.state.values);
    };
  }, [tableId, updateTableState, form]);

  const ftmEntityOptions = useMemo(
    () =>
      ftmEntities.map((entity) => ({
        label: t(`data:upload_data.ftm_entity.${entity}`),
        value: entity,
      })),
    [t],
  );

  const selectedFtmEntity = useStore(form.store, (state) => state.values.ftmEntity);

  const subEntityOptions = useMemo(() => {
    if (selectedFtmEntity === 'person') {
      return ftmEntityPersonOptions.map((sub) => ({
        label: t(`data:upload_data.ftm_entity_person.${sub}`),
        value: sub,
      }));
    }
    if (selectedFtmEntity === 'vehicle') {
      return ftmEntityVehicleOptions.map((sub) => ({
        label: t(`data:upload_data.ftm_entity_vehicle.${sub}`),
        value: sub,
      }));
    }
    return [];
  }, [selectedFtmEntity, t]);

  const hasSubEntity = selectedFtmEntity === 'person' || selectedFtmEntity === 'vehicle';

  return (
    <div className="flex flex-col gap-v2-lg">
      <section className="flex flex-col gap-v2-md">
        <h4 className="text-m font-semibold">{t('data:upload_data.general_settings')}</h4>
        <div className="flex items-center gap-v2-md">
          <form.Field name="alias">
            {(field) => (
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                placeholder={t('data:upload_data.name_placeholder')}
                className="flex-1"
              />
            )}
          </form.Field>
          <form.Field name="ftmEntity">
            {(field) => (
              <SelectV2
                value={field.state.value}
                placeholder={t('data:upload_data.object_placeholder')}
                onChange={(value) => {
                  field.handleChange(value as FtmEntityV2);
                  form.setFieldValue('ftmSubEntity', '');
                }}
                options={ftmEntityOptions}
                className="flex-1"
              />
            )}
          </form.Field>
          {hasSubEntity ? (
            <form.Field name="ftmSubEntity">
              {(field) => (
                <SelectV2
                  value={field.state.value}
                  placeholder={t('data:upload_data.sub_object_placeholder')}
                  onChange={field.handleChange}
                  options={subEntityOptions}
                  className="flex-1"
                />
              )}
            </form.Field>
          ) : null}
          <form.Field name="mainTable">
            {(field) => (
              <label className="flex shrink-0 items-center gap-v2-sm cursor-pointer">
                <Switch checked={field.state.value} onCheckedChange={(checked) => field.handleChange(checked)} />
                <span className="text-s">{t('data:upload_data.main_table')}</span>
              </label>
            )}
          </form.Field>
        </div>
      </section>
      <LinkForm tableId={tableId} />
    </div>
  );
}

export function SummaryView() {
  const { orderedTableIds, reorderTables } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);

  const handleDragEnd = useCallbackRef((result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) {
      return;
    }
    reorderTables(result.source.index, result.destination.index);
  });

  return (
    <div className="flex flex-col gap-v2-md">
      <h4 className="text-m font-semibold">{t('data:upload_data.tables_label')}</h4>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="summary-tables">
          {(dropProvided) => (
            <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className="flex flex-col gap-v2-md">
              {orderedTableIds.map((tableId, index) => (
                <Draggable key={tableId} draggableId={tableId} index={index}>
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={cn(snapshot.isDragging && 'opacity-80')}
                    >
                      <SummaryTableRow tableId={tableId} dragHandleProps={dragProvided.dragHandleProps} />
                    </div>
                  )}
                </Draggable>
              ))}
              {dropProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

function SummaryTableRow({
  tableId,
  dragHandleProps,
}: {
  tableId: string;
  dragHandleProps: React.HTMLAttributes<HTMLElement> | null | undefined;
}) {
  const { tablesState, updateTableState } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);
  const tableState = tablesState[tableId]!;

  const form = useForm({
    defaultValues: tableState,
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  // Sync form -> context on every change
  const formValues = useStore(form.store, (state) => state.values);
  useEffect(() => {
    updateTableState(tableId, formValues);
  }, [tableId, formValues, updateTableState]);

  const ftmEntityOptions = useMemo(
    () =>
      ftmEntities.map((entity) => ({
        label: t(`data:upload_data.ftm_entity.${entity}`),
        value: entity,
      })),
    [t],
  );

  const selectedFtmEntity = useStore(form.store, (state) => state.values.ftmEntity);

  const subEntityOptions = useMemo(() => {
    if (selectedFtmEntity === 'person') {
      return ftmEntityPersonOptions.map((sub) => ({
        label: t(`data:upload_data.ftm_entity_person.${sub}`),
        value: sub,
      }));
    }
    if (selectedFtmEntity === 'vehicle') {
      return ftmEntityVehicleOptions.map((sub) => ({
        label: t(`data:upload_data.ftm_entity_vehicle.${sub}`),
        value: sub,
      }));
    }
    return [];
  }, [selectedFtmEntity, t]);

  const hasSubEntity = selectedFtmEntity === 'person' || selectedFtmEntity === 'vehicle';

  // In summary, show sub-entity select if applicable, otherwise main entity select
  const displayedOptions = hasSubEntity && subEntityOptions.length > 0 ? subEntityOptions : ftmEntityOptions;
  const selectedFtmSubEntity = useStore(form.store, (state) => state.values.ftmSubEntity);
  const displayedValue = hasSubEntity && selectedFtmSubEntity ? selectedFtmSubEntity : selectedFtmEntity;

  return (
    <div className="flex items-center gap-v2-md">
      <div {...dragHandleProps} className="flex shrink-0 items-center">
        <Icon icon="drag" className="size-4 text-grey-secondary cursor-grab" />
      </div>
      <div
        className={cn(
          'flex items-center gap-v2-md rounded-lg border border-grey-border p-v2-md',
          tableState.isCanceled && 'opacity-50',
        )}
      >
        <form.Field name="alias">
          {(field) => (
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              placeholder={t('data:upload_data.name_placeholder')}
              className={cn('flex-1', tableState.isCanceled && 'line-through')}
              disabled={tableState.isCanceled}
            />
          )}
        </form.Field>
        <SelectV2
          value={displayedValue}
          placeholder={t('data:upload_data.object_placeholder')}
          onChange={(value) => {
            const isMainEntity = ftmEntities.includes(value as FtmEntityV2);
            if (isMainEntity) {
              form.setFieldValue('ftmEntity', value as FtmEntityV2);
              form.setFieldValue('ftmSubEntity', '');
            } else {
              form.setFieldValue('ftmSubEntity', value);
            }
          }}
          options={displayedOptions}
          className="w-48"
          disabled={tableState.isCanceled}
        />
        <form.Field name="mainTable">
          {(field) => (
            <label className="flex shrink-0 items-center gap-v2-sm cursor-pointer">
              <Switch
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked)}
                disabled={tableState.isCanceled}
              />
              <span className="text-s">{t('data:upload_data.main_table')}</span>
            </label>
          )}
        </form.Field>
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => updateTableState(tableId, { isCanceled: !tableState.isCanceled })}
      >
        <Icon icon={tableState.isCanceled ? 'restart-alt' : 'delete'} className="size-4" />
      </Button>
    </div>
  );
}
