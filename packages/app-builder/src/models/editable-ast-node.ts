import { type ParseKeys, type TFunction } from 'i18next';
import { type CustomList } from 'marble-api';
import * as R from 'remeda';
import { Temporal } from 'temporal-polyfill';
import { type IconName } from 'ui-icons';

import {
  type AggregationAstNode,
  type AstNode,
  type ConstantAstNode,
  type ConstantType,
  type CustomListAccessAstNode,
  type DatabaseAccessAstNode,
  isAggregation,
  isConstant,
  isCustomListAccess,
  isDatabaseAccess,
  isPayload,
  isTimeAdd,
  isTimeNow,
  isUndefinedAstNode,
  NewCustomListAstNode,
  NewTimeAddAstNode,
  NewTimeNowAstNode,
  NewUndefinedAstNode,
  type PayloadAstNode,
  type TimeAddAstNode,
  type TimeNowAstNode,
  type UndefinedAstNode,
} from './ast-node';
import {
  type DataModelField,
  type DataType,
  type EnumValue,
  findDataModelField,
  findDataModelTable,
  type TableModel,
} from './data-model';
import { getOperatorName, isAggregatorOperator } from './editable-operators';

export type OperandType =
  | 'Constant'
  | 'CustomList'
  | 'Enum'
  | 'Field'
  | 'Function'
  | 'Undefined'
  | 'unknown';

export function getOperandTypeIcon(
  operandType: OperandType,
): IconName | undefined {
  switch (operandType) {
    case 'CustomList':
      return 'list';
    case 'Field':
      return 'field';
    case 'Function':
      return 'function';
    case 'Enum':
      return 'enum';
    default:
      return undefined;
  }
}

export function getOperandTypeTKey(
  operandType: OperandType,
): ParseKeys<'scenarios'> | undefined {
  switch (operandType) {
    case 'CustomList':
      return 'edit_operand.operator_type.list';
    case 'Field':
      return 'edit_operand.operator_type.field';
    case 'Function':
      return 'edit_operand.operator_type.function';
    case 'Enum':
      return 'edit_operand.operator_type.enum';
    default:
      return undefined;
  }
}

interface EditableAstNodeBase {
  astNode: AstNode;
  operandType: OperandType;
  dataType: DataType;
  displayName: string;
}

type TFunctionDisplayName = TFunction<['common', 'scenarios'], undefined>;

export class ConstantEditableAstNode implements EditableAstNodeBase {
  astNode: ConstantAstNode;
  operandType: OperandType;
  dataType: DataType;
  displayName: string;

  constructor(
    t: TFunctionDisplayName,
    astNode: ConstantAstNode,
    enumOptions: EnumValue[],
  ) {
    this.astNode = astNode;
    this.operandType = ConstantEditableAstNode.getOperandType(
      astNode.constant,
      enumOptions,
    );
    this.dataType = ConstantEditableAstNode.getDataType(astNode.constant);
    this.displayName = ConstantEditableAstNode.getConstantDisplayName(
      t,
      astNode.constant,
    );
  }

  private static getOperandType(
    this: void,
    constant: ConstantType,
    enumOptions: EnumValue[],
  ): OperandType {
    if (
      (typeof constant === 'string' || typeof constant === 'number') &&
      enumOptions.includes(constant)
    ) {
      return 'Enum' as const;
    }
    return 'Constant' as const;
  }

  private static getDataType(this: void, constant: ConstantType): DataType {
    if (R.isString(constant)) {
      //TODO(combobox): handle Timestamp here, if we do manipulate them as ISOstring
      return 'String';
    }

    if (R.isNumber(constant)) {
      return Number.isInteger(constant) ? 'Int' : 'Float';
    }

    if (R.isBoolean(constant)) {
      return 'Bool';
    }

    if (R.isArray(constant)) {
      if (constant.every(R.isString)) return 'String[]';
      if (constant.every(R.isNumber)) {
        return constant.every(Number.isInteger) ? 'Int[]' : 'Float[]';
      }
      if (constant.every(R.isBoolean)) return 'Bool[]';
    }

    return 'unknown';
  }

