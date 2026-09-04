import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { type DataAccessorAstNode } from '@app-builder/models/astNode/data-accessor';
import {
  createEmptyValueSwitchModel,
  getValueSwitchCellKey,
  getValueSwitchDimensionKey,
  isValueSwitchModelComplete,
  normalizeValueSwitchThresholds,
  parseValueSwitchAstNode,
  type ValueSwitchAstNode,
  type ValueSwitchDimension,
  type ValueSwitchDimensionDefinition,
  type ValueSwitchModel,
  valueSwitchModelToAst,
} from '@app-builder/models/astNode/value-switch';
import {
  isMaxRiskLevelInRange,
  SCORING_LEVELS_COLORS,
  SCORING_LEVELS_LABEL_KEYS,
  scoringLevelEntries,
} from '@app-builder/models/scoring';
import { getAstNodeDataType } from '@app-builder/services/ast-node/getAstNodeDataType';
import { getDataAccessorDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';
import { getDataAccessorAstNodeField } from '@app-builder/services/ast-node/getDataAccessorAstNodeField';
import { DragDropContext, Draggable, type DraggableProvided, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CtaV2ClassName, cn, Input, MenuCommand, NumberInput, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { getEvaluationForNode } from '../../../helpers';
import { useRoot } from '../../../hooks/useRoot';
import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { type OperandEditModalProps } from '../../EditModal';

type DimensionOption = {
  key: string;
  label: string;
  dimension: ValueSwitchDimensionDefinition;
  knownValues: Array<string | number>;
};

type EditValueSwitchProps = Omit<OperandEditModalProps, 'node'> & {
  onDraftChange?: (node: ValueSwitchAstNode) => void;
};

function EditValueSwitch({ onDraftChange, ...props }: EditValueSwitchProps) {
  const { t } = useTranslation(['scenarios', 'common', 'user-scoring']);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((state) => state.node as ValueSwitchAstNode);
  const data = AstBuilderDataSharpFactory.select((state) => state.data);
  const triggerObjectTable = AstBuilderDataSharpFactory.useSharp().computed.triggerObjectTable.value;
  const initialModel = useMemo(
    () => parseValueSwitchAstNode(node) ?? createEmptyValueSwitchModel(node.namedChildren.fallback.constant),
    [node],
  );
  const [model, setModel] = useState(initialModel);

  const dimensionOptions = useMemo<DimensionOption[]>(() => {
    const accessors = [...data.payloadAccessors, ...data.databaseAccessors];
    const fieldOptions = accessors.flatMap((rawField): DimensionOption[] => {
      const field = rawField as DataAccessorAstNode;
      if (getAstNodeDataType(field, { dataModel: data.dataModel, triggerObjectTable }) !== 'String') return [];
      const definition = getDataAccessorAstNodeField(field, { dataModel: data.dataModel, triggerObjectTable });
      return [
        {
          key: getValueSwitchDimensionKey({ type: 'field', field }),
          label: getDataAccessorDisplayName(field),
          dimension: { type: 'field', field },
          knownValues: (definition.values ?? []).filter((value): value is string => typeof value === 'string'),
        },
      ];
    });

    const scoringSettings = data.scoringSettings;
    const options: DimensionOption[] = [...fieldOptions];
    if (data.hasValidLicense && scoringSettings && isMaxRiskLevelInRange(scoringSettings.maxRiskLevel)) {
      options.push({
        key: 'risk-level',
        label: t('scenarios:value_switch.customer_risk_level'),
        dimension: { type: 'risk-level' },
        knownValues: scoringLevelEntries(SCORING_LEVELS_COLORS[scoringSettings.maxRiskLevel]).map(([level]) => level),
      });
    }

    for (const dimension of model.dimensions) {
      if (!dimension) continue;
      const key = getValueSwitchDimensionKey(dimension);
      if (options.some((option) => option.key === key)) continue;
      options.push({
        key,
        label:
          dimension.type === 'field'
            ? getDataAccessorDisplayName(dimension.field)
            : t('scenarios:value_switch.customer_risk_level'),
        dimension: dimension.type === 'field' ? { type: 'field', field: dimension.field } : { type: 'risk-level' },
        knownValues: [...dimension.values],
      });
    }

    return options;
  }, [data, model.dimensions, t, triggerObjectTable]);

  function updateModel(updater: (current: ValueSwitchModel) => ValueSwitchModel) {
    setModel((current) => {
      const next = normalizeValueSwitchThresholds(updater(current));
      const nextAst = valueSwitchModelToAst(next, node.id);
      Object.assign(nodeSharp.value.node, nextAst);
      onDraftChange?.(nodeSharp.value.node as ValueSwitchAstNode);
      return next;
    });
  }

  function setDimensionCount(dimensionCount: 1 | 2) {
    updateModel((current) => ({
      ...current,
      dimensionCount,
      dimensions: dimensionCount === 1 ? [current.dimensions[0] ?? null] : [current.dimensions[0] ?? null, null],
      thresholds: {},
    }));
  }

  function setDimension(index: number, option: DimensionOption) {
    updateModel((current) => {
      const values =
        option.knownValues.length > 0
          ? [option.knownValues[0]!]
          : option.dimension.type === 'field' && current.dimensionCount === 1
            ? ['']
            : [];
      const dimensions = [...current.dimensions];
      dimensions[index] = { ...option.dimension, values } as ValueSwitchDimension;
      return { ...current, dimensions, thresholds: {} };
    });
  }

  function setDimensionValues(index: number, values: Array<string | number>) {
    updateModel((current) => {
      const dimensions = [...current.dimensions];
      const dimension = dimensions[index];
      if (!dimension) return current;
      dimensions[index] = { ...dimension, values } as ValueSwitchDimension;
      return { ...current, dimensions };
    });
  }

  function replaceDimensionValue(index: number, value: string | number) {
    updateModel((current) => {
      const dimension = current.dimensions[0];
      if (!dimension) return current;
      const previousValue = dimension.values[index];
      if (previousValue === undefined) return current;

      const values = dimension.values.map((currentValue, currentIndex) =>
        currentIndex === index ? value : currentValue,
      ) as Array<string | number>;
      const dimensions = [{ ...dimension, values } as ValueSwitchDimension];
      const previousThreshold = current.thresholds[getValueSwitchCellKey([previousValue])] ?? current.fallback;

      return {
        ...current,
        dimensions,
        thresholds: {
          ...current.thresholds,
          [getValueSwitchCellKey([value])]: previousThreshold,
        },
      };
    });
  }

  function setThreshold(values: Array<string | number>, threshold: number) {
    updateModel((current) => ({
      ...current,
      thresholds: { ...current.thresholds, [getValueSwitchCellKey(values)]: threshold },
    }));
  }

  const selectedKeys = model.dimensions.map((dimension) => (dimension ? getValueSwitchDimensionKey(dimension) : null));

  const content = (
    <>
      <div className="flex gap-sm" role="group" aria-label={t('scenarios:value_switch.dimension_count')}>
        {([1, 2] as const).map((count) => (
          <Button
            key={count}
            appearance="stroked"
            variant={model.dimensionCount === count ? 'primary' : 'secondary'}
            aria-pressed={model.dimensionCount === count}
            onClick={() => setDimensionCount(count)}
          >
            {t(`scenarios:value_switch.${count === 1 ? 'one_variable' : 'two_variables'}`)}
          </Button>
        ))}
      </div>

      {model.dimensionCount === 1 ? (
        <OneDimensionEditor
          key={selectedKeys[0] ?? 'empty'}
          model={model}
          options={dimensionOptions}
          selectedKeys={selectedKeys}
          onDimensionChange={(option) => setDimension(0, option)}
          onValuesChange={(values) => setDimensionValues(0, values)}
          onValueChange={replaceDimensionValue}
          onThresholdChange={setThreshold}
        />
      ) : (
        <TwoDimensionEditor
          model={model}
          options={dimensionOptions}
          selectedKeys={selectedKeys}
          onDimensionChange={setDimension}
          onValuesChange={setDimensionValues}
          onThresholdChange={setThreshold}
        />
      )}

      <div className="flex items-center gap-md">
        <span className="text-default text-grey-secondary font-medium">{t('scenarios:value_switch.else')}</span>
        <NumberInput
          size="medium"
          className="w-40"
          aria-label={t('scenarios:value_switch.fallback')}
          value={model.fallback}
          onChange={(fallback) => updateModel((current) => ({ ...current, fallback }))}
        />
      </div>
    </>
  );

  return (
    <Card className="flex w-full flex-col gap-lg shadow-sm">
      {content}
      <div className="flex justify-end gap-sm">
        <Button appearance="stroked" variant="secondary" onClick={props.onCancel}>
          {t('common:cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={() => props.onSave(nodeSharp.value.node as ValueSwitchAstNode)}
          disabled={!isValueSwitchModelComplete(model)}
        >
          {t('common:validate')}
        </Button>
      </div>
    </Card>
  );
}

export function EditValueSwitchCard({
  node,
  onDraftChange,
  ...props
}: OperandEditModalProps & {
  node: ValueSwitchAstNode;
  onDraftChange?: (node: ValueSwitchAstNode) => void;
}) {
  const validation = AstBuilderNodeSharpFactory.useOptionalSharp()?.select((state) => state.validation);
  const nodeSharp = useRoot(
    {
      node,
      validation: {
        errors: [],
        evaluation: getEvaluationForNode(validation?.evaluation ?? [], node.id),
      },
    },
    false,
  );

  return (
    <AstBuilderNodeSharpFactory.Provider value={nodeSharp}>
      <EditValueSwitch {...props} onDraftChange={onDraftChange} />
    </AstBuilderNodeSharpFactory.Provider>
  );
}

type OneDimensionEditorProps = {
  model: ValueSwitchModel;
  options: DimensionOption[];
  selectedKeys: Array<string | null>;
  onDimensionChange: (option: DimensionOption) => void;
  onValuesChange: (values: Array<string | number>) => void;
  onValueChange: (index: number, value: string | number) => void;
  onThresholdChange: (values: Array<string | number>, threshold: number) => void;
};

function OneDimensionEditor({
  model,
  options,
  selectedKeys,
  onDimensionChange,
  onValuesChange,
  onValueChange,
  onThresholdChange,
}: OneDimensionEditorProps) {
  const { t } = useTranslation(['scenarios']);
  const dimension = model.dimensions[0];
  const currentOption = dimension
    ? options.find((option) => option.key === getValueSwitchDimensionKey(dimension))
    : null;
  const rowIdPrefix = useId();
  const rowIds = useRef(dimension?.values.map((_, index) => `${rowIdPrefix}-${index}`) ?? []);
  const nextRowId = useRef(rowIds.current.length);
  const availableValues = currentOption?.knownValues ?? [];
  const canAddValue =
    !!dimension &&
    (availableValues.some((value) => !dimension.values.includes(value as never)) ||
      (dimension.type === 'field' && availableValues.length === 0 && !dimension.values.includes('')));

  function addValue() {
    if (!dimension) return;
    const unusedValue = availableValues.find((value) => !dimension.values.includes(value as never));
    const nextValue =
      unusedValue ??
      (dimension.type === 'field' && availableValues.length === 0 && !dimension.values.includes('') ? '' : undefined);
    if (nextValue === undefined) return;
    rowIds.current.push(`${rowIdPrefix}-${nextRowId.current++}`);
    onValuesChange([...dimension.values, nextValue] as Array<string | number>);
  }

  function replaceValue(index: number, value: string | number) {
    if (!dimension) return;
    onValueChange(index, value);
  }

  function moveValue(from: number, to: number) {
    if (!dimension || from === to || to < 0 || to >= dimension.values.length) return;
    const values = [...dimension.values];
    const [value] = values.splice(from, 1);
    values.splice(to, 0, value!);
    const [rowId] = rowIds.current.splice(from, 1);
    rowIds.current.splice(to, 0, rowId!);
    onValuesChange(values);
  }

  function removeValue(index: number) {
    if (!dimension) return;
    rowIds.current.splice(index, 1);
    onValuesChange(dimension.values.filter((_, currentIndex) => currentIndex !== index));
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    moveValue(result.source.index, result.destination.index);
  }

  function renderValueRow(value: string | number, index: number, dragProvided: DraggableProvided, isDragging: boolean) {
    if (!dimension) return null;

    return (
      <div
        ref={dragProvided.innerRef}
        {...dragProvided.draggableProps}
        className={cn(
          'grid grid-cols-[auto_auto_10rem_auto_7rem_auto] items-center justify-start gap-md',
          isDragging && 'opacity-80',
        )}
      >
        <div
          {...dragProvided.dragHandleProps}
          className={cn('flex shrink-0 items-center', CtaV2ClassName({ variant: 'secondary', mode: 'icon' }))}
        >
          <Icon icon="unfold_more" className="text-grey-secondary size-4 cursor-grab active:cursor-grabbing" />
        </div>
        <span className="text-default text-grey-secondary font-medium">
          {t('scenarios:value_switch.if_value_is', { variable: currentOption?.label ?? '' })}
        </span>
        <DimensionValueInput
          dimension={dimension}
          value={value}
          knownValues={availableValues}
          unavailableValues={dimension.values.filter((_, currentIndex) => currentIndex !== index)}
          onChange={(next) => replaceValue(index, next)}
        />
        <span className="text-default text-grey-placeholder font-medium">{t('scenarios:value_switch.then_score')}</span>
        <NumberInput
          className="w-28"
          value={model.thresholds[getValueSwitchCellKey([value])] ?? model.fallback}
          onChange={(threshold) => onThresholdChange([value], threshold)}
          forceSign
          colorByValue={{
            thresholds: [
              { threshold: 0, comparison: '>', color: 'green' },
              { threshold: 0, comparison: '<', color: 'red' },
            ],
            defaultColor: 'primary',
          }}
        />
        <Button
          mode="icon"
          variant="secondary"
          appearance="stroked"
          className="shrink-0"
          aria-label={t('scenarios:value_switch.remove_value')}
          onClick={() => removeValue(index)}
        >
          <Icon icon="delete" className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="flex max-w-xl items-center gap-md">
        <span className="text-default text-grey-secondary shrink-0 font-medium">
          {t('scenarios:value_switch.variable_is')}
        </span>
        <DimensionSelect
          options={options}
          selectedKey={selectedKeys[0] ?? null}
          excludedKey={selectedKeys[1] ?? null}
          onChange={onDimensionChange}
        />
      </div>

      {dimension ? (
        <div className="border-grey-border bg-grey-background-light flex flex-col gap-md rounded-md border p-md">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable
              droppableId={`${rowIdPrefix}-values`}
              renderClone={(dragProvided, snapshot, rubric) => {
                const index = rubric.source.index;
                const value = dimension.values[index];
                return value === undefined ? null : renderValueRow(value, index, dragProvided, snapshot.isDragging);
              }}
            >
              {(dropProvided) => (
                <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className="flex flex-col gap-sm">
                  {dimension.values.map((value, index) => (
                    <Draggable key={rowIds.current[index]} draggableId={rowIds.current[index]!} index={index}>
                      {(dragProvided, snapshot) => renderValueRow(value, index, dragProvided, snapshot.isDragging)}
                    </Draggable>
                  ))}
                  {dropProvided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Button
            appearance="stroked"
            variant="secondary"
            className="self-start"
            onClick={addValue}
            disabled={!canAddValue}
          >
            <Icon icon="plus" className="size-4" />
            {t('scenarios:value_switch.add_value')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

type TwoDimensionEditorProps = {
  model: ValueSwitchModel;
  options: DimensionOption[];
  selectedKeys: Array<string | null>;
  onDimensionChange: (index: number, option: DimensionOption) => void;
  onValuesChange: (index: number, values: Array<string | number>) => void;
  onThresholdChange: (values: Array<string | number>, threshold: number) => void;
};

function TwoDimensionEditor({
  model,
  options,
  selectedKeys,
  onDimensionChange,
  onValuesChange,
  onThresholdChange,
}: TwoDimensionEditorProps) {
  const { t } = useTranslation(['scenarios']);
  const [rowDimension, columnDimension] = model.dimensions;

  return (
    <div className="flex flex-col gap-md">
      <div className="grid grid-cols-2 gap-md">
        {[0, 1].map((index) => {
          const dimension = model.dimensions[index];
          const currentOption = dimension
            ? options.find((option) => option.key === getValueSwitchDimensionKey(dimension))
            : null;
          return (
            <div
              key={index}
              className="border-grey-border bg-grey-background-light flex flex-col gap-md rounded-md border p-md"
            >
              <div className="flex items-center gap-md">
                <span className="text-default text-grey-secondary shrink-0 font-medium">
                  {t(index === 0 ? 'scenarios:value_switch.rows_based_on' : 'scenarios:value_switch.columns_based_on')}
                </span>
                <DimensionSelect
                  options={options}
                  selectedKey={selectedKeys[index] ?? null}
                  excludedKey={selectedKeys[index === 0 ? 1 : 0] ?? null}
                  onChange={(option) => onDimensionChange(index, option)}
                />
              </div>
              {dimension ? (
                <DimensionValuesSelect
                  dimension={dimension}
                  knownValues={currentOption?.knownValues ?? []}
                  onChange={(values) => onValuesChange(index, values)}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {rowDimension && columnDimension && rowDimension.values.length > 0 && columnDimension.values.length > 0 ? (
        <div className="border-grey-border overflow-x-auto rounded-md border">
          <table className="w-full min-w-[720px] table-fixed border-collapse">
            <thead>
              <tr>
                <th className="border-grey-border w-48 border-b p-sm" />
                {columnDimension.values.map((value) => (
                  <th key={`${typeof value}:${String(value)}`} className="border-grey-border border-b p-sm text-start">
                    <ValueTag dimension={columnDimension} value={value} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowDimension.values.map((rowValue) => (
                <tr key={`${typeof rowValue}:${String(rowValue)}`}>
                  <th className="border-grey-border border-t p-sm text-start first:border-t-0">
                    <ValueTag dimension={rowDimension} value={rowValue} />
                  </th>
                  {columnDimension.values.map((columnValue) => (
                    <td
                      key={getValueSwitchCellKey([rowValue, columnValue])}
                      className="border-grey-border border-t p-sm first:border-t-0"
                    >
                      <NumberInput
                        size="medium"
                        className="min-w-24"
                        aria-label={t('scenarios:value_switch.cell_value', {
                          row: String(rowValue),
                          column: String(columnValue),
                        })}
                        value={model.thresholds[getValueSwitchCellKey([rowValue, columnValue])] ?? model.fallback}
                        onChange={(threshold) => onThresholdChange([rowValue, columnValue], threshold)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function DimensionSelect({
  options,
  selectedKey,
  excludedKey,
  onChange,
}: {
  options: DimensionOption[];
  selectedKey: string | null;
  excludedKey: string | null;
  onChange: (option: DimensionOption) => void;
}) {
  const { t } = useTranslation(['scenarios']);
  const selected = options.find((option) => option.key === selectedKey);
  return (
    <MenuCommand.Menu>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton className="w-full min-w-56">
          {selected?.label ?? t('scenarios:value_switch.select_variable')}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="start" sideOffset={4} sameWidth>
        <MenuCommand.Combobox placeholder={t('scenarios:value_switch.search_variables')} />
        <MenuCommand.List>
          {options.map((option) => (
            <MenuCommand.Item
              key={option.key}
              value={`${option.label} ${option.key}`}
              disabled={option.key === excludedKey}
              onSelect={() => onChange(option)}
            >
              {option.label}
              {option.key === selectedKey ? <Icon icon="tick" className="size-4" /> : null}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

function DimensionValueInput({
  dimension,
  value,
  knownValues,
  unavailableValues,
  onChange,
}: {
  dimension: ValueSwitchDimension;
  value: string | number;
  knownValues: Array<string | number>;
  unavailableValues: Array<string | number>;
  onChange: (value: string | number) => void;
}) {
  if (dimension.type === 'field' && knownValues.length === 0) {
    return <Input className="w-40" value={String(value)} onChange={(event) => onChange(event.target.value)} />;
  }
  const availableValues = [...new Set([...knownValues, value])];
  return (
    <MenuCommand.Menu>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton className="w-40">
          <ValueTag dimension={dimension} value={value} />
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="start" sideOffset={4} sameWidth>
        <MenuCommand.List>
          {availableValues.map((option) => (
            <MenuCommand.Item
              key={`${typeof option}:${String(option)}`}
              disabled={unavailableValues.includes(option)}
              onSelect={() => onChange(option)}
            >
              <ValueTag dimension={dimension} value={option} />
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

function DimensionValuesSelect({
  dimension,
  knownValues,
  onChange,
}: {
  dimension: ValueSwitchDimension;
  knownValues: Array<string | number>;
  onChange: (values: Array<string | number>) => void;
}) {
  const { t } = useTranslation(['scenarios']);
  const [manualValue, setManualValue] = useState('');
  const availableValues = [...new Set([...knownValues, ...dimension.values])];

  function toggle(value: string | number) {
    onChange(
      dimension.values.includes(value as never)
        ? dimension.values.filter((current) => current !== value)
        : ([...dimension.values, value] as Array<string | number>),
    );
  }

  function addManualValue() {
    const value = manualValue.trim();
    if (dimension.type !== 'field' || !value || dimension.values.includes(value)) return;
    onChange([...dimension.values, value]);
    setManualValue('');
  }

  return (
    <div className="flex flex-col gap-sm">
      <MenuCommand.Menu persistOnSelect>
        <MenuCommand.Trigger>
          <MenuCommand.SelectButton className="h-auto min-h-10 w-full py-sm">
            <span className="flex flex-wrap gap-xs pe-lg">
              {dimension.values.length > 0
                ? dimension.values.map((value) => (
                    <ValueTag key={`${typeof value}:${String(value)}`} dimension={dimension} value={value} />
                  ))
                : t('scenarios:value_switch.select_values')}
            </span>
          </MenuCommand.SelectButton>
        </MenuCommand.Trigger>
        <MenuCommand.Content align="start" sideOffset={4} sameWidth>
          <MenuCommand.List>
            {availableValues.map((value) => (
              <MenuCommand.Item key={`${typeof value}:${String(value)}`} onSelect={() => toggle(value)}>
                <ValueTag dimension={dimension} value={value} />
                {dimension.values.includes(value as never) ? <Icon icon="tick" className="size-4" /> : null}
              </MenuCommand.Item>
            ))}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
      {dimension.type === 'field' ? (
        <div className="flex gap-sm">
          <Input
            size="medium"
            className="flex-1"
            value={manualValue}
            placeholder={t('scenarios:value_switch.manual_value')}
            onChange={(event) => setManualValue(event.target.value)}
            onEnterKeyDown={addManualValue}
          />
          <Button variant="secondary" appearance="stroked" onClick={addManualValue} disabled={!manualValue.trim()}>
            {t('scenarios:value_switch.add')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ValueTag({ dimension, value }: { dimension: ValueSwitchDimension; value: string | number }) {
  const { t } = useTranslation(['user-scoring']);
  const data = AstBuilderDataSharpFactory.select((state) => state.data);
  const scoringSettings = data.scoringSettings;

  if (
    dimension.type === 'risk-level' &&
    typeof value === 'number' &&
    scoringSettings &&
    isMaxRiskLevelInRange(scoringSettings.maxRiskLevel)
  ) {
    const color = SCORING_LEVELS_COLORS[scoringSettings.maxRiskLevel][value];
    const labelKey = SCORING_LEVELS_LABEL_KEYS[scoringSettings.maxRiskLevel][value];
    return <Tag style={{ borderColor: color, color }}>{labelKey ? t(labelKey) : value}</Tag>;
  }

  return <Tag>{String(value) || '—'}</Tag>;
}
