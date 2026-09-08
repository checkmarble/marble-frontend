import {
  DataModelField,
  getDataTypeIcon,
  type DataModel,
  type NavigationOption,
  PrimitiveTypes,
} from '@app-builder/models';
import {
  type AggregationAstNode,
  type AggregationFilterAstNode,
  aggregationFilterOperators,
  aggregationFiltersWithTypes,
  isAggregation,
  isBinaryAggregationFilterOperator,
  isBinaryAggregationFilter,
  isComplexAggregationFilter,
  isFuzzyMatchFilterOptionsAstNode,
  isUnaryAggregationFilter,
  isUnaryAggregationFilterOperator,
  NewAggregatorAstNode,
  NewAggregatorFilterAstNode,
  NewFuzzyMatchFilterOptionsAstNode,
} from '@app-builder/models/astNode/aggregation';
import { adaptAstNode } from '@app-builder/models/astNode/ast-node';
import { type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { isConstant, NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { isCustomListAccess, NewCustomListAstNode } from '@app-builder/models/astNode/custom-list';
import {
  isDatabaseAccess,
  isPayload,
  NewDatabaseAccessAstNode,
  NewPayloadAstNode,
} from '@app-builder/models/astNode/data-accessor';
import { getOperatorName } from '@app-builder/models/get-operator-name';
import {
  AggregatorOperator,
  aggregatorOperators,
  isAggregatorOperator,
  supportedAggregatorsOperatorsTypes,
} from '@app-builder/models/modale-operators';
import { type StringListValue } from '@app-builder/models/scoring';
import { useCreateCustomerAggregateMutation } from '@app-builder/queries/customer-aggregates/create-customer-aggregate';
import { useCustomerAggregatesQuery } from '@app-builder/queries/customer-aggregates/get-customer-aggregates';
import { useUpdateCustomerAggregateMutation } from '@app-builder/queries/customer-aggregates/update-customer-aggregate';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { useGetCustomListsQuery } from '@app-builder/queries/get-custom-lists';
import { handleSubmit } from '@app-builder/utils/form';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { useForm, useSelector } from '@tanstack/react-form';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Card, Input, MenuCommand, Popover, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';
import { type CustomerAggregateDto } from 'marble-api';
import { OperatorSelect } from '../AstBuilder/edition/OperatorSelect';
import { ListValueInput } from '../UserScoring/SwitchNode/ListValueInput';
import { LinkedTablesSelect } from './LinkedTablesSelect';

const formSchema = z.object({
  label: z.string().nonempty(),
  tableName: z.string().nonempty(),
  navigationOptionId: z.string().nonempty(),
  functionName: z.string().nonempty(),
  fieldName: z.string().nonempty(),
  dateRange: z.string().nonempty(),
  filters: protectArray(
    z.array(
      z.object({
        left: z.string().nonempty(),
        op: z.string().nonempty(),
        right: z.union([
          z.string().nonempty(),
          z.union([
            z.object({ type: z.literal('customList'), listId: z.string() }),
            z.object({ type: z.literal('stringList'), values: z.array(z.string()) }),
          ]),
        ]),
      }),
    ),
  ),
});

type CaseKpisFormValues = {
  label: string;
  tableName: string;
  navigationOptionId: string;
  functionName: string;
  fieldName: string;
  dateRange: string;
  filters: { left: string; op: string; right: string | StringListValue }[];
};

function getEmptyCaseKpisFormValues(): CaseKpisFormValues {
  return {
    label: '',
    tableName: '',
    navigationOptionId: '',
    functionName: '',
    fieldName: '',
    dateRange: 'P1M',
    filters: [],
  };
}

function matchesPayloadFilter(
  filter: AggregationFilterAstNode | undefined,
  args: { tableName: string; fieldName: string; operator: string; payloadFieldName: string },
) {
  return (
    !!filter &&
    isBinaryAggregationFilter(filter) &&
    filter.namedChildren.tableName.constant === args.tableName &&
    filter.namedChildren.fieldName.constant === args.fieldName &&
    filter.namedChildren.operator.constant === args.operator &&
    isPayload(filter.namedChildren.value) &&
    filter.namedChildren.value.children[0]?.constant === args.payloadFieldName
  );
}

function adaptKpiFilterValue(node: KnownOperandAstNode): string | StringListValue | null {
  if (isDatabaseAccess(node)) {
    return node.namedChildren.path.constant.length === 0 ? node.namedChildren.fieldName.constant : null;
  }

  if (isCustomListAccess(node)) {
    return { type: 'customList', listId: node.namedChildren.customListId.constant };
  }

  if (isConstant(node) && Array.isArray(node.constant) && node.constant.every((value) => typeof value === 'string')) {
    return { type: 'stringList', values: node.constant };
  }

  return null;
}

function adaptKpiFilterToFormValue(filter: AggregationFilterAstNode): CaseKpisFormValues['filters'][number] | null {
  const { fieldName, operator } = filter.namedChildren;
  if (typeof fieldName.constant !== 'string' || typeof operator.constant !== 'string') return null;

  if (isUnaryAggregationFilter(filter)) {
    return { left: fieldName.constant, op: operator.constant, right: '' };
  }

  if (isBinaryAggregationFilter(filter)) {
    const right = adaptKpiFilterValue(filter.namedChildren.value);
    return right ? { left: fieldName.constant, op: operator.constant, right } : null;
  }

  if (isComplexAggregationFilter(filter) && isFuzzyMatchFilterOptionsAstNode(filter.namedChildren.value)) {
    const right = adaptKpiFilterValue(filter.namedChildren.value.namedChildren.value);
    return right ? { left: fieldName.constant, op: operator.constant, right } : null;
  }

  return null;
}

function adaptCustomerAggregateToCaseKpisFormValues(
  aggregate: CustomerAggregateDto,
  objectType: string,
  dataModel: DataModel,
): CaseKpisFormValues | null {
  const expression = adaptAstNode(aggregate.expression);
  if (!isAggregation(expression)) return null;

  const { aggregator, tableName, fieldName, filters } = expression.namedChildren;
  if (
    typeof aggregator.constant !== 'string' ||
    !isAggregatorOperator(aggregator.constant) ||
    typeof tableName.constant !== 'string' ||
    typeof fieldName.constant !== 'string'
  ) {
    return null;
  }

  const [customerFilter, startTimeFilter, endTimeFilter, ...userFilters] = filters.children;
  const navigationOption = dataModel
    .find((table) => table.name === objectType)
    ?.navigationOptions?.find(
      (option) =>
        option.targetTableName === tableName.constant &&
        matchesPayloadFilter(customerFilter, {
          tableName: tableName.constant,
          fieldName: option.filterFieldName,
          operator: '=',
          payloadFieldName: 'customer_id',
        }) &&
        matchesPayloadFilter(startTimeFilter, {
          tableName: tableName.constant,
          fieldName: option.orderingFieldName,
          operator: '>=',
          payloadFieldName: 'start_time',
        }) &&
        matchesPayloadFilter(endTimeFilter, {
          tableName: tableName.constant,
          fieldName: option.orderingFieldName,
          operator: '<',
          payloadFieldName: 'end_time',
        }),
    );
  const formFilters = userFilters.map(adaptKpiFilterToFormValue);

  if (!navigationOption || formFilters.some((filter) => filter === null)) return null;

  return {
    label: aggregate.name,
    tableName: tableName.constant,
    navigationOptionId: navigationOption.id,
    functionName: aggregator.constant,
    fieldName: fieldName.constant,
    dateRange: aggregate.time_slice,
    filters: formFilters.filter((filter): filter is CaseKpisFormValues['filters'][number] => filter !== null),
  };
}

function createFilterValue(tableName: string, value: string | StringListValue): KnownOperandAstNode {
  if (typeof value === 'string') {
    return NewDatabaseAccessAstNode({ tableName, fieldName: value, path: [] });
  }

  if (value.type === 'customList') {
    return NewCustomListAstNode(value.listId);
  }

  return NewConstantAstNode({ constant: value.values });
}

function createDateRangeFilters(tableName: string, fieldName: string): AggregationFilterAstNode[] {
  return [
    NewAggregatorFilterAstNode({
      namedChildren: {
        tableName: NewConstantAstNode({ constant: tableName }),
        fieldName: NewConstantAstNode({ constant: fieldName }),
        operator: NewConstantAstNode({ constant: '>=' }),
        value: NewPayloadAstNode('start_time'),
      },
    }),
    NewAggregatorFilterAstNode({
      namedChildren: {
        tableName: NewConstantAstNode({ constant: tableName }),
        fieldName: NewConstantAstNode({ constant: fieldName }),
        operator: NewConstantAstNode({ constant: '<' }),
        value: NewPayloadAstNode('end_time'),
      },
    }),
  ];
}

function createAggregationFilter(
  tableName: string,
  filter: CaseKpisFormValues['filters'][number],
): AggregationFilterAstNode | null {
  if (isUnaryAggregationFilterOperator(filter.op)) {
    return NewAggregatorFilterAstNode({
      namedChildren: {
        tableName: NewConstantAstNode({ constant: tableName }),
        fieldName: NewConstantAstNode({ constant: filter.left }),
        operator: NewConstantAstNode({ constant: filter.op }),
      },
    });
  }

  const value = createFilterValue(tableName, filter.right);
  if (isBinaryAggregationFilterOperator(filter.op)) {
    return NewAggregatorFilterAstNode({
      namedChildren: {
        tableName: NewConstantAstNode({ constant: tableName }),
        fieldName: NewConstantAstNode({ constant: filter.left }),
        operator: NewConstantAstNode({ constant: filter.op }),
        value,
      },
    });
  }

  if (filter.op === 'FuzzyMatch') {
    return NewAggregatorFilterAstNode({
      namedChildren: {
        tableName: NewConstantAstNode({ constant: tableName }),
        fieldName: NewConstantAstNode({ constant: filter.left }),
        operator: NewConstantAstNode({ constant: filter.op }),
        value: NewFuzzyMatchFilterOptionsAstNode({ value }),
      },
    });
  }

  return null;
}

function buildKpiAggregationAstNode(
  value: CaseKpisFormValues,
  mainTimestampFieldName: string | undefined,
  objectType: string,
  navigationOption: NavigationOption | undefined,
): AggregationAstNode | null {
  if (
    !isAggregatorOperator(value.functionName) ||
    !navigationOption ||
    navigationOption.sourceTableName !== objectType ||
    navigationOption.targetTableName !== value.tableName
  ) {
    return null;
  }

  const node = NewAggregatorAstNode(value.functionName);
  node.namedChildren.tableName.constant = value.tableName;
  node.namedChildren.fieldName.constant = value.fieldName;
  node.namedChildren.label.constant = value.label;

  const objectFilter = NewAggregatorFilterAstNode({
    namedChildren: {
      tableName: NewConstantAstNode({ constant: value.tableName }),
      fieldName: NewConstantAstNode({ constant: navigationOption.filterFieldName }),
      operator: NewConstantAstNode({ constant: '=' }),
      value: NewPayloadAstNode('customer_id'),
    },
  });
  const dateRangeFilters = createDateRangeFilters(value.tableName, navigationOption.orderingFieldName);
  const filters = value.filters
    .map((filter) => createAggregationFilter(value.tableName, filter))
    .filter((filter): filter is AggregationFilterAstNode => filter !== null);

  node.namedChildren.filters.children = [objectFilter, ...(dateRangeFilters ? dateRangeFilters : []), ...filters];

  return node;
}

type CaseKpisProps = {
  objectId: string;
  objectType: string;
};

type AggregateMetrics = {
  current: number;
  percentageChange: number | null;
};

function CaseKpisConfigurationCard({ variant, onOpen }: { variant: 'empty' | 'add'; onOpen: () => void }) {
  const { t } = useTranslation(['cases']);

  return (
    <Card className="flex min-h-36 flex-col items-center justify-center gap-sm rounded-lg text-center">
      <span className="text-small text-grey-secondary">
        {match(variant)
          .with('empty', () => t('cases:case_detail.kpis.empty_state'))
          .with('add', () => t('cases:case_detail.kpis.add_state'))
          .exhaustive()}
      </span>
      <Popover.Trigger asChild>
        {match(variant)
          .with('empty', () => <Button onClick={onOpen}>{t('cases:case_detail.kpis.configure')}</Button>)
          .with('add', () => (
            <Button variant="primary" appearance="stroked" onClick={onOpen}>
              {t('cases:case_detail.kpis.create')}
            </Button>
          ))
          .exhaustive()}
      </Popover.Trigger>
    </Card>
  );
}

function getAggregateMetrics(results: { value: number }[] | undefined): AggregateMetrics | null {
  return match(results)
    .when(
      (values): values is [{ value: number }, { value: number }] => values?.length === 2,
      ([current, previous]) => ({
        current: current.value,
        percentageChange: match(previous.value)
          .with(0, () => null)
          .otherwise(() => ((current.value - previous.value) / previous.value) * 100),
      }),
    )
    .otherwise(() => null);
}

function formatMetric(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
}

function formatPercentage(value: number) {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Math.abs(value))}%`;
}

export function CaseKpis({ objectId, objectType }: CaseKpisProps) {
  const { t } = useTranslation(['common', 'cases']);
  const [open, setOpen] = useState(false);
  const [editingAggregate, setEditingAggregate] = useState<CustomerAggregateDto | null>(null);
  const customerAggregatesQuery = useCustomerAggregatesQuery(objectType, objectId);

  function closeConfiguration() {
    setOpen(false);
    setEditingAggregate(null);
  }

  return match(customerAggregatesQuery)
    .with({ isPending: true }, () => (
      <Card aria-label="Loading KPIs" className="min-h-23.5 animate-pulse bg-grey-background" />
    ))
    .with({ isError: true }, () => (
      <Card className="flex min-h-23.5 flex-col items-center justify-center gap-sm text-center">
        <span className="text-small text-grey-secondary">{t('common:generic_fetch_data_error')}</span>
        <Button size="small" variant="secondary" onClick={() => customerAggregatesQuery.refetch()}>
          {t('common:retry')}
        </Button>
      </Card>
    ))
    .with({ isSuccess: true }, ({ data }) => (
      <Popover.Root
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setEditingAggregate(null);
        }}
      >
        {match(data)
          .with([], () => (
            <Popover.Anchor>
              <CaseKpisConfigurationCard variant="empty" onOpen={() => setEditingAggregate(null)} />
            </Popover.Anchor>
          ))
          .otherwise((aggregates) => (
            <Popover.Anchor>
              <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 xl:grid-cols-3">
                {aggregates.map((aggregate) => {
                  const metrics = getAggregateMetrics(aggregate.results);

                  return (
                    <Card key={aggregate.id} className="flex min-h-36 flex-col gap-xs rounded-lg p-md">
                      <div className="flex items-start gap-sm">
                        <span className="min-w-0 flex-1 text-small text-grey-secondary">{aggregate.name}</span>
                        <MenuCommand.Menu>
                          <MenuCommand.Trigger>
                            <Button
                              aria-label={t('common:actions')}
                              variant="secondary"
                              appearance="link"
                              mode="icon"
                              size="small"
                            >
                              <Icon aria-hidden="true" icon="dots-three" className="size-4" />
                            </Button>
                          </MenuCommand.Trigger>
                          <MenuCommand.Content align="end" sideOffset={4} size="small">
                            <MenuCommand.List>
                              <MenuCommand.Item
                                onSelect={() => {
                                  setEditingAggregate(aggregate);
                                  setOpen(true);
                                }}
                              >
                                <Icon icon="edit" className="size-4" />
                                {t('common:edit')}
                              </MenuCommand.Item>
                            </MenuCommand.List>
                          </MenuCommand.Content>
                        </MenuCommand.Menu>
                      </div>
                      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-xs">
                        {match(metrics)
                          .with(null, () => null)
                          .otherwise(({ current, percentageChange }) => (
                            <>
                              <span className="text-default font-medium tabular-nums">{formatMetric(current)}</span>
                              {match(percentageChange)
                                .with(null, () => null)
                                .otherwise((change) =>
                                  match(change)
                                    .when(
                                      (value) => value < 0,
                                      () => (
                                        <div className="flex items-center text-small font-medium text-red-primary">
                                          <Icon
                                            aria-hidden="true"
                                            icon="arrow-2-up"
                                            className="size-6 -me-xs rotate-180"
                                          />
                                          <span>{formatPercentage(change)}</span>
                                        </div>
                                      ),
                                    )
                                    .when(
                                      (value) => value > 0,
                                      () => (
                                        <div className="flex items-center text-small font-medium text-green-primary">
                                          <Icon aria-hidden="true" icon="arrow-2-up" className="size-6 -me-xs" />
                                          <span>{formatPercentage(change)}</span>
                                        </div>
                                      ),
                                    )
                                    .otherwise(() => (
                                      <span className="text-small font-medium text-grey-secondary">0%</span>
                                    )),
                                )}
                            </>
                          ))}
                      </div>
                    </Card>
                  );
                })}
                {match(aggregates.length)
                  .when(
                    (count) => count < 3,
                    () => <CaseKpisConfigurationCard variant="add" onOpen={() => setEditingAggregate(null)} />,
                  )
                  .otherwise(() => null)}
              </div>
            </Popover.Anchor>
          ))}
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={4}
          collisionPadding={10}
          className="w-radix-popover-trigger rounded-lg"
        >
          <CaseKpisPopover
            key={editingAggregate?.id ?? 'create'}
            objectId={objectId}
            objectType={objectType}
            aggregate={editingAggregate}
            onClose={closeConfiguration}
          />
        </Popover.Content>
      </Popover.Root>
    ))
    .exhaustive();
}

type CaseKpisPopoverProps = CaseKpisProps & {
  aggregate: CustomerAggregateDto | null;
  onClose: () => void;
};

function CaseKpisPopover({ objectId, objectType, aggregate, onClose }: CaseKpisPopoverProps) {
  const { t } = useTranslation(['common', 'cases']);
  const createCustomerAggregateMutation = useCreateCustomerAggregateMutation();
  const updateCustomerAggregateMutation = useUpdateCustomerAggregateMutation();
  const dataModelQuery = useDataModelQuery();
  const formValues =
    (aggregate && dataModelQuery.data
      ? adaptCustomerAggregateToCaseKpisFormValues(aggregate, objectType, dataModelQuery.data.dataModel)
      : null) ?? getEmptyCaseKpisFormValues();
  const form = useForm({
    defaultValues: formValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const navigationOption = dataModelQuery.data?.dataModel
        .find((table) => table.name === objectType)
        ?.navigationOptions?.find((option) => option.id === value.navigationOptionId);
      const aggregationNode = buildKpiAggregationAstNode(
        value,
        table?.mainTimestampFieldName,
        objectType,
        navigationOption,
      );
      if (!aggregationNode) return;

      try {
        await match(aggregate)
          .with(null, () =>
            createCustomerAggregateMutation.mutateAsync({
              recordType: objectType,
              customerId: objectId,
              name: value.label,
              timeSlice: value.dateRange,
              expression: aggregationNode,
            }),
          )
          .otherwise((selectedAggregate) =>
            updateCustomerAggregateMutation.mutateAsync({
              recordType: objectType,
              aggregateId: selectedAggregate.id,
              customerId: objectId,
              name: value.label,
              timeSlice: value.dateRange,
              expression: aggregationNode,
            }),
          );
        onClose();
      } catch {
        toast.error(t('common:errors.unknown'));
      }
    },
  });

  useEffect(() => {
    form.reset(formValues);
  }, [aggregate?.id, dataModelQuery.data]);

  const tableName = useSelector(form.baseStore, (s) => s.values.tableName);
  const funcName = useSelector(form.baseStore, (s) => s.values.functionName);
  const fieldName = useSelector(form.baseStore, (s) => s.values.fieldName);
  const navigationOptionId = useSelector(form.baseStore, (s) => s.values.navigationOptionId);
  const customListsQuery = useGetCustomListsQuery();

  const showFunctionRow = !!tableName;
  const showFieldNameField = !!funcName;
  const showFiltersRows = !!funcName && !!fieldName;

  const table = dataModelQuery.data?.dataModel.find((t) => t.name === tableName);
  const tableFields = table?.fields ?? null;

  const availableOperators = aggregatorOperators.filter((op) => {
    const supportedTypeInfos = supportedAggregatorsOperatorsTypes[op];
    return tableFields?.some((f) => supportedTypeInfos.includes(f.dataType as PrimitiveTypes)) ?? false;
  });
  const availableFields =
    tableFields?.filter((field) => {
      const supportedTypeInfos = supportedAggregatorsOperatorsTypes[funcName as AggregatorOperator];
      return supportedTypeInfos?.includes(field.dataType as PrimitiveTypes) ?? false;
    }) ?? [];
  const currentNavigationOption = dataModelQuery.data?.dataModel
    .find((table) => table.name === objectType)
    ?.navigationOptions?.find((option) => option.id === navigationOptionId);

  return (
    <form className="contents" onSubmit={handleSubmit(form)}>
      <div className="flex flex-col gap-md p-md">
        <div className="flex items-center justify-between gap-sm">
          <div className="flex min-w-0 items-center gap-sm">
            <span className="text-default font-medium">{t('cases:case_detail.kpis.configuration')}</span>
            <div className="flex items-center gap-xs">
              <span className="rounded-sm border border-grey-border bg-surface-card p-xs font-mono text-2xs">
                {t('cases:case_detail.kpis.client_filter', { objectId, objectType })}
              </span>
              <Icon aria-hidden="true" icon="tip" className="text-grey-secondary size-4" />
            </div>
          </div>
          <Icon aria-hidden="true" icon="delete" className="text-grey-secondary size-4 shrink-0" />
        </div>
        <div className="grid grid-cols-[--spacing(30)_1fr] gap-x-sm gap-y-md">
          {/* Name */}
          <div className="grid grid-cols-subgrid col-span-full items-center">
            <span className="text-right">The indicator named</span>
            <form.Field name="label">
              {(field) => (
                <Input value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
              )}
            </form.Field>
          </div>
          {/* Table */}
          <div className="grid grid-cols-subgrid col-span-full items-center">
            <span className="text-right">and is based on</span>
            <div className="max-w-75">
              <form.Field name="tableName">
                {(field) => (
                  <LinkedTablesSelect
                    objectType={objectType}
                    value={field.state.value}
                    onChange={(selectedTableName, navigationOption) => {
                      field.handleChange(selectedTableName);
                      form.setFieldValue('navigationOptionId', navigationOption.id);
                    }}
                  />
                )}
              </form.Field>
            </div>
          </div>
          {/* Function */}
          {showFunctionRow ? (
            <div className="grid grid-cols-subgrid col-span-full items-center">
              <span className="text-right">looking for</span>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-sm items-center">
                <form.Field name="functionName">
                  {(field) => (
                    <SelectV2
                      placeholder="Select function..."
                      value={field.state.value}
                      options={availableOperators.map((op) => ({ label: getOperatorName(t, op, false), value: op }))}
                      onChange={field.handleChange}
                      displayedValue={(option) => (
                        <div className="flex items-center gap-sm">
                          <span className="bg-grey-background text-grey-secondary size-6 rounded-sm flex items-center justify-center">
                            <Icon icon="function" className="size-4" />
                          </span>
                          <span>{option.label}</span>
                        </div>
                      )}
                    />
                  )}
                </form.Field>
                {showFieldNameField ? (
                  <>
                    <span className="text-center">of</span>
                    <form.Field name="fieldName">
                      {(field) => (
                        <FieldSelect value={field.state.value} fields={availableFields} onChange={field.handleChange} />
                      )}
                    </form.Field>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
          {/* Date range filter */}
          {showFiltersRows ? (
            <>
              <div className="grid grid-cols-subgrid col-span-full items-center">
                <span className="text-right">during the</span>
                <div className="max-w-75">
                  <form.Field name="dateRange">
                    {(field) => (
                      <SelectV2
                        placeholder="Select a date range..."
                        value={field.state.value}
                        options={[
                          { label: 'Last 24h', value: 'P1D' }, // Now - 24h
                          { label: 'Last week', value: 'P1W' }, // Now - 7d
                          { label: 'Last month', value: 'P1M' }, // Now - 30d
                          { label: 'Last 2 months', value: 'P2M' }, // Now - 60d
                          { label: 'Last 6 months', value: 'P6M' }, // Now - 183d
                          { label: 'Last year', value: 'P1Y' }, // Now - 365d
                        ]}
                        onChange={field.handleChange}
                        displayedValue={(o) => {
                          return (
                            <span>
                              {o.label}{' '}
                              {currentNavigationOption ? (
                                <span className="text-grey-secondary text-tiny">
                                  ({currentNavigationOption?.orderingFieldName})
                                </span>
                              ) : null}
                            </span>
                          );
                        }}
                      />
                    )}
                  </form.Field>
                </div>
              </div>
              <form.Field name="filters" mode="array">
                {(field) => (
                  <>
                    {field.state.value.map((_, i) => (
                      <div key={i} className="grid grid-cols-subgrid col-span-full items-center">
                        <span className="text-right">where</span>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_24px] gap-sm items-center">
                          <form.Field name={`filters[${i}].left`}>
                            {(leftField) => (
                              <FieldSelect
                                value={leftField.state.value}
                                fields={tableFields ?? []}
                                onChange={leftField.handleChange}
                              />
                            )}
                          </form.Field>
                          <form.Field name={`filters[${i}].op`}>
                            {(opField) => (
                              <form.Subscribe selector={(state) => state.values.filters[i]?.left}>
                                {(leftFieldName) => {
                                  if (!leftFieldName) {
                                    return null;
                                  }

                                  const currentField = tableFields?.find((f) => f.name === leftFieldName);

                                  return (
                                    <OperatorSelect
                                      operator={opField.state.value}
                                      options={aggregationFilterOperators.filter(
                                        (op) =>
                                          !!currentField &&
                                          (aggregationFiltersWithTypes[op]?.includes(
                                            currentField.dataType as PrimitiveTypes,
                                          ) ??
                                            false),
                                      )}
                                      onOperatorChange={opField.handleChange}
                                    />
                                  );
                                }}
                              </form.Subscribe>
                            )}
                          </form.Field>
                          <form.Field name={`filters[${i}].right`}>
                            {(rightField) => (
                              <form.Subscribe
                                selector={(state) => [state.values.filters[i]?.left, state.values.filters[i]?.op]}
                              >
                                {([leftFieldName, operator]) => {
                                  if (!leftFieldName || !operator) {
                                    return null;
                                  }

                                  const currentField = tableFields?.find((f) => f.name === leftFieldName);

                                  return operator === 'IsInList' ? (
                                    <ListValueInput
                                      value={rightField.state.value as StringListValue}
                                      customLists={customListsQuery.data ?? []}
                                      onChange={rightField.handleChange}
                                    />
                                  ) : (
                                    <FieldSelect
                                      value={rightField.state.value as string}
                                      fields={tableFields?.filter((f) => f.dataType === currentField?.dataType) ?? []}
                                      onChange={rightField.handleChange}
                                    />
                                  );
                                }}
                              </form.Subscribe>
                            )}
                          </form.Field>
                          <Button mode="icon" variant="secondary" appearance="link">
                            <Icon icon="delete" className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => {
                        field.pushValue({ left: '', op: '', right: '' });
                      }}
                    >
                      Add filter
                    </Button>
                  </>
                )}
              </form.Field>
            </>
          ) : null}
        </div>
      </div>
      <Popover.Footer>
        <Button type="button" variant="primary" appearance="stroked" size="medium" onClick={() => onClose()}>
          {t('common:cancel')}
        </Button>
        <Button
          type="submit"
          size="medium"
          disabled={createCustomerAggregateMutation.isPending || updateCustomerAggregateMutation.isPending}
        >
          {t('common:validate')}
        </Button>
      </Popover.Footer>
    </form>
  );
}

const FieldSelect = ({
  value,
  fields,
  onChange,
}: {
  value: string;
  fields: DataModelField[];
  onChange: (value: string) => void;
}) => {
  return (
    <SelectV2
      placeholder="Select field..."
      value={value}
      options={fields.map((f) => ({
        label: () => {
          const icon = getDataTypeIcon(f.dataType);
          return (
            <div className="flex items-center gap-sm">
              {icon ? (
                <span className="bg-grey-background text-grey-secondary size-6 rounded-sm flex items-center justify-center">
                  <Icon icon={icon} className="size-4" />
                </span>
              ) : null}
              <span>{f.name}</span>
            </div>
          );
        },
        value: f.name,
      }))}
      onChange={onChange}
    />
  );
};