  private static getConstantDisplayName(
    this: void,
    t: TFunctionDisplayName,
    constant: ConstantType,
  ): string {
    if (R.isNil(constant)) return '';

    if (R.isArray(constant)) {
      return `[${constant.map((constant) => ConstantEditableAstNode.getConstantDisplayName(t, constant)).join(', ')}]`;
    }

    if (R.isString(constant)) {
      //TODO(combobox): handle Timestamp here, if we do manipulate them as ISOstring
      return `"${constant.toString()}"`;
    }

    if (R.isNumber(constant)) {
      return constant.toString();
    }

    if (R.isBoolean(constant)) {
      return t(`common:${constant}`);
    }

    // Handle other cases when needed
    return JSON.stringify(
      R.mapValues(constant, (constant) =>
        ConstantEditableAstNode.getConstantDisplayName(t, constant),
      ),
    );
  }
}

export class AggregatorEditableAstNode implements EditableAstNodeBase {
  astNode: AggregationAstNode;
  operandType: OperandType = 'Function' as const;
  dataType: DataType = 'unknown' as const;
  displayName: string;

  dataModel: TableModel[];
  customLists: CustomList[];
  triggerObjectTable: TableModel;

  constructor(
    t: TFunctionDisplayName,
    astNode: AggregationAstNode,
    dataModel: TableModel[],
    customLists: CustomList[],
    triggerObjectTable: TableModel,
  ) {
    this.astNode = astNode;
    this.dataModel = dataModel;
    this.customLists = customLists;
    this.triggerObjectTable = triggerObjectTable;
    this.displayName = AggregatorEditableAstNode.getAggregatorDisplayName(
      t,
      astNode,
    );
  }

  static getAggregatorDisplayName(
    this: void,
    t: TFunctionDisplayName,
    astNode: AggregationAstNode,
  ) {
    const { aggregator, label } = astNode.namedChildren;
    if (label?.constant !== undefined && label?.constant !== '') {
      return label?.constant;
    }
    const aggregatorName = aggregator.constant;
    if (isAggregatorOperator(aggregatorName)) {
      return getOperatorName(t, aggregatorName);
    }
    // eslint-disable-next-line no-restricted-properties
    if (process.env.NODE_ENV === 'development') {
      console.warn('Unhandled aggregator', aggregatorName);
    }
    return aggregatorName;
  }
}

export class CustomListEditableAstNode implements EditableAstNodeBase {
  astNode: CustomListAccessAstNode;
  operandType: OperandType = 'CustomList' as const;
  dataType: DataType = 'unknown' as const;
  displayName: string;

  customList: CustomList;

  constructor(customList: CustomList) {
    this.customList = customList;
    this.astNode = NewCustomListAstNode(customList.id);
    this.displayName = customList.name;
  }
}

export class DatabaseAccessEditableAstNode implements EditableAstNodeBase {
  astNode: DatabaseAccessAstNode;
  operandType: OperandType = 'Field' as const;
  dataType: DataType;
  displayName: string;

  field: DataModelField;

  constructor(astNode: DatabaseAccessAstNode, dataModel: TableModel[]) {
    this.astNode = astNode;
    const table = findDataModelTable({
      dataModel,
      tableName: astNode.namedChildren.tableName.constant,
      path: astNode.namedChildren.path.constant,
    });
    this.field = findDataModelField({
      table: table,
      fieldName: astNode.namedChildren.fieldName.constant,
    });
    this.dataType = this.field.dataType;
    this.displayName =
      DatabaseAccessEditableAstNode.getDatabaseAccessorDisplayName(astNode);
  }

  getFieldGroupName = () => {
    const { path, tableName } = this.astNode.namedChildren;
    return [tableName.constant, ...path.constant].join('.');
  };

