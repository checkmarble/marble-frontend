import { type DataModel, type NavigationOption, type PrimitiveTypes } from '@app-builder/models';
import {
  type AggregationAstNode,
  type AggregationFilterAstNode,
  type AggregationFilterOperator,
  aggregationFilterOperators,
  aggregationFiltersWithTypes,
  type BinaryAggregationFilterAstNode,
  type BinaryAggregationFilterOperator,
  type ComplexAggregationFilterAstNode,
  isAggregation,
  isBinaryAggregationFilter,
  isBinaryAggregationFilterOperator,
  isComplexAggregationFilter,
  isFuzzyMatchFilterOptionsAstNode,
  isUnaryAggregationFilter,
  isUnaryAggregationFilterOperator,
  NewAggregatorAstNode,
  NewAggregatorFilterAstNode,
  NewFuzzyMatchFilterOptionsAstNode,
  type UnaryAggregationFilterAstNode,
} from '@app-builder/models/astNode/aggregation';
import { adaptAstNode, NewUndefinedAstNode } from '@app-builder/models/astNode/ast-node';
import { type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { isConstant, NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { isCustomListAccess, NewCustomListAstNode } from '@app-builder/models/astNode/custom-list';
import {
  isDatabaseAccess,
  isPayload,
  NewDatabaseAccessAstNode,
  NewPayloadAstNode,
} from '@app-builder/models/astNode/data-accessor';
import { isAggregatorOperator, supportedAggregatorsOperatorsTypes } from '@app-builder/models/modale-operators';
import { type StringListValue } from '@app-builder/models/scoring';
import { type CustomerAggregateDto } from 'marble-api';

type CustomerKpiFilterValue = string | StringListValue;

function createPayloadFilter(
  tableName: string,
  fieldName: string,
  operator: BinaryAggregationFilterOperator,
  payloadFieldName: string,
) {
  return NewAggregatorFilterAstNode({
    namedChildren: {
      tableName: NewConstantAstNode({ constant: tableName }),
      fieldName: NewConstantAstNode({ constant: fieldName }),
      operator: NewConstantAstNode({ constant: operator }),
      value: NewPayloadAstNode(payloadFieldName),
    },
  });
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

function createFilterValue(tableName: string, value: CustomerKpiFilterValue): KnownOperandAstNode {
  if (typeof value === 'string') {
    return NewDatabaseAccessAstNode({ tableName, fieldName: value, path: [] });
  }

  if (value.type === 'customList') {
    return NewCustomListAstNode(value.listId);
  }

  return NewConstantAstNode({ constant: value.values });
}

function isCompleteFilterValue(node: KnownOperandAstNode) {
  if (isDatabaseAccess(node)) {
    return node.namedChildren.path.constant.length === 0 && !!node.namedChildren.fieldName.constant;
  }

  if (isCustomListAccess(node)) {
    return !!node.namedChildren.customListId.constant;
  }

  return isConstant(node) && Array.isArray(node.constant) && node.constant.length > 0;
}

function getFilterValue(node: KnownOperandAstNode): CustomerKpiFilterValue {
  if (isDatabaseAccess(node)) {
    return node.namedChildren.path.constant.length === 0 ? node.namedChildren.fieldName.constant : '';
  }

  if (isCustomListAccess(node)) {
    return { type: 'customList', listId: node.namedChildren.customListId.constant };
  }

  if (isConstant(node) && Array.isArray(node.constant) && node.constant.every((value) => typeof value === 'string')) {
    return { type: 'stringList', values: node.constant };
  }

  return { type: 'stringList', values: [] };
}

function getFilterOperand(filter: AggregationFilterAstNode) {
  if (isBinaryAggregationFilter(filter)) return filter.namedChildren.value;
  if (isComplexAggregationFilter(filter) && isFuzzyMatchFilterOptionsAstNode(filter.namedChildren.value)) {
    return filter.namedChildren.value.namedChildren.value;
  }
  return NewUndefinedAstNode();
}

export function createCustomerKpiAggregation(): AggregationAstNode {
  const node = NewAggregatorAstNode('AVG');
  node.namedChildren.label.constant = '';
  node.namedChildren.tableName.constant = '';
  node.namedChildren.fieldName.constant = '';
  node.namedChildren.filters.children = [];
  return node;
}

export function getCustomerKpiAggregation(aggregate: CustomerAggregateDto | null): AggregationAstNode {
  if (aggregate) {
    const expression = adaptAstNode(aggregate.expression);
    if (isAggregation(expression)) return expression;
  }

  return createCustomerKpiAggregation();
}

export function getCustomerKpiNavigationOption(
  node: AggregationAstNode,
  objectType: string,
  dataModel: DataModel,
): NavigationOption | null {
  const tableName = node.namedChildren.tableName.constant;
  if (typeof tableName !== 'string') return null;

  const [customerFilter, startTimeFilter, endTimeFilter] = node.namedChildren.filters.children;
  return (
    dataModel
      .find((table) => table.name === objectType)
      ?.navigationOptions?.find(
        (option) =>
          option.targetTableName === tableName &&
          matchesPayloadFilter(customerFilter, {
            tableName,
            fieldName: option.filterFieldName,
            operator: '=',
            payloadFieldName: 'customer_id',
          }) &&
          matchesPayloadFilter(startTimeFilter, {
            tableName,
            fieldName: option.orderingFieldName,
            operator: '>=',
            payloadFieldName: 'start_time',
          }) &&
          matchesPayloadFilter(endTimeFilter, {
            tableName,
            fieldName: option.orderingFieldName,
            operator: '<',
            payloadFieldName: 'end_time',
          }),
      ) ?? null
  );
}

export function setCustomerKpiNavigationOption(node: AggregationAstNode, navigationOption: NavigationOption) {
  const userFilters = node.namedChildren.filters.children.slice(3);
  const tableName = navigationOption.targetTableName;

  node.namedChildren.tableName.constant = tableName;
  node.namedChildren.fieldName.constant = '';
  node.namedChildren.filters.children = [
    createPayloadFilter(tableName, navigationOption.filterFieldName, '=', 'customer_id'),
    createPayloadFilter(tableName, navigationOption.orderingFieldName, '>=', 'start_time'),
    createPayloadFilter(tableName, navigationOption.orderingFieldName, '<', 'end_time'),
    ...userFilters.map((filter) => {
      filter.namedChildren.tableName.constant = tableName;
      return filter;
    }),
  ];
}

export function addCustomerKpiFilter(node: AggregationAstNode) {
  const tableName = node.namedChildren.tableName.constant;
  if (typeof tableName !== 'string' || !tableName) return;

  node.namedChildren.filters.children.push(
    NewAggregatorFilterAstNode({
      namedChildren: {
        tableName: NewConstantAstNode({ constant: tableName }),
        fieldName: NewConstantAstNode({ constant: '' }),
        operator: NewConstantAstNode({ constant: null }),
        value: NewUndefinedAstNode(),
      },
    }),
  );
}

export function setCustomerKpiFilterField(node: AggregationAstNode, index: number, fieldName: string) {
  const filter = node.namedChildren.filters.children[index + 3];
  const tableName = filter?.namedChildren.tableName.constant;
  if (typeof tableName !== 'string') return;

  node.namedChildren.filters.children[index + 3] = NewAggregatorFilterAstNode({
    namedChildren: {
      tableName: NewConstantAstNode({ constant: tableName }),
      fieldName: NewConstantAstNode({ constant: fieldName }),
      operator: NewConstantAstNode({ constant: null }),
      value: NewUndefinedAstNode(),
    },
  });
}

export function removeCustomerKpiFilter(node: AggregationAstNode, index: number) {
  node.namedChildren.filters.children.splice(index + 3, 1);
}

export function setCustomerKpiFilterOperator(filter: AggregationFilterAstNode, operator: AggregationFilterOperator) {
  const value = getFilterOperand(filter);

  if (isUnaryAggregationFilterOperator(operator)) {
    (filter as UnaryAggregationFilterAstNode).namedChildren = {
      tableName: filter.namedChildren.tableName,
      fieldName: filter.namedChildren.fieldName,
      operator: NewConstantAstNode({ constant: operator }),
    };
    return;
  }

  if (isBinaryAggregationFilterOperator(operator)) {
    (filter as BinaryAggregationFilterAstNode).namedChildren = {
      tableName: filter.namedChildren.tableName,
      fieldName: filter.namedChildren.fieldName,
      operator: NewConstantAstNode({ constant: operator }),
      value,
    };
    return;
  }

  (filter as ComplexAggregationFilterAstNode).namedChildren = {
    tableName: filter.namedChildren.tableName,
    fieldName: filter.namedChildren.fieldName,
    operator: NewConstantAstNode({ constant: operator }),
    value: NewFuzzyMatchFilterOptionsAstNode({ value }),
  };
}

export function setCustomerKpiFilterValue(filter: AggregationFilterAstNode, value: CustomerKpiFilterValue) {
  const tableName = filter.namedChildren.tableName.constant;
  if (typeof tableName !== 'string') return;

  const valueNode = createFilterValue(tableName, value);
  if (isBinaryAggregationFilter(filter)) {
    filter.namedChildren.value = valueNode;
  } else if (isComplexAggregationFilter(filter) && isFuzzyMatchFilterOptionsAstNode(filter.namedChildren.value)) {
    filter.namedChildren.value.namedChildren.value = valueNode;
  }
}

export function getCustomerKpiFilterValue(filter: AggregationFilterAstNode): CustomerKpiFilterValue {
  const value = getFilterOperand(filter);
  return value.name === 'Undefined' ? { type: 'stringList', values: [] } : getFilterValue(value as KnownOperandAstNode);
}

export function isCustomerKpiAggregationComplete(node: AggregationAstNode, objectType: string, dataModel: DataModel) {
  const { aggregator, tableName, fieldName, label, filters } = node.namedChildren;
  if (
    typeof aggregator.constant !== 'string' ||
    !isAggregatorOperator(aggregator.constant) ||
    typeof tableName.constant !== 'string' ||
    !tableName.constant ||
    typeof fieldName.constant !== 'string' ||
    !fieldName.constant ||
    typeof label.constant !== 'string' ||
    !label.constant.trim() ||
    !getCustomerKpiNavigationOption(node, objectType, dataModel)
  ) {
    return false;
  }

  const table = dataModel.find((dataModelTable) => dataModelTable.name === tableName.constant);
  const aggregatedField = table?.fields.find((field) => field.name === fieldName.constant);
  if (
    !aggregatedField ||
    !supportedAggregatorsOperatorsTypes[aggregator.constant].includes(aggregatedField.dataType as PrimitiveTypes)
  ) {
    return false;
  }

  return filters.children.slice(3).every((filter) => {
    const field = filter.namedChildren.fieldName.constant;
    const operator = filter.namedChildren.operator.constant;
    if (typeof field !== 'string' || !field || typeof operator !== 'string' || !operator) return false;
    if (!(aggregationFilterOperators as readonly string[]).includes(operator)) return false;

    const filterField = table?.fields.find((dataModelField) => dataModelField.name === field);
    if (
      !filterField ||
      !aggregationFiltersWithTypes[operator as AggregationFilterOperator].includes(
        filterField.dataType as PrimitiveTypes,
      )
    ) {
      return false;
    }
    if (isUnaryAggregationFilter(filter)) return true;

    const value = getFilterOperand(filter);
    return value.name !== 'Undefined' && isCompleteFilterValue(value as KnownOperandAstNode);
  });
}
