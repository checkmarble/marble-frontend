import { DataTypeKey } from '@app-builder/models';
import { useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useCallbackRef } from '@marble/shared';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { FieldsEditorContext } from '../../shared/FieldsEditorContext';
import { DatatypeIcon } from './DatatypeOption';
import { getSemanticSubOptions, type TableField } from './semanticData-types';

export function FieldsForm({
  onFieldSelect,
  selectedFieldId,
  title,
  description,
  droppableId = 'fields-list',
  errorFieldIds,
  hasError,
}: {
  onFieldSelect: (fieldId: string) => void;
  selectedFieldId: string | null;
  title?: string;
  description?: string;
  droppableId?: string;
  errorFieldIds?: ReadonlySet<string>;
  hasError?: boolean;
}) {
  const { isCreateDataModelFieldAvailable } = useDataModelFeatureAccess();
  const { fields, reorderFields, addField } = FieldsEditorContext.useValue();
  const { t } = useTranslation(['data']);

  const handleDragEnd = useCallbackRef((result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    reorderFields(result.source.index, result.destination.index);
  });

  function handleAddField() {
    const fieldId = addField('');
    onFieldSelect(fieldId);
  }

  return (
    <section className={cn('flex flex-col gap-v2-md rounded-lg', hasError && 'border border-red-primary p-v2-md')}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-v2-xs">
          <h4 className="text-m font-semibold">{title ?? t('data:upload_data.fields_title')}</h4>
          <p className="text-s text-grey-secondary">{description ?? t('data:upload_data.fields_description')}</p>
        </div>
        {isCreateDataModelFieldAvailable && (
          <Button variant="primary" appearance="stroked" onClick={handleAddField}>
            <Icon icon="plus" className="size-4" />
            {t('data:upload_data.field_add')}
          </Button>
        )}
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={droppableId}>
          {(dropProvided) => (
            <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className="flex flex-col gap-v2-sm">
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={cn(snapshot.isDragging && 'opacity-80')}
                    >
                      <FieldRow
                        field={field}
                        isSelected={field.id === selectedFieldId}
                        onSelect={() => onFieldSelect(field.id)}
                        dragHandleProps={dragProvided.dragHandleProps}
                        hasError={errorFieldIds?.has(field.id) ?? false}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {dropProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </section>
  );
}

function FieldRow({
  field,
  isSelected,
  onSelect,
  dragHandleProps,
  hasError,
}: {
  field: TableField;
  isSelected: boolean;
  onSelect: () => void;
  dragHandleProps: React.HTMLAttributes<HTMLElement> | null | undefined;
  hasError?: boolean;
}) {
  const { t } = useTranslation(['data']);
  const { mainTimestampFieldName: orderingFieldName } = FieldsEditorContext.useValue();
  const isOrderingField = orderingFieldName !== '' && field.name === orderingFieldName;
  const semanticLabel = getSemanticLabel(field, t);

  return (
    <div className="flex items-center gap-v2-md">
      <div {...dragHandleProps} className="flex shrink-0 items-center">
        <Icon icon="drag" className="size-4 text-grey-secondary cursor-grab" />
      </div>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'flex flex-1 items-center gap-v2-md rounded-lg border p-v2-md transition-colors',
          hasError
            ? 'border-red-primary'
            : isSelected
              ? 'border-purple-primary'
              : 'border-grey-border hover:bg-grey-98',
          isSelected ? 'bg-purple-96' : '',
          field.hidden && 'opacity-50',
        )}
      >
        <DatatypeIcon dataType={field.dataType} />
        <span className="text-s font-medium">{field.alias || field.name}</span>
        <div className="ml-auto flex items-center gap-v2-sm">
          {semanticLabel ? (
            <span className="rounded-sm border border-grey-border bg-grey-98 px-v2-sm py-0.5 text-xs text-grey-secondary">
              {semanticLabel}
            </span>
          ) : null}
          {isOrderingField ? (
            <span title={t('data:upload_data.field_main_ordering_timestamp')}>
              <Icon icon="filters" className="size-4 text-grey-secondary" />
            </span>
          ) : null}
          {field.locked ? <Icon icon="lock" className="size-4 text-grey-secondary" /> : null}
          {!field.nullable ? <span className="size-2 rounded-full bg-purple-primary" /> : null}
          {field.hidden ? <Icon icon="visibility_off" className="size-4 text-grey-secondary" /> : null}
          <Icon icon="arrow-right" className="size-4 text-grey-secondary" />
        </div>
      </button>
    </div>
  );
}

const getSemanticLabel = (field: TableField, t: TFunction) => {
  const subOpts = getSemanticSubOptions(field.dataType as DataTypeKey, field.semanticType);

  if (field.dataType === 'Bool') return t('data:upload_data.field_semantic.boolean');
  if (field.dataType === 'IpAddress') return t('data:upload_data.field_semantic.ip_address');
  if (field.dataType === 'Coords') return t('data:upload_data.field_semantic.coords');
  if (subOpts?.length && subOpts.some((opt) => opt.value === field.semanticSubType))
    return t(`data:upload_data.field_semantic_sub.${field.semanticSubType}`);
  if (field.semanticType) return t(`data:upload_data.field_semantic.${field.semanticType}`);
  return null;
};