  static getDatabaseAccessorDisplayName(
    this: void,
    node: DatabaseAccessAstNode,
  ): string {
    const { path, fieldName } = node.namedChildren;
    return [...path.constant, fieldName.constant].join('.');
  }
}

export class PayloadAccessorsEditableAstNode implements EditableAstNodeBase {
  astNode: PayloadAstNode;
  operandType: OperandType = 'Field' as const;
  dataType: DataType;
  displayName: string;

  triggerObjectTable: TableModel;
  field: DataModelField;

  constructor(astNode: PayloadAstNode, triggerObjectTable: TableModel) {
    this.astNode = astNode;
    this.triggerObjectTable = triggerObjectTable;
    this.field = findDataModelField({
      table: triggerObjectTable,
      fieldName: astNode.children[0].constant,
    });
    this.dataType = this.field.dataType;
    this.displayName =
      PayloadAccessorsEditableAstNode.getPayloadAccessorsDisplayName(astNode);
  }

  getFieldGroupName = () => {
    return this.triggerObjectTable.name;
  };

  static getPayloadAccessorsDisplayName(
    this: void,
    node: PayloadAstNode,
  ): string {
    return node.children[0].constant;
  }
}

export class TimeAddEditableAstNode implements EditableAstNodeBase {
  astNode: TimeAddAstNode;
  operandType: OperandType = 'Function' as const;
  dataType: DataType = 'unknown' as const;
  displayName: string;

  constructor(
    t: TFunctionDisplayName,
    astNode: TimeAddAstNode = NewTimeAddAstNode(),
  ) {
    this.astNode = astNode;
    this.displayName = TimeAddEditableAstNode.getTimeAddName(t, astNode);
  }

  private static getTimeAddName(
    t: TFunctionDisplayName,
    astNode: TimeAddAstNode,
  ) {
    const sign = astNode.namedChildren['sign']?.constant ?? '';
    const isoDuration = astNode.namedChildren['duration']?.constant ?? '';
    const timestampField = astNode.namedChildren['timestampField'];

    let timestamp = '';
    if (isDatabaseAccess(timestampField)) {
      timestamp =
        DatabaseAccessEditableAstNode.getDatabaseAccessorDisplayName(
          timestampField,
        );
    }
    if (isPayload(timestampField)) {
      timestamp =
        PayloadAccessorsEditableAstNode.getPayloadAccessorsDisplayName(
          timestampField,
        );
    }
    if (isTimeNow(timestampField)) {
      timestamp = t('scenarios:edit_date.now');
    }

    if (sign === '' || isoDuration === '' || timestamp === '') {
      return t('scenarios:edit_date.date');
    }

    const temporalDuration = Temporal.Duration.from(isoDuration);
    return `${timestamp} ${sign} ${temporalDurationToString(temporalDuration)}`;
  }
}

