import { AstBuilder } from '@app-builder/components/AstBuilder';
import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { type DataModelField, getDataTypeIcon, isUndefinedAstNode, type PrimitiveTypes } from '@app-builder/models';
import {
  type AggregationAstNode,
  aggregationFilterOperators,
  aggregationFiltersWithTypes,
  type FuzzyMatchFilterAstNode,
  isBinaryAggregationFilter,
  isComplexAggregationFilter,
  isFuzzyMatchFilterOptionsAstNode,
  isUnaryAggregationFilter,
  NewAggregatorFilterAstNode,
} from '@app-builder/models/astNode/aggregation';
import { NewUndefinedAstNode } from '@app-builder/models/astNode/ast-node';
import { isKnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { getResolvedEnumValues } from '@app-builder/models/enum-values';
import { getOperatorName } from '@app-builder/models/get-operator-name';
import {
  aggregatorOperators,
  isAggregatorOperator,
  supportedAggregatorsOperatorsTypes,
} from '@app-builder/models/modale-operators';
import { useCreateCustomerAggregateMutation } from '@app-builder/queries/customer-aggregates/create-customer-aggregate';
import { useUpdateCustomerAggregateMutation } from '@app-builder/queries/customer-aggregates/update-customer-aggregate';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { useGetCustomListsQuery } from '@app-builder/queries/get-custom-lists';
import {
  type BuilderOptionsResource,
  buildDatabaseAccessorsFromDataModel,
  buildPayloadAccessorsFromDataModel,
} from '@app-builder/server-fns/scenarios';
import { getAstNodeDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';
import { useFormatLanguage } from '@app-builder/utils/format';
import { type CustomerAggregateDto } from 'marble-api';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { clone } from 'remeda';
import { Button, Input, Popover, SelectV2, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { InlineFilterValue, isComplexInlineFilter } from '../AstBuilder/edition/AggregationFilters/InlineFilterValue';
import { TimestampExtractTimezoneLink } from '../AstBuilder/edition/AggregationFilters/TimestampExtractTimezoneLink';
import { EditionAstBuilderOperand } from '../AstBuilder/edition/EditionOperand';
import { OperandEditModal } from '../AstBuilder/edition/EditModal/EditModal';
import {
  type AggregationFilterEditModel,
  createStandardFilterEditModel,
  createTimestampExtractEditModel,
  hasEmptyTimestampExtractFilter,
  hasTimestampExtractFilterForField,
  toAggregationFilterEditModel,
  toAggregationFilters,
} from '../AstBuilder/edition/EditModal/modals/Aggregation/edit-model';
import { AstBuilderNodeSharpFactory } from '../AstBuilder/edition/node-store';
import { OperatorSelect } from '../AstBuilder/edition/OperatorSelect';
import { ListValueInput } from '../UserScoring/SwitchNode/ListValueInput';
import {
  createCustomerKpiAggregation,
  getCustomerKpiAggregation,
  getCustomerKpiFilterValue,
  getCustomerKpiNavigationOption,
  isCustomerKpiAggregationComplete,
  setCustomerKpiFilterValue,
  setCustomerKpiNavigationOption,
} from './customer-kpis-ast';
import { LinkedTablesSelect } from './LinkedTablesSelect';

type CustomerKpisConfigurationPopoverProps = {
  objectId: string;
  objectType: string;
  aggregate: CustomerAggregateDto | null;
  onClose: () => void;
};

export function CustomerKpisConfigurationPopover(props: CustomerKpisConfigurationPopoverProps) {
  const dataModelQuery = useDataModelQuery();
  const customListsQuery = useGetCustomListsQuery();
  const dataModel = dataModelQuery.data?.dataModel ?? [];
  const customLists = customListsQuery.data ?? [];
  const databaseAccessors = useMemo(
    () => buildDatabaseAccessorsFromDataModel(dataModel, props.objectType),
    [dataModel, props.objectType],
  );
  const payloadAccessors = useMemo(
    () => buildPayloadAccessorsFromDataModel(dataModel, props.objectType),
    [dataModel, props.objectType],
  );
  const builderOptions = useMemo(
    (): BuilderOptionsResource => ({
      dataModel,
      triggerObjectType: props.objectType,
      customLists,
      databaseAccessors,
      payloadAccessors,
      hasContinuousScreening: false,
      screeningConfigs: [],
      hasScoringRuleset: false,
      scoringSettings: null,
    }),
    [dataModel, props.objectType, customLists, databaseAccessors, payloadAccessors],
  );

  if (dataModelQuery.isPending) {
    return <CustomerKpisConfigurationLoading />;
  }

  if (dataModelQuery.isError) {
    return <CustomerKpisConfigurationError onRetry={() => dataModelQuery.refetch()} />;
  }

  return (
    <AstBuilder.StaticProvider data={builderOptions} mode="edit">
      <CustomerKpisConfigurationEditor {...props} />
    </AstBuilder.StaticProvider>
  );
}

function CustomerKpisConfigurationEditor({
  objectId,
  objectType,
  aggregate,
  onClose,
}: CustomerKpisConfigurationPopoverProps) {
  const initialNode = useMemo(() => getCustomerKpiAggregation(aggregate), [aggregate]);
  const nodeStore = AstBuilderNodeSharpFactory.createSharp({
    initialNode,
    initialValidation: { errors: [], evaluation: [] },
    validationFn: async () => ({ errors: [], evaluation: [] }),
  });

  return (
    <AstBuilderNodeSharpFactory.Provider value={nodeStore}>
      <CustomerKpisConfigurationForm
        objectId={objectId}
        objectType={objectType}
        aggregate={aggregate}
        onClose={onClose}
      />
    </AstBuilderNodeSharpFactory.Provider>
  );
}

function CustomerKpisConfigurationLoading() {
  const { t } = useTranslation(['client360']);

  return <div className="p-md text-small text-grey-secondary">{t('client360:customer_kpis.status.loading')}</div>;
}

function CustomerKpisConfigurationError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation(['common']);

  return (
    <div className="flex flex-col items-center gap-sm p-md text-center">
      <span className="text-small text-grey-secondary">{t('common:generic_fetch_data_error')}</span>
      <Button size="small" variant="secondary" onClick={onRetry}>
        {t('common:retry')}
      </Button>
    </div>
  );
}

function CustomerKpisConfigurationForm({
  objectId,
  objectType,
  aggregate,
  onClose,
}: CustomerKpisConfigurationPopoverProps) {
  const { t } = useTranslation(['common', 'client360']);
  const { t: stringifyContextT } = useTranslation(['common', 'scenarios']);
  const createCustomerAggregateMutation = useCreateCustomerAggregateMutation();
  const updateCustomerAggregateMutation = useUpdateCustomerAggregateMutation();
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((state) => state.node as AggregationAstNode);
  const dataModel = AstBuilderDataSharpFactory.select((state) => state.data.dataModel);
  const customLists = AstBuilderDataSharpFactory.select((state) => state.data.customLists);
  const [timeSlice, setTimeSlice] = useState(aggregate?.time_slice ?? 'P1M');
  const [editedFilterIndex, setEditedFilterIndex] = useState<number | null>(null);
  const [userFilterModels, setUserFilterModels] = useState<AggregationFilterEditModel[]>(() =>
    toAggregationFilterEditModel(node.namedChildren.filters.children.slice(3)),
  );
  const language = useFormatLanguage();

  const tableName = node.namedChildren.tableName.constant;
  const functionName = node.namedChildren.aggregator.constant;
  const fieldName = node.namedChildren.fieldName.constant;
  const table =
    typeof tableName === 'string' ? dataModel.find((dataModelTable) => dataModelTable.name === tableName) : null;
  const tableFields = table?.fields ?? [];
  const currentNavigationOption = getCustomerKpiNavigationOption(node, objectType, dataModel);

  const availableOperators = aggregatorOperators.filter((operator) => {
    const supportedTypeInfos = supportedAggregatorsOperatorsTypes[operator];
    return tableFields.some((field) => supportedTypeInfos.includes(field.dataType as PrimitiveTypes));
  });
  const availableFields =
    typeof functionName === 'string' && isAggregatorOperator(functionName)
      ? tableFields.filter((field) =>
          supportedAggregatorsOperatorsTypes[functionName].includes(field.dataType as PrimitiveTypes),
        )
      : [];
  const hasEmptyTimestampFilter = hasEmptyTimestampExtractFilter(userFilterModels);
  const canSubmit =
    isCustomerKpiAggregationComplete(node, objectType, dataModel) && !!timeSlice && !hasEmptyTimestampFilter;

  function updateNode(update: (currentNode: AggregationAstNode) => void) {
    nodeSharp.update(() => {
      update(nodeSharp.value.node as AggregationAstNode);
    });
    void nodeSharp.actions.validate();
  }

  function updateUserFilters(filters: AggregationFilterEditModel[]) {
    setUserFilterModels(filters);
    updateNode((currentNode) => {
      currentNode.namedChildren.filters.children = [
        ...currentNode.namedChildren.filters.children.slice(0, 3),
        ...toAggregationFilters(filters),
      ];
    });
  }

  function updateUserFilterTableName(tableName: string) {
    updateUserFilters(
      userFilterModels.map((filter) => {
        if (filter.type === 'timestampExtract') return { ...filter, tableName };

        const updatedFilter = clone(filter.filter);
        updatedFilter.namedChildren.tableName.constant = tableName;
        return { type: 'standard', filter: updatedFilter };
      }),
    );
  }

  function clearConfiguration() {
    nodeSharp.actions.setNodeAtPath('root', createCustomerKpiAggregation());
    setTimeSlice('P1M');
    setEditedFilterIndex(null);
    setUserFilterModels([]);
    void nodeSharp.actions.validate();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const expression = nodeSharp.value.node as AggregationAstNode;
    if (!isCustomerKpiAggregationComplete(expression, objectType, dataModel) || hasEmptyTimestampFilter) return;

    try {
      const payload = {
        recordType: objectType,
        customerId: objectId,
        name: expression.namedChildren.label.constant,
        timeSlice,
        expression,
      };
      if (aggregate) {
        await updateCustomerAggregateMutation.mutateAsync({ ...payload, aggregateId: aggregate.id });
      } else {
        await createCustomerAggregateMutation.mutateAsync(payload);
      }
      onClose();
    } catch {
      toast.error(t('common:errors.unknown'));
    }
  }

  return (
    <form className="contents" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-md p-md">
        <div className="flex items-center justify-between gap-sm">
          <div className="flex min-w-0 items-center gap-sm">
            <span className="text-default font-medium">{t('client360:customer_kpis.configuration.title')}</span>
            <span aria-hidden="true" className="text-grey-secondary">
              ·
            </span>
            <div className="flex items-center gap-xs">
              <span className="text-small">
                <Trans
                  t={t}
                  i18nKey="client360:customer_kpis.configuration.customer_scope.label"
                  values={{ objectId, objectType }}
                  components={{
                    Scope: <bdi dir="ltr" />,
                    code: (
                      <code className="rounded-sm border border-grey-border bg-surface-card p-xs font-mono text-2xs" />
                    ),
                  }}
                />
              </span>
              <Tooltip.Default content={t('client360:customer_kpis.configuration.customer_scope.tooltip')}>
                <button
                  type="button"
                  aria-label={t('client360:customer_kpis.configuration.customer_scope.tooltip')}
                  className="text-grey-secondary inline-flex shrink-0"
                >
                  <Icon aria-hidden="true" icon="tip" className="size-4" />
                </button>
              </Tooltip.Default>
            </div>
          </div>
          <Button type="button" mode="icon" variant="secondary" appearance="link" onClick={clearConfiguration}>
            <Icon icon="delete" className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-[--spacing(30)_1fr] gap-x-sm gap-y-md">
          <div className="grid grid-cols-subgrid col-span-full items-center">
            <span className="text-right">{t('client360:customer_kpis.form.name.label')}</span>
            <Input
              value={typeof node.namedChildren.label.constant === 'string' ? node.namedChildren.label.constant : ''}
              onChange={(event) => {
                updateNode((currentNode) => {
                  currentNode.namedChildren.label.constant = event.target.value;
                });
              }}
            />
          </div>
          <div className="grid grid-cols-subgrid col-span-full items-center">
            <span className="text-right">{t('client360:customer_kpis.form.source_table.label')}</span>
            <div className="max-w-75">
              <LinkedTablesSelect
                objectType={objectType}
                navigationOption={currentNavigationOption}
                onChange={(navigationOption) => {
                  updateNode((currentNode) => setCustomerKpiNavigationOption(currentNode, navigationOption));
                  updateUserFilterTableName(navigationOption.targetTableName);
                }}
              />
            </div>
          </div>
          {tableName ? (
            <div className="grid grid-cols-subgrid col-span-full items-center">
              <span className="text-right">{t('client360:customer_kpis.form.aggregation.label')}</span>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-sm items-center">
                <SelectV2
                  placeholder={t('client360:customer_kpis.form.aggregation.placeholder')}
                  value={typeof functionName === 'string' ? functionName : ''}
                  options={availableOperators.map((operator) => ({
                    label: getOperatorName(t, operator, false),
                    value: operator,
                  }))}
                  onChange={(operator) => {
                    if (!isAggregatorOperator(operator)) return;
                    updateNode((currentNode) => {
                      currentNode.namedChildren.aggregator.constant = operator;
                      if (operator === 'COUNT') {
                        // The API still requires a valid field, even though COUNT counts rows.
                        currentNode.namedChildren.fieldName.constant = 'object_id';
                        return;
                      }
                      const selectedField = tableFields.find(
                        (field) => field.name === currentNode.namedChildren.fieldName.constant,
                      );
                      if (
                        selectedField &&
                        !supportedAggregatorsOperatorsTypes[operator].includes(selectedField.dataType as PrimitiveTypes)
                      ) {
                        currentNode.namedChildren.fieldName.constant = '';
                      }
                    });
                  }}
                  displayedValue={(option) => (
                    <div className="flex items-center gap-sm">
                      <span className="bg-grey-background text-grey-secondary size-6 rounded-sm flex items-center justify-center">
                        <Icon icon="function" className="size-4" />
                      </span>
                      <span>{option.label}</span>
                    </div>
                  )}
                />
                {functionName && functionName !== 'COUNT' ? (
                  <>
                    <span className="text-center">{t('client360:customer_kpis.form.field.prefix')}</span>
                    <FieldSelect
                      value={typeof fieldName === 'string' ? fieldName : ''}
                      fields={availableFields}
                      onChange={(value) => {
                        updateNode((currentNode) => {
                          currentNode.namedChildren.fieldName.constant = value;
                        });
                      }}
                    />
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
          {functionName && fieldName ? (
            <>
              <div className="grid grid-cols-subgrid col-span-full items-center">
                <span className="text-right">{t('client360:customer_kpis.form.time_window.label')}</span>
                <div className="max-w-75">
                  <SelectV2
                    placeholder={t('client360:customer_kpis.form.time_window.placeholder')}
                    value={timeSlice}
                    options={[
                      { label: t('client360:customer_kpis.form.time_window.options.last_24_hours'), value: 'P1D' },
                      { label: t('client360:customer_kpis.form.time_window.options.last_week'), value: 'P1W' },
                      { label: t('client360:customer_kpis.form.time_window.options.last_month'), value: 'P1M' },
                      { label: t('client360:customer_kpis.form.time_window.options.last_2_months'), value: 'P2M' },
                      { label: t('client360:customer_kpis.form.time_window.options.last_6_months'), value: 'P6M' },
                      { label: t('client360:customer_kpis.form.time_window.options.last_year'), value: 'P1Y' },
                    ]}
                    onChange={setTimeSlice}
                    displayedValue={(option) => (
                      <span>
                        {option.label}{' '}
                        {currentNavigationOption ? (
                          <span className="text-grey-secondary text-tiny">
                            ({currentNavigationOption.orderingFieldName})
                          </span>
                        ) : null}
                      </span>
                    )}
                  />
                </div>
              </div>
              {userFilterModels.map((filterModel, index) => {
                const filter =
                  filterModel.type === 'standard'
                    ? filterModel.filter
                    : (filterModel.sourceFilters[0] ?? filterModel.seed);
                if (!filter) return null;

                const selectedFieldName =
                  filterModel.type === 'timestampExtract'
                    ? filterModel.fieldName
                    : filter.namedChildren.fieldName.constant;
                const selectedOperator =
                  filterModel.type === 'timestampExtract' ? 'TimestampExtract' : filter.namedChildren.operator.constant;
                const selectedField = tableFields.find((field) => field.name === selectedFieldName);
                const availableFilterFields =
                  filterModel.type === 'timestampExtract'
                    ? tableFields.filter(
                        (field) =>
                          !hasTimestampExtractFilterForField(
                            userFilterModels,
                            filterModel.tableName,
                            field.name,
                            index,
                          ),
                      )
                    : tableFields;
                const binaryFilter =
                  filterModel.type === 'standard' && isBinaryAggregationFilter(filterModel.filter)
                    ? filterModel.filter
                    : undefined;
                const fuzzyMatchFilter =
                  filterModel.type === 'standard' &&
                  isComplexAggregationFilter(filterModel.filter) &&
                  isFuzzyMatchFilterOptionsAstNode(filterModel.filter.namedChildren.value)
                    ? (filterModel.filter as FuzzyMatchFilterAstNode)
                    : undefined;
                const inlineFilter = isComplexInlineFilter(filterModel) ? filterModel : undefined;
                const filterValue =
                  filterModel.type === 'standard'
                    ? getCustomerKpiFilterValue(filterModel.filter)
                    : { type: 'stringList' as const, values: [] };
                const isListFilter = selectedOperator === 'IsInList' || selectedOperator === 'IsNotInList';
                const enumValues =
                  filterModel.type === 'standard' &&
                  typeof selectedFieldName === 'string' &&
                  ['=', '!='].includes(selectedOperator ?? '')
                    ? getResolvedEnumValues(dataModel, tableName, selectedFieldName)
                    : undefined;
                const displayName =
                  fuzzyMatchFilter && !isUndefinedAstNode(fuzzyMatchFilter.namedChildren.value.namedChildren.value)
                    ? getAstNodeDisplayName(fuzzyMatchFilter.namedChildren.value, {
                        t: stringifyContextT,
                        language,
                        customLists,
                      })
                    : '...';

                return (
                  <div key={filter.id} className="grid grid-cols-subgrid col-span-full items-center">
                    <span className="text-right self-start pt-sm">
                      {t('client360:customer_kpis.form.filters.label')}
                    </span>
                    <div className="flex min-w-0 flex-col gap-sm">
                      <div
                        className={
                          filterModel.type === 'timestampExtract'
                            ? 'grid grid-cols-[minmax(0,1fr)_auto_auto_24px] items-center gap-sm'
                            : 'grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_24px] items-center gap-sm'
                        }
                      >
                        <FieldSelect
                          value={typeof selectedFieldName === 'string' ? selectedFieldName : ''}
                          fields={availableFilterFields}
                          onChange={(value) => {
                            const nextFilter: AggregationFilterEditModel =
                              filterModel.type === 'timestampExtract'
                                ? { ...filterModel, fieldName: value }
                                : {
                                    type: 'standard',
                                    filter: NewAggregatorFilterAstNode({
                                      namedChildren: {
                                        tableName: filterModel.filter.namedChildren.tableName,
                                        fieldName: NewConstantAstNode({ constant: value }),
                                        operator: NewConstantAstNode({ constant: null }),
                                        value: NewUndefinedAstNode(),
                                      },
                                    }),
                                  };
                            updateUserFilters(userFilterModels.with(index, nextFilter));
                          }}
                        />
                        <OperatorSelect
                          isFilter
                          operator={typeof selectedOperator === 'string' ? selectedOperator : ''}
                          options={aggregationFilterOperators.filter(
                            (operator) =>
                              !!selectedField &&
                              (aggregationFiltersWithTypes[operator]?.includes(
                                selectedField.dataType as PrimitiveTypes,
                              ) ??
                                false) &&
                              (operator !== 'TimestampExtract' ||
                                !hasTimestampExtractFilterForField(
                                  userFilterModels,
                                  tableName,
                                  selectedFieldName,
                                  index,
                                )),
                          )}
                          onOperatorChange={(operator) => {
                            if (!operator) return;
                            const sourceFilter = clone(filter);
                            if (filterModel.type === 'timestampExtract') {
                              sourceFilter.namedChildren.tableName.constant = filterModel.tableName;
                              sourceFilter.namedChildren.fieldName.constant = filterModel.fieldName;
                            }
                            const nextFilter =
                              operator === 'TimestampExtract'
                                ? createTimestampExtractEditModel(sourceFilter)
                                : createStandardFilterEditModel(sourceFilter, operator);
                            updateUserFilters(userFilterModels.with(index, nextFilter));
                          }}
                        />
                        {filterModel.type === 'timestampExtract' ? (
                          <TimestampExtractTimezoneLink />
                        ) : isUnaryAggregationFilter(filter) ? (
                          <span />
                        ) : binaryFilter && isListFilter ? (
                          <ListValueInput
                            value={typeof filterValue === 'string' ? { type: 'stringList', values: [] } : filterValue}
                            customLists={customLists}
                            onChange={(value) => {
                              const updatedFilter = clone(binaryFilter);
                              setCustomerKpiFilterValue(updatedFilter, value);
                              updateUserFilters(
                                userFilterModels.with(index, { type: 'standard', filter: updatedFilter }),
                              );
                            }}
                          />
                        ) : binaryFilter && selectedOperator ? (
                          <EditionAstBuilderOperand
                            node={binaryFilter.namedChildren.value}
                            onChange={(value) => {
                              if (!isKnownOperandAstNode(value)) return;
                              const updatedFilter = clone(binaryFilter);
                              updatedFilter.namedChildren.value = value;
                              updateUserFilters(
                                userFilterModels.with(index, { type: 'standard', filter: updatedFilter }),
                              );
                            }}
                            optionsDataType={(option) => {
                              return option.operandType !== 'Modeling' && option.dataType === selectedField?.dataType;
                            }}
                            enumValues={enumValues}
                          />
                        ) : fuzzyMatchFilter && selectedOperator ? (
                          <>
                            <Button
                              size="large"
                              type="button"
                              variant="secondary"
                              onClick={() => setEditedFilterIndex(index)}
                            >
                              {displayName}
                            </Button>
                            {editedFilterIndex === index ? (
                              <OperandEditModal
                                node={clone(fuzzyMatchFilter.namedChildren.value)}
                                onSave={(astNode) => {
                                  if (isFuzzyMatchFilterOptionsAstNode(astNode)) {
                                    const updatedFilter = clone(fuzzyMatchFilter);
                                    updatedFilter.namedChildren.value = astNode;
                                    updateUserFilters(
                                      userFilterModels.with(index, { type: 'standard', filter: updatedFilter }),
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
                        ) : (
                          <span />
                        )}
                        <Button
                          type="button"
                          mode="icon"
                          variant="secondary"
                          appearance="link"
                          onClick={() => updateUserFilters(userFilterModels.toSpliced(index, 1))}
                        >
                          <Icon icon="delete" className="size-4" />
                        </Button>
                      </div>
                      {inlineFilter ? (
                        <InlineFilterValue
                          filter={inlineFilter}
                          onChange={(nextFilter) => updateUserFilters(userFilterModels.with(index, nextFilter))}
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })}
              <Button
                type="button"
                size="small"
                variant="secondary"
                onClick={() => {
                  if (typeof tableName !== 'string') return;
                  updateUserFilters([
                    ...userFilterModels,
                    {
                      type: 'standard',
                      filter: NewAggregatorFilterAstNode({
                        namedChildren: {
                          tableName: NewConstantAstNode({ constant: tableName }),
                          fieldName: NewConstantAstNode({ constant: '' }),
                          operator: NewConstantAstNode({ constant: null }),
                          value: NewUndefinedAstNode(),
                        },
                      }),
                    },
                  ]);
                }}
              >
                {t('client360:customer_kpis.form.filters.add')}
              </Button>
            </>
          ) : null}
        </div>
      </div>
      <Popover.Footer>
        <Button type="button" variant="primary" appearance="stroked" size="medium" onClick={onClose}>
          {t('common:cancel')}
        </Button>
        <Button
          type="submit"
          size="medium"
          disabled={
            !canSubmit || createCustomerAggregateMutation.isPending || updateCustomerAggregateMutation.isPending
          }
        >
          {t('common:validate')}
        </Button>
      </Popover.Footer>
    </form>
  );
}

type FieldSelectProps = {
  value: string;
  fields: DataModelField[];
  onChange: (value: string) => void;
};

function FieldSelect({ value, fields, onChange }: FieldSelectProps) {
  const { t } = useTranslation(['client360']);

  return (
    <SelectV2
      placeholder={t('client360:customer_kpis.form.field.placeholder')}
      aria-label={t('client360:customer_kpis.form.field.placeholder')}
      value={value}
      options={fields.map((field) => ({
        label: () => {
          const icon = getDataTypeIcon(field.dataType);

          return (
            <div className="flex items-center gap-sm">
              {icon ? (
                <span className="bg-grey-background text-grey-secondary size-6 rounded-sm flex items-center justify-center">
                  <Icon icon={icon} className="size-4" />
                </span>
              ) : null}
              <span>{field.name}</span>
            </div>
          );
        },
        value: field.name,
      }))}
      onChange={onChange}
    />
  );
}
