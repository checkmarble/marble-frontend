import { Callout } from '@app-builder/components';
import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { RemoveButton } from '@app-builder/components/AstBuilder/styles/RemoveButton';
import { scenarioI18n } from '@app-builder/components/Scenario';
import { type DataModel, isUndefinedAstNode, NewUndefinedAstNode } from '@app-builder/models';
import {
  aggregationFilterOperators,
  type BinaryAggregationFilterAstNode,
  FuzzyMatchFilterAstNode,
  isBinaryAggregationFilter,
  isComplexAggregationFilter,
  isFuzzyMatchFilterOptionsAstNode,
  NewAggregatorFilterAstNode,
} from '@app-builder/models/astNode/aggregation';
import { isKnownOperandAstNode, type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { getResolvedEnumValues } from '@app-builder/models/enum-values';
import { getAstNodeDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';
import { useFormatLanguage } from '@app-builder/utils/format';
import { Fragment, type ReactNode, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, cn, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { InlineFilterValue, isComplexInlineFilter } from '../../../AggregationFilters/InlineFilterValue';
import { TimestampExtractTimezoneLink } from '../../../AggregationFilters/TimestampExtractTimezoneLink';
import { EditionAstBuilderOperand } from '../../../EditionOperand';
import { EditionEvaluationErrors } from '../../../EvaluationErrors';
import { getErrorsForNode } from '../../../helpers';
import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { OperatorSelect } from '../../../OperatorSelect';
import { OperandEditModal } from '../../EditModal';
import { type DataModelFieldOption, EditDataModelFieldTableMenu } from './EditDataModelField';
import {
  type AggregationFilterEditModel,
  createStandardFilterEditModel,
  createTimestampExtractEditModel,
  hasTimestampExtractFilterForField,
} from './edit-model';

type EditFiltersProps = {
  aggregatedField: DataModelFieldOption | null;
  dataModel: DataModel;
  filters: AggregationFilterEditModel[];
  onChange: (filters: AggregationFilterEditModel[]) => void;
};
export function EditFilters({ aggregatedField, dataModel, filters, onChange }: EditFiltersProps) {
  const { t } = useTranslation(scenarioI18n);
  const { t: stringifyContextT } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();
  const customLists = AstBuilderDataSharpFactory.select((s) => s.data.customLists);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const evaluation = nodeSharp.select((s) => s.validation);
  const [filterEditedIndex, setEditedFilterIndex] = useState<number | null>(null);

  const tableName = aggregatedField?.tableName;
  const options = useMemo(() => {
    return tableName
      ? dataModel.find((t) => t.name === tableName)?.fields.map((f) => ({ tableName, fieldName: f.name, field: f }))
      : null;
  }, [tableName, dataModel]);

  return (
    <div className="flex flex-col gap-md">
      <div className="text-m">
        <Trans
          t={t}
          i18nKey={tableName ? 'scenarios:edit_aggregation.filters_in' : 'scenarios:edit_aggregation.filters'}
          values={{ tableName }}
        />
      </div>
      {filters.length > 0 ? (
        <div className="flex flex-col gap-sm">
          {filters.map((editFilter, filterIndex) => {
            const filter =
              editFilter.type === 'standard' ? editFilter.filter : (editFilter.sourceFilters[0] ?? editFilter.seed);
            const binaryFilter =
              editFilter.type === 'standard' && isBinaryAggregationFilter(editFilter.filter)
                ? editFilter.filter
                : undefined;
            const inlineFilter = isComplexInlineFilter(editFilter) ? editFilter : undefined;
            const fuzzyFilter =
              editFilter.type === 'standard' && isComplexAggregationFilter(editFilter.filter)
                ? isFuzzyMatchFilterOptionsAstNode(editFilter.filter.namedChildren.value)
                  ? (editFilter.filter as FuzzyMatchFilterAstNode)
                  : undefined
                : undefined;
            const complexFilter = !!inlineFilter || !!fuzzyFilter;
            const isLastFilter = filterIndex === filters.length - 1;
            const filteredFieldErrors = getErrorsForNode(evaluation, [
              filter?.namedChildren.fieldName.id ?? '',
              filter?.namedChildren.tableName.id ?? '',
            ]);
            const operatorErrors = getErrorsForNode(evaluation, filter?.namedChildren.operator.id ?? '');
            const valueErrors = binaryFilter
              ? getErrorsForNode(evaluation, binaryFilter.namedChildren.value.id, true)
              : [];

            const displayName =
              fuzzyFilter && !isUndefinedAstNode(fuzzyFilter.namedChildren.value)
                ? getAstNodeDisplayName(fuzzyFilter.namedChildren.value, {
                    t: stringifyContextT,
                    language,
                    customLists,
                  })
                : '...';

            const enumValues =
              editFilter.type === 'standard' &&
              editFilter.filter.namedChildren.tableName.constant &&
              editFilter.filter.namedChildren.fieldName.constant
                ? getResolvedEnumValues(
                    dataModel,
                    editFilter.filter.namedChildren.tableName.constant,
                    editFilter.filter.namedChildren.fieldName.constant,
                  )
                : [];

            const tableName =
              editFilter.type === 'timestampExtract'
                ? editFilter.tableName
                : editFilter.filter.namedChildren.tableName.constant;
            const fieldName =
              editFilter.type === 'timestampExtract'
                ? editFilter.fieldName
                : editFilter.filter.namedChildren.fieldName.constant;
            const operator =
              editFilter.type === 'timestampExtract'
                ? 'TimestampExtract'
                : editFilter.filter.namedChildren.operator.constant;
            const availableFieldOptions =
              editFilter.type === 'timestampExtract'
                ? options?.filter(
                    (option) =>
                      !hasTimestampExtractFilterForField(filters, option.tableName, option.fieldName, filterIndex),
                  )
                : options;
            const availableOperators = aggregationFilterOperators.filter(
              (candidate) =>
                candidate !== 'TimestampExtract' ||
                !hasTimestampExtractFilterForField(filters, tableName, fieldName, filterIndex),
            );

            return (
              <Fragment key={filterIndex}>
                <div className="border-grey-border flex flex-col gap-md rounded-md border-[0.5px] p-md">
                  <div className="flex items-center justify-between">
                    <div className="text-grey-secondary flex items-center gap-sm ps-sm text-xs">
                      <span className="h-10 flex items-center self-start">
                        {t('scenarios:edit_aggregation.filter_field_label')}
                      </span>
                      <div className="flex flex-col gap-sm">
                        <div className="flex items-center gap-sm">
                          <FieldSelect
                            tableName={tableName ?? undefined}
                            options={availableFieldOptions}
                            trigger={
                              <button
                                type="button"
                                className={cn(
                                  'text-s bg-surface-card aria-disabled:bg-grey-background-light text-grey-primary flex h-10 items-center justify-between rounded-sm border px-xs',
                                  filteredFieldErrors.length > 0 ? 'border-red-primary' : 'border-grey-border',
                                )}
                              >
                                {fieldName}
                                <Icon icon="arrow-2-down" className="size-5" />
                              </button>
                            }
                            onChange={(filteredField) => {
                              if (editFilter.type === 'timestampExtract') {
                                onChange(
                                  filters.with(filterIndex, {
                                    ...editFilter,
                                    tableName: filteredField.tableName,
                                    fieldName: filteredField.fieldName,
                                  }),
                                );
                                return;
                              }

                              const updatedFilter = R.clone(editFilter.filter);
                              updatedFilter.namedChildren.tableName.constant = filteredField.tableName;
                              updatedFilter.namedChildren.fieldName.constant = filteredField.fieldName;
                              onChange(filters.with(filterIndex, { type: 'standard', filter: updatedFilter }));
                            }}
                          />
                          <span>{t('scenarios:edit_aggregation.filter_operator_label')}</span>
                          <OperatorSelect
                            isFilter
                            options={availableOperators}
                            operator={operator}
                            onOperatorChange={(operator) => {
                              const source = R.clone(editFilter.type === 'standard' ? editFilter.filter : filter);
                              if (!source) return;
                              if (editFilter.type === 'timestampExtract') {
                                source.namedChildren.tableName.constant = editFilter.tableName;
                                source.namedChildren.fieldName.constant = editFilter.fieldName;
                              }
                              onChange(
                                filters.with(
                                  filterIndex,
                                  operator === 'TimestampExtract'
                                    ? createTimestampExtractEditModel(source)
                                    : createStandardFilterEditModel(source, operator),
                                ),
                              );
                            }}
                            validationStatus={operatorErrors.length > 0 ? 'error' : 'valid'}
                          />
                          {editFilter.type === 'timestampExtract' ? <TimestampExtractTimezoneLink /> : null}
                          {binaryFilter && binaryFilter.namedChildren.operator.constant ? (
                            <>
                              <span>{t('scenarios:edit_aggregation.filter_value_label')}</span>
                              <EditionAstBuilderOperand
                                node={binaryFilter.namedChildren.value as KnownOperandAstNode}
                                onChange={(node) => {
                                  if (isKnownOperandAstNode(node)) {
                                    const updatedFilter = R.clone(binaryFilter) as BinaryAggregationFilterAstNode;
                                    updatedFilter.namedChildren.value = node;
                                    onChange(filters.with(filterIndex, { type: 'standard', filter: updatedFilter }));
                                  }
                                }}
                                optionsDataType={(opt) => opt.operandType !== 'Modeling'}
                                validationStatus={valueErrors.length > 0 ? 'error' : 'valid'}
                                enumValues={
                                  ['=', '!='].includes(binaryFilter.namedChildren.operator.constant)
                                    ? enumValues
                                    : undefined
                                }
                              />
                            </>
                          ) : null}
                          {complexFilter ? (
                            inlineFilter ? null : (
                              <>
                                <Button variant="secondary" onClick={() => setEditedFilterIndex(filterIndex)}>
                                  {displayName}
                                </Button>
                                {fuzzyFilter && filterEditedIndex === filterIndex ? (
                                  <OperandEditModal
                                    node={R.clone(fuzzyFilter.namedChildren.value)}
                                    onSave={(astNode) => {
                                      if (isFuzzyMatchFilterOptionsAstNode(astNode)) {
                                        const updatedFilter = R.clone(fuzzyFilter) as FuzzyMatchFilterAstNode;
                                        updatedFilter.namedChildren.value = astNode;
                                        onChange(
                                          filters.with(filterIndex, { type: 'standard', filter: updatedFilter }),
                                        );
                                      }
                                      setEditedFilterIndex(null);
                                    }}
                                    onCancel={() => {
                                      setEditedFilterIndex(null);
                                    }}
                                  />
                                ) : null}
                              </>
                            )
                          ) : null}
                        </div>
                        {inlineFilter ? (
                          <InlineFilterValue
                            filter={inlineFilter}
                            onChange={(updatedFilter) => onChange(filters.with(filterIndex, updatedFilter))}
                          />
                        ) : null}
                      </div>
                    </div>
                    <RemoveButton
                      onClick={() => {
                        onChange(filters.toSpliced(filterIndex, 1));
                      }}
                    />
                  </div>
                  {filter ? <EditionEvaluationErrors id={filter.id} /> : null}
                </div>
                {!isLastFilter ? (
                  <div className="text-grey-secondary text-xs">{t('scenarios:logical_operator.and')}</div>
                ) : null}
              </Fragment>
            );
          })}
        </div>
      ) : null}
      <div className="flex flex-row justify-start gap-sm">
        <FieldSelect
          tableName={tableName}
          options={options}
          trigger={
            <Button disabled={!tableName} className="h-fit" variant="secondary">
              <Icon icon="plus" className="size-5" />
              {t('scenarios:edit_aggregation.add_filter')}
            </Button>
          }
          onChange={(filteredField) => {
            onChange([
              ...filters,
              {
                type: 'standard',
                filter: NewAggregatorFilterAstNode({
                  namedChildren: {
                    fieldName: NewConstantAstNode({ constant: filteredField.fieldName }),
                    tableName: NewConstantAstNode({ constant: filteredField.tableName }),
                    operator: NewConstantAstNode({ constant: null }),
                    value: NewUndefinedAstNode(),
                  },
                }),
              },
            ]);
          }}
        />
        {filters.length === 0 ? <Callout>{t('scenarios:edit_aggregation.add_filter.callout')}</Callout> : null}
      </div>
    </div>
  );
}

function FieldSelect({
  tableName,
  options,
  trigger,
  onChange,
}: {
  tableName: string | undefined;
  options: DataModelFieldOption[] | null | undefined;
  trigger: ReactNode;
  onChange: (filteredField: DataModelFieldOption) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>{trigger}</MenuCommand.Trigger>
      <MenuCommand.Content className="text-s w-75" align="start" sideOffset={4}>
        {tableName && options ? (
          <EditDataModelFieldTableMenu tableName={tableName} fields={options} onChange={onChange} />
        ) : null}
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