// TODO (i18n): translate & pluralize / or use Intl.DurationFormat polyfill: https://formatjs.io/docs/polyfills/intl-durationformat/
const temporalDurationToString = (
  temporalDuration: Temporal.Duration,
): string => {
  let durationString = '';
  if (temporalDuration.days !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(
      temporalDuration.days,
      'day',
    )}`;
  }
  if (temporalDuration.hours !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(
      temporalDuration.hours,
      'hour',
    )}`;
  }
  if (temporalDuration.minutes !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(
      temporalDuration.minutes,
      'minute',
    )}`;
  }
  if (temporalDuration.seconds !== 0) {
    durationString += `${pluralizeTemporalDurationUnit(
      temporalDuration.seconds,
      'second',
    )}`;
  }
  if (durationString === '') {
    durationString += `${pluralizeTemporalDurationUnit(
      temporalDuration.seconds,
      'second',
    )}`;
  }
  return durationString;
};

const pluralizeTemporalDurationUnit = (unit: number, type: string): string => {
  if (unit === 1) {
    return `${unit} ${type}`;
  }
  return `${unit} ${type}s`;
};

export class TimeNowEditableAstNode implements EditableAstNodeBase {
  astNode: TimeNowAstNode;
  operandType: OperandType = 'Function' as const;
  dataType: DataType = 'unknown' as const;
  displayName: string;

  constructor(
    t: TFunctionDisplayName,
    astNode: TimeNowAstNode = NewTimeNowAstNode(),
  ) {
    this.astNode = astNode;
    this.displayName = t('scenarios:edit_date.now');
  }
}

export class UndefinedEditableAstNode implements EditableAstNodeBase {
  astNode: UndefinedAstNode;
  operandType: OperandType = 'Undefined' as const;
  dataType: DataType = 'unknown' as const;
  displayName: string = '';

  constructor(astNode: UndefinedAstNode = NewUndefinedAstNode()) {
    this.astNode = astNode;
  }
}

export type EditableAstNode =
  | ConstantEditableAstNode
  | AggregatorEditableAstNode
  | CustomListEditableAstNode
  | DatabaseAccessEditableAstNode
  | PayloadAccessorsEditableAstNode
  | TimeAddEditableAstNode
  | TimeNowEditableAstNode
  | UndefinedEditableAstNode;

export function adaptEditableAstNode(
  t: TFunctionDisplayName,
  node: AstNode,
  {
    triggerObjectTable,
    dataModel,
    customLists,
    enumOptions,
  }: {
    triggerObjectTable: TableModel;
    dataModel: TableModel[];
    customLists: CustomList[];
    enumOptions: EnumValue[];
  },
): EditableAstNode | undefined {
  if (isConstant(node)) {
    return new ConstantEditableAstNode(t, node, enumOptions);
  }

  if (isCustomListAccess(node)) {
    const customList = customLists.find(
      (customList) =>
        customList.id === node.namedChildren.customListId.constant,
    );
    if (customList) return new CustomListEditableAstNode(customList);
    return undefined;
  }

  if (isDatabaseAccess(node)) {
    return new DatabaseAccessEditableAstNode(node, dataModel);
  }

  if (isPayload(node)) {
    return new PayloadAccessorsEditableAstNode(node, triggerObjectTable);
  }

  if (isAggregation(node)) {
    return new AggregatorEditableAstNode(
      t,
      node,
      dataModel,
      customLists,
      triggerObjectTable,
    );
  }

  if (isTimeAdd(node)) {
    return new TimeAddEditableAstNode(t, node);
  }

  if (isTimeNow(node)) {
    return new TimeNowEditableAstNode(t, node);
  }

  if (isUndefinedAstNode(node)) {
    return new UndefinedEditableAstNode(node);
  }
}

/**
 * Recursively stringify an AST node :
 * - If the node is an EditableAstNode, return its displayName
 * - Else, return a default string representation
 */
export function stringifyAstNode(
  t: TFunctionDisplayName,
  astNode: AstNode,
  config: {
    triggerObjectTable: TableModel;
    dataModel: TableModel[];
    customLists: CustomList[];
    enumOptions: EnumValue[];
  },
): string {
  const editableAstNode = adaptEditableAstNode(t, astNode, config);
  if (editableAstNode) {
    return editableAstNode.displayName;
  }

  // If there is no name, return a default value (should never happen since constant are handled above)
  if (!astNode.name) return '🤷‍♂️';

  // default AstNode toString() implementation
  const childrenArgs = R.pipe(
    astNode.children,
    R.map((child) => stringifyAstNode(t, child, config)),
    R.join(', '),
  );

  const namedChildrenArgs = R.pipe(
    R.toPairs(astNode.namedChildren),
    R.map(([name, child]) => `${name}: ${stringifyAstNode(t, child, config)}`),
    R.join(', '),
  );

  const args = [childrenArgs, namedChildrenArgs]
    .filter((arg) => arg !== '')
    .join(', ');

  return `${astNode.name}(${args})`;
}
