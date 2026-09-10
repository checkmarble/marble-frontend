import { getEvaluationForNode, getOperandMenuOptions } from '@app-builder/components/AstBuilder/edition/helpers';
import { useRoot } from '@app-builder/components/AstBuilder/edition/hooks/useRoot';
import { AstBuilderNodeSharpFactory } from '@app-builder/components/AstBuilder/edition/node-store';
import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import {
  OperandDisplayName,
  operandDisplayNameClassnames,
} from '@app-builder/components/AstBuilder/styles/OperandDisplayName';
import { ValueSwitchValueTag } from '@app-builder/components/AstBuilder/ValueSwitchValueTag';
import { EnumValueMenu } from '@app-builder/components/Data/EnumValueMenu';
import { type AstNode, type DataModelField, type IdLessAstNode, NewUndefinedAstNode } from '@app-builder/models';
import { type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { type DataAccessorAstNode, isDatabaseAccess, isPayload } from '@app-builder/models/astNode/data-accessor';
import { isRecordRiskLevelCheckAstNode, NewRecordRiskLevelCheckAstNode } from '@app-builder/models/astNode/risk';
import {
  createEmptyValueSwitchModel,
  getValueSwitchCellKey,
  getValueSwitchCombinations,
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
import { isEnumField } from '@app-builder/models/enum-values';
import { isMaxRiskLevelInRange, SCORING_LEVELS_COLORS, scoringLevelEntries } from '@app-builder/models/scoring';
import { getDataAccessorDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';
import { getDataAccessorAstNodeField } from '@app-builder/services/ast-node/getDataAccessorAstNodeField';
import { useFormatLanguage } from '@app-builder/utils/format';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  CtaV2ClassName,
  cn,
  ExpandableGroupTagLine,
  Input,
  MenuCommand,
  NumberInput,
} from 'ui-design-system';
import { Icon } from 'ui-icons';
import { EditionOperandSharpFactory, editionOperandLabelClassnames } from '../EditionOperand';
import { OperandEditModalProps } from '../EditModal/EditModal';
import { AstBuilderOperandMenu } from '../OperandMenu';
import { getValueSwitchFieldOption } from './field-option';
import {
  getTwoDimensionGridNavigationTarget,
  scrollTwoDimensionGridCellIntoView,
  type TwoDimensionGridNavigationKey,
} from './two-dimension-grid-navigation';

type DimensionOption = {
  key: string;
  label: string;
  dimension: ValueSwitchDimensionDefinition;
  knownValues: Array<string | number>;
  field?: DataModelField;
  closed?: boolean;
};

function isNumericDimension(dimension: ValueSwitchDimension | null | undefined, field?: DataModelField) {
  if (dimension?.type !== 'field') return false;
  if (field) return field.dataType === 'Int' || field.dataType === 'Float';
  return dimension.values.length > 0 && dimension.values.every((value) => typeof value === 'number');
}

function getInsertedNumericBound(bounds: number[], index: number) {
  const current = bounds[index];
  if (current === undefined) return null;
  const next = bounds[index + 1];
  return next === undefined ? current + 1 : current + (next - current) / 2;
}

function getNumericValues(values: Array<string | number>) {
  return values.filter((value): value is number => typeof value === 'number');
}

function getStringValues(values: Array<string | number>) {
  return values.filter((value): value is string => typeof value === 'string');
}

type EditValueSwitchProps = Omit<OperandEditModalProps, 'node'> & {
  onDraftChange?: (node: ValueSwitchAstNode) => void;
};

function EditValueSwitch({ onDraftChange, ...props }: EditValueSwitchProps) {
  const { t } = useTranslation(['scenarios', 'common', 'user-scoring']);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((state) => state.node as ValueSwitchAstNode);
  const data = AstBuilderDataSharpFactory.select((state) => state.data);
  const triggerObjectTable = AstBuilderDataSharpFactory.useSharp().computed.triggerObjectTable.value;
  const onCancel = useCallbackRef(props.onCancel);
  const initialModel = useMemo(
    () => parseValueSwitchAstNode(node) ?? createEmptyValueSwitchModel(node.namedChildren.fallback.constant),
    [node],
  );
  const [model, setModel] = useState(initialModel);

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      onCancel();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const dimensionOptions = useMemo<DimensionOption[]>(() => {
    const accessors = [...data.payloadAccessors, ...data.databaseAccessors];
    const fieldOptions = accessors.flatMap((rawField): DimensionOption[] => {
      const field = rawField as DataAccessorAstNode;
      const definition = getDataAccessorAstNodeField(field, { dataModel: data.dataModel, triggerObjectTable });
      const existingValues =
        model.dimensions.find(
          (dimension) =>
            dimension && getValueSwitchDimensionKey(dimension) === getValueSwitchDimensionKey({ type: 'field', field }),
        )?.values ?? [];
      const option = getValueSwitchFieldOption(field, definition, existingValues);
      return option ? [option] : [];
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
      const numeric = option.field && ['Int', 'Float'].includes(option.field.dataType);
      const values = numeric
        ? [0]
        : option.knownValues.length > 0
          ? [option.knownValues[0]!]
          : option.dimension.type === 'field' && !option.closed && current.dimensionCount === 1
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

  function replaceDimensionValue(dimensionIndex: number, valueIndex: number, value: string | number) {
    updateModel((current) => {
      const dimension = current.dimensions[dimensionIndex];
      if (!dimension) return current;
      const previousValue = dimension.values[valueIndex];
      if (previousValue === undefined) return current;

      const values = dimension.values.map((currentValue, currentIndex) =>
        currentIndex === valueIndex ? value : currentValue,
      ) as Array<string | number>;
      const dimensions = [...current.dimensions];
      dimensions[dimensionIndex] = { ...dimension, values } as ValueSwitchDimension;
      const thresholds = { ...current.thresholds };

      for (const combination of getValueSwitchCombinations(current)) {
        if (combination[dimensionIndex] !== previousValue) continue;
        const nextCombination = [...combination];
        nextCombination[dimensionIndex] = value;
        thresholds[getValueSwitchCellKey(nextCombination)] =
          current.thresholds[getValueSwitchCellKey(combination)] ?? current.fallback;
      }

      return {
        ...current,
        dimensions,
        thresholds,
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
          onValueChange={(index, value) => replaceDimensionValue(0, index, value)}
          onThresholdChange={setThreshold}
        />
      ) : (
        <TwoDimensionEditor
          model={model}
          options={dimensionOptions}
          selectedKeys={selectedKeys}
          onDimensionChange={setDimension}
          onValuesChange={setDimensionValues}
          onValueChange={replaceDimensionValue}
          onThresholdChange={setThreshold}
          onFallbackChange={(fallback) => updateModel((current) => ({ ...current, fallback }))}
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
    <Card className="flex w-full min-w-0 max-w-full flex-col gap-lg overflow-hidden shadow-sm">
      {content}
      <div className="flex justify-end gap-sm">
        <Button appearance="stroked" variant="secondary" onClick={onCancel}>
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
  const numeric = isNumericDimension(dimension, currentOption?.field);
  const availableValues = currentOption?.knownValues ?? [];
  const canAddValue =
    !!dimension &&
    (availableValues.some((value) => !dimension.values.includes(value as never)) ||
      (dimension.type === 'field' && !currentOption?.closed && !dimension.values.includes('')));

  function addValue() {
    if (!dimension) return;
    const unusedValue = availableValues.find((value) => !dimension.values.includes(value as never));
    const nextValue =
      unusedValue ??
      (dimension.type === 'field' && !currentOption?.closed && !dimension.values.includes('') ? '' : undefined);
    if (nextValue === undefined) return;
    onValuesChange([...dimension.values, nextValue] as Array<string | number>);
  }

  function replaceValue(index: number, value: string | number) {
    if (!dimension) return;
    onValueChange(index, value);
  }

  function removeValue(index: number) {
    if (!dimension) return;
    onValuesChange(dimension.values.filter((_, currentIndex) => currentIndex !== index));
  }

  const parentGridClassName = 'grid grid-cols-[minmax(10rem,1fr)_7rem_auto] gap-x-md gap-y-sm';
  const rowSubgridClassName = 'col-span-full grid grid-cols-subgrid items-center';

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
          allowNumeric
          onChange={onDimensionChange}
        />
      </div>

      {dimension ? (
        <div className="border-grey-border bg-grey-background-light flex flex-col gap-md rounded-md border p-md">
          {numeric ? (
            <NumericOneDimensionEditor
              dimension={dimension}
              fallback={model.fallback}
              thresholds={model.thresholds}
              onValuesChange={onValuesChange}
              onValueChange={onValueChange}
              onThresholdChange={onThresholdChange}
            />
          ) : (
            <>
              <div className={parentGridClassName}>
                <div className={cn(rowSubgridClassName, 'text-default text-grey-secondary font-medium')}>
                  <span className="whitespace-nowrap">
                    {t('scenarios:value_switch.if_value_is', { variable: currentOption?.label ?? '' })}
                  </span>
                  <span className="whitespace-nowrap">{t('scenarios:value_switch.then_score')}</span>
                  <span aria-hidden />
                </div>
                {dimension.values.map((value, index) => (
                  <div key={`${typeof value}:${String(value)}`} className={rowSubgridClassName}>
                    <DimensionValueInput
                      dimension={dimension}
                      value={value}
                      field={currentOption?.field}
                      knownValues={availableValues}
                      unavailableValues={dimension.values.filter((_, currentIndex) => currentIndex !== index)}
                      onChange={(next) => replaceValue(index, next)}
                    />
                    <ScoreInput
                      value={model.thresholds[getValueSwitchCellKey([value])] ?? model.fallback}
                      onChange={(threshold) => onThresholdChange([value], threshold)}
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
                ))}
              </div>
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
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ScoreInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <NumberInput
      className="w-full"
      value={value}
      onChange={onChange}
      forceSign
      colorByValue={{
        thresholds: [
          { threshold: 0, comparison: '<', color: 'green' },
          { threshold: 0, comparison: '>', color: 'red' },
        ],
        defaultColor: 'primary',
      }}
    />
  );
}

type NumericOneDimensionEditorProps = {
  dimension: ValueSwitchDimension;
  fallback: number;
  thresholds: Record<string, number>;
  onValuesChange: (values: Array<string | number>) => void;
  onValueChange: (index: number, value: string | number) => void;
  onThresholdChange: (values: Array<string | number>, threshold: number) => void;
};

function NumericOneDimensionEditor({
  dimension,
  fallback,
  thresholds,
  onValuesChange,
  onValueChange,
  onThresholdChange,
}: NumericOneDimensionEditorProps) {
  const { t } = useTranslation(['scenarios', 'user-scoring']);
  const bounds = getNumericValues(dimension.values);

  function insertBound(index: number) {
    const value = getInsertedNumericBound(bounds, index);
    if (value === null) return;
    const next = [...bounds];
    next.splice(index + 1, 0, value);
    onValuesChange(next);
  }

  function removeBound(index: number) {
    if (bounds.length === 1) return;
    onValuesChange(bounds.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="flex flex-col">
      {bounds.map((bound, index) => (
        <div key={`numeric-bound-${index}`}>
          <div className="grid grid-cols-[3rem_7rem_2rem_7rem_minmax(7rem,1fr)_3rem] items-center gap-sm">
            <span
              className={CtaV2ClassName({
                variant: 'secondary',
                mode: index === 0 ? 'icon' : 'normal',
                appearance: index === 0 ? 'stroked' : 'link',
              })}
              aria-disabled={index === 0}
            >
              {index === 0 ? '≤' : t('user-scoring:switch.number.middle')}
            </span>
            {index > 0 ? <Input disabled value={(bounds[index - 1] ?? 0) + 1} /> : null}
            {index > 0 ? (
              <span className="text-grey-secondary text-center">{t('user-scoring:switch.number.and')}</span>
            ) : null}
            <NumberInput
              data-value-switch-threshold-input
              className={index === 0 ? 'col-start-2 col-span-3' : undefined}
              value={bound}
              onChange={(value) => onValueChange(index, value)}
            />
            <ScoreInput
              value={thresholds[getValueSwitchCellKey([bound])] ?? fallback}
              onChange={(value) => onThresholdChange([bound], value)}
            />
            <Button
              mode="icon"
              variant="secondary"
              appearance="stroked"
              aria-label={t('scenarios:value_switch.remove_value')}
              disabled={bounds.length === 1}
              onClick={() => removeBound(index)}
            >
              <Icon icon="delete" className="size-4" />
            </Button>
          </div>
          <InsertThresholdControl
            disabled={getInsertedNumericBound(bounds, index) === null}
            onClick={() => insertBound(index)}
            label={t('scenarios:value_switch.add_value')}
          />
        </div>
      ))}
      <div className="grid grid-cols-[3rem_7rem] items-center gap-sm">
        <span
          className={CtaV2ClassName({ variant: 'secondary', mode: 'icon', appearance: 'stroked' })}
          aria-disabled={true}
        >
          &gt;
        </span>
        <Input readOnly disabled value={bounds.at(-1) ?? ''} />
      </div>
    </div>
  );
}

function InsertThresholdControl({
  disabled,
  onClick,
  label,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <div className="group h-4 w-full">
      {!disabled ? (
        <button
          type="button"
          className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 flex items-center w-full"
          aria-label={label}
          onClick={(event) => {
            onClick();
            focusNextThresholdInput(event.currentTarget);
          }}
        >
          <Icon icon="plus" className="size-4 p-1 border border-grey-placeholder rounded-full text-grey-primary" />
          <div className="bg-grey-placeholder h-1 w-full" />
        </button>
      ) : null}
    </div>
  );
}

function focusNextThresholdInput(control: HTMLElement) {
  requestAnimationFrame(() => {
    const nextInput = [...document.querySelectorAll<HTMLInputElement>('[data-value-switch-threshold-input]')].find(
      (input) => control.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING,
    );
    nextInput?.focus();
    nextInput?.select();
  });
}

type TwoDimensionEditorProps = {
  model: ValueSwitchModel;
  options: DimensionOption[];
  selectedKeys: Array<string | null>;
  onDimensionChange: (index: number, option: DimensionOption) => void;
  onValuesChange: (index: number, values: Array<string | number>) => void;
  onValueChange: (dimensionIndex: number, valueIndex: number, value: string | number) => void;
  onThresholdChange: (values: Array<string | number>, threshold: number) => void;
  onFallbackChange: (fallback: number) => void;
};

function TwoDimensionEditor({
  model,
  options,
  selectedKeys,
  onDimensionChange,
  onValuesChange,
  onValueChange,
  onThresholdChange,
  onFallbackChange,
}: TwoDimensionEditorProps) {
  const { t, i18n } = useTranslation(['scenarios']);
  const [rowDimension, columnDimension] = model.dimensions;
  const cellRefs = useRef<Array<HTMLInputElement | null>>([]);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const columnCount = columnDimension?.values.length ?? 0;
  const hasCompactCells = columnCount > 4;
  const rowOption = rowDimension
    ? options.find((option) => option.key === getValueSwitchDimensionKey(rowDimension))
    : undefined;
  const numericRows = isNumericDimension(rowDimension, rowOption?.field);
  const numericBounds = numericRows && rowDimension ? getNumericValues(rowDimension.values) : [];

  function handleCellKeyDown(event: KeyboardEvent<HTMLInputElement>, rowIndex: number, columnIndex: number) {
    if (!['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'Enter'].includes(event.key)) return;

    event.preventDefault();
    const rowCount = (rowDimension?.values.length ?? 0) + (numericRows ? 1 : 0);
    const target = getTwoDimensionGridNavigationTarget({
      key: event.key as TwoDimensionGridNavigationKey,
      shiftKey: event.shiftKey,
      direction: i18n.dir(),
      rowIndex,
      columnIndex,
      rowCount,
      columnCount,
    });
    if (!target) return;

    const targetInput = cellRefs.current[target.rowIndex * columnCount + target.columnIndex];
    if (!targetInput) return;

    targetInput.focus({ preventScroll: true });
    targetInput.select();
    if (!tableScrollRef.current) return;
    scrollTwoDimensionGridCellIntoView({
      cell: targetInput,
      container: tableScrollRef.current,
      ...target,
      rowCount,
      columnCount,
    });
  }

  return (
    <div className="flex min-w-0 flex-col gap-md isolate">
      <div className="grid min-w-0 grid-cols-1 gap-md md:grid-cols-2">
        {[0, 1].map((index) => {
          const dimension = model.dimensions[index];
          const currentOption = dimension
            ? options.find((option) => option.key === getValueSwitchDimensionKey(dimension))
            : null;
          return (
            <div
              key={index}
              className="border-grey-border bg-grey-background-light flex min-w-0 flex-col gap-md rounded-md border p-md"
            >
              <div className="flex min-w-0 flex-col gap-sm">
                <span className="text-default text-grey-secondary font-medium">
                  {t(index === 0 ? 'scenarios:value_switch.rows_based_on' : 'scenarios:value_switch.columns_based_on')}
                </span>
                <DimensionSelect
                  options={options}
                  selectedKey={selectedKeys[index] ?? null}
                  excludedKey={selectedKeys[index === 0 ? 1 : 0] ?? null}
                  allowNumeric={index === 0}
                  onChange={(option) => onDimensionChange(index, option)}
                />
              </div>
              {dimension && !isNumericDimension(dimension, currentOption?.field) ? (
                <DimensionValuesSelect
                  dimension={dimension}
                  field={currentOption?.field}
                  knownValues={currentOption?.knownValues ?? []}
                  onChange={(values) => onValuesChange(index, values)}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {rowDimension && columnDimension && rowDimension.values.length > 0 && columnDimension.values.length > 0 ? (
        <div
          ref={tableScrollRef}
          className="border-grey-border max-h-[30vh] w-full min-w-0 overflow-auto rounded-md border"
        >
          <table
            className="table-fixed border-collapse"
            style={{ width: `${(numericRows ? 20 : 12) + columnCount * (hasCompactCells ? 6.5 : 7)}rem` }}
          >
            <thead>
              <tr>
                <th className="border-grey-border bg-surface-card sticky top-0 left-0 z-20 w-48 border-r border-b p-sm" />
                {columnDimension.values.map((value) => (
                  <th
                    key={`${typeof value}:${String(value)}`}
                    className={cn(
                      'border-grey-border bg-surface-card sticky top-0 z-10 max-w-0 overflow-hidden border-b text-start font-normal',
                      hasCompactCells ? 'p-xs' : 'p-sm',
                    )}
                  >
                    <ValueSwitchValueTag
                      dimension={columnDimension}
                      value={value}
                      field={
                        options.find((option) => option.key === getValueSwitchDimensionKey(columnDimension))?.field
                      }
                      className="max-w-full"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowDimension.values.map((rowValue, rowIndex) => (
                <tr key={`${typeof rowValue}:${String(rowValue)}`}>
                  <th
                    className={cn(
                      'border-grey-border bg-surface-card sticky left-0 z-10 overflow-visible border-r text-start font-normal',
                      numericRows ? 'w-80' : 'w-48 overflow-hidden',
                      hasCompactCells ? 'p-xs' : 'p-sm',
                    )}
                  >
                    {numericRows && typeof rowValue === 'number' ? (
                      <NumericTableBandHeader
                        bounds={numericBounds}
                        index={rowIndex}
                        onValueChange={(value) => onValueChange(0, rowIndex, value)}
                        onValuesChange={(values) => onValuesChange(0, values)}
                      />
                    ) : (
                      <ValueSwitchValueTag
                        dimension={rowDimension}
                        value={rowValue}
                        field={rowOption?.field}
                        className="max-w-full"
                      />
                    )}
                  </th>
                  {columnDimension.values.map((columnValue, columnIndex) => (
                    <td
                      key={getValueSwitchCellKey([rowValue, columnValue])}
                      className={hasCompactCells ? 'p-xs' : 'p-sm'}
                    >
                      <NumberInput
                        ref={(element) => {
                          cellRefs.current[rowIndex * columnCount + columnIndex] = element;
                        }}
                        size="medium"
                        className="min-w-24"
                        aria-label={t('scenarios:value_switch.cell_value', {
                          row: String(rowValue),
                          column: String(columnValue),
                        })}
                        value={model.thresholds[getValueSwitchCellKey([rowValue, columnValue])] ?? model.fallback}
                        onChange={(threshold) => onThresholdChange([rowValue, columnValue], threshold)}
                        onKeyDown={(event) => handleCellKeyDown(event, rowIndex, columnIndex)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
              {numericRows ? (
                <tr>
                  <th
                    className={cn(
                      'border-grey-border bg-surface-card sticky left-0 z-10 w-80 border-r text-start font-normal',
                      hasCompactCells ? 'p-xs' : 'p-sm',
                    )}
                  >
                    <div className="grid grid-cols-[3rem_7rem] items-center gap-sm">
                      <span className="text-center text-purple-primary">&gt;</span>
                      <Input readOnly disabled value={numericBounds.at(-1) ?? ''} />
                    </div>
                  </th>
                  {columnDimension.values.map((columnValue, columnIndex) => {
                    const rowIndex = numericBounds.length;
                    return (
                      <td key={`fallback:${String(columnValue)}`} className={hasCompactCells ? 'p-xs' : 'p-sm'}>
                        <NumberInput
                          ref={(element) => {
                            cellRefs.current[rowIndex * columnCount + columnIndex] = element;
                          }}
                          size="medium"
                          className="min-w-24"
                          aria-label={t('scenarios:value_switch.fallback')}
                          value={model.fallback}
                          onChange={onFallbackChange}
                          onKeyDown={(event) => handleCellKeyDown(event, rowIndex, columnIndex)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function NumericTableBandHeader({
  bounds,
  index,
  onValueChange,
  onValuesChange,
}: {
  bounds: number[];
  index: number;
  onValueChange: (value: number) => void;
  onValuesChange: (values: number[]) => void;
}) {
  const { t } = useTranslation(['scenarios', 'user-scoring']);
  const bound = bounds[index] ?? 0;
  const insertedBound = getInsertedNumericBound(bounds, index);

  function insertBound() {
    if (insertedBound === null) return;
    const next = [...bounds];
    next.splice(index + 1, 0, insertedBound);
    onValuesChange(next);
  }

  return (
    <div className="group relative grid grid-cols-[3rem_6rem_2rem_6rem_3rem] items-center gap-xs">
      <span className="text-center text-purple-primary">
        {index === 0 ? '≤' : t('user-scoring:switch.number.middle')}
      </span>
      {index > 0 ? <Input readOnly value={(bounds[index - 1] ?? 0) + 1} /> : null}
      {index > 0 ? (
        <span className="text-grey-secondary text-center">{t('user-scoring:switch.number.and')}</span>
      ) : null}
      <NumberInput
        data-value-switch-threshold-input
        className={index === 0 ? 'col-start-2 col-span-3' : undefined}
        value={bound}
        onChange={onValueChange}
      />
      <Button
        mode="icon"
        variant="secondary"
        appearance="stroked"
        aria-label={t('scenarios:value_switch.remove_value')}
        disabled={bounds.length === 1}
        onClick={() => onValuesChange(bounds.filter((_, currentIndex) => currentIndex !== index))}
      >
        <Icon icon="delete" className="size-4" />
      </Button>
      {insertedBound !== null ? (
        <Button
          mode="icon"
          variant="secondary"
          appearance="stroked"
          className="absolute -bottom-5 left-1/2 z-30 size-6 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          aria-label={t('scenarios:value_switch.add_value')}
          onClick={(event) => {
            insertBound();
            focusNextThresholdInput(event.currentTarget);
          }}
        >
          <Icon icon="plus" className="size-3" />
        </Button>
      ) : null}
    </div>
  );
}

function DimensionSelect({
  options,
  selectedKey,
  excludedKey,
  allowNumeric,
  onChange,
}: {
  options: DimensionOption[];
  selectedKey: string | null;
  excludedKey: string | null;
  allowNumeric: boolean;
  onChange: (option: DimensionOption) => void;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();
  const dataSharp = AstBuilderDataSharpFactory.useSharp();
  const data = dataSharp.select((state) => state.$data);
  const triggerObjectTable = dataSharp.computed.triggerObjectTable.value;
  const selected = options.find((option) => option.key === selectedKey);
  const selectedNode = useMemo<KnownOperandAstNode>(
    () =>
      selected?.dimension.type === 'field'
        ? selected.dimension.field
        : selected?.dimension.type === 'risk-level'
          ? NewRecordRiskLevelCheckAstNode()
          : NewUndefinedAstNode(),
    [selected],
  );
  const menuOptions = useMemo(
    () =>
      getOperandMenuOptions({
        node: selectedNode,
        enums: undefined,
        data: data.value,
        triggerObjectTable,
        language,
        t,
      }).filter((option) => {
        const optionKey = getDimensionKeyForAstNode(option.astNode);
        if (!optionKey || optionKey === excludedKey) return false;
        if (isRecordRiskLevelCheckAstNode(option.astNode)) return options.some(({ key }) => key === 'risk-level');
        return (
          option.operandType === 'Field' &&
          (option.dataType === 'String' || (allowNumeric && ['Int', 'Float'].includes(option.dataType)))
        );
      }),
    [allowNumeric, data.value, excludedKey, language, options, selectedNode, t, triggerObjectTable],
  );
  const operandSharp = EditionOperandSharpFactory.createSharp({
    enumValues: undefined,
    options: menuOptions,
    optionsDataType: undefined,
    coerceDataType: [],
    excludeFields: undefined,
  });

  useEffect(() => {
    operandSharp.actions.setEnumsAndOptions(undefined, menuOptions, undefined);
  }, [menuOptions, operandSharp]);

  function selectNode(node: AstNode) {
    const key = getDimensionKeyForAstNode(node);
    const option = options.find((candidate) => candidate.key === key);
    if (option) onChange(option);
  }

  return (
    <EditionOperandSharpFactory.Provider value={operandSharp}>
      <div className="inline-flex min-w-0 flex-col gap-sm self-start">
        <AstBuilderOperandMenu onSelect={selectNode} bottomActions={[]}>
          <MenuCommand.Trigger>
            <button type="button" className={editionOperandLabelClassnames()}>
              {selected ? (
                <OperandDisplayName interactionMode="editor" node={selectedNode} />
              ) : (
                <span className={operandDisplayNameClassnames({ type: 'placeholder' })}>
                  {t('scenarios:value_switch.select_variable')}
                </span>
              )}
              <MenuCommand.Arrow />
            </button>
          </MenuCommand.Trigger>
        </AstBuilderOperandMenu>
      </div>
    </EditionOperandSharpFactory.Provider>
  );
}

function getDimensionKeyForAstNode(node: AstNode | IdLessAstNode) {
  if (isRecordRiskLevelCheckAstNode(node)) return 'risk-level';
  if (isPayload(node)) return `payload:${node.children[0].constant}`;
  if (isDatabaseAccess(node)) {
    return [
      'database',
      node.namedChildren.tableName.constant,
      ...node.namedChildren.path.constant,
      node.namedChildren.fieldName.constant,
    ].join(':');
  }
  return null;
}

export function DimensionValueInput({
  dimension,
  field,
  value,
  knownValues,
  unavailableValues,
  onChange,
}: {
  dimension: ValueSwitchDimension;
  field?: DataModelField;
  value: string | number;
  knownValues: Array<string | number>;
  unavailableValues: Array<string | number>;
  onChange: (value: string | number) => void;
}) {
  if (field && isEnumField(field))
    return (
      <EnumValueMenu
        field={field}
        selectedValues={[String(value)]}
        currentValues={getStringValues(dimension.values)}
        unavailableValues={unavailableValues}
        onChange={onChange}
      />
    );
  if (dimension.type === 'field' && knownValues.length === 0) {
    return <Input className="w-full" value={String(value)} onChange={(event) => onChange(event.target.value)} />;
  }
  const availableValues = [...new Set([...knownValues, value])];
  return (
    <MenuCommand.Menu>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton className="w-full">
          <ValueSwitchValueTag dimension={dimension} value={value} />
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
              <ValueSwitchValueTag dimension={dimension} value={option} />
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

export function DimensionValuesSelect({
  dimension,
  field,
  knownValues,
  onChange,
}: {
  dimension: ValueSwitchDimension;
  field?: DataModelField;
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

  function addManualValue(e: KeyboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const value = manualValue.trim();
    if (dimension.type !== 'field' || !value || dimension.values.includes(value)) return;
    onChange([...dimension.values, value]);
    setManualValue('');
  }

  if (field && isEnumField(field))
    return (
      <EnumValueMenu multiple field={field} selectedValues={getStringValues(dimension.values)} onChange={onChange} />
    );

  return (
    <div className="flex flex-col gap-sm">
      <MenuCommand.Menu persistOnSelect>
        <MenuCommand.Trigger>
          <MenuCommand.SelectButton className="h-auto min-h-10 w-full min-w-0 overflow-hidden py-sm">
            {dimension.values.length > 0 ? (
              <ExpandableGroupTagLine
                classname="gap-xs pe-lg"
                overflowBehavior="popover"
                items={dimension.values.map((value) => (
                  <ValueSwitchValueTag
                    key={`${typeof value}:${String(value)}`}
                    dimension={dimension}
                    value={value}
                    className="max-w-full"
                  />
                ))}
              />
            ) : (
              <span className="pe-lg">{t('scenarios:value_switch.select_values')}</span>
            )}
          </MenuCommand.SelectButton>
        </MenuCommand.Trigger>
        <MenuCommand.Content align="start" sideOffset={4} sameWidth>
          <MenuCommand.List>
            {availableValues.map((value) => (
              <MenuCommand.Item key={`${typeof value}:${String(value)}`} onSelect={() => toggle(value)}>
                <ValueSwitchValueTag dimension={dimension} value={value} />
                {dimension.values.includes(value as never) ? <Icon icon="tick" className="size-4" /> : null}
              </MenuCommand.Item>
            ))}
            {dimension.type === 'field' ? (
              <div className="flex gap-sm">
                <Input
                  size="medium"
                  className="flex-1"
                  value={manualValue}
                  placeholder={t('scenarios:value_switch.manual_value')}
                  onChange={(event) => setManualValue(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && addManualValue(event)}
                />
              </div>
            ) : null}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
}
