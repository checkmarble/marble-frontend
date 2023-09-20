import {
  aggregationAstNodeName,
  customListAccessAstNodeName,
  databaseAccessAstNodeName,
  type DataType,
  payloadAstNodeName,
} from '@app-builder/models';
import { Boolean, Field, List, Number, String, Variable } from '@ui-icons';
import clsx from 'clsx';
import { type ParseKeys } from 'i18next';

function OptionContainer({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="option"
      // TODO(combobox): handle aria-selected when keyboard navigation is implemented (+ style w\ hover:bg-purple-05)
      aria-selected="false"
      className={clsx(
        'hover:bg-purple-05 grid w-full select-none grid-cols-[20px_1fr_20px] gap-1 rounded-sm p-2 outline-none transition-colors',

        className
      )}
      {...props}
    />
  );
}

function OptionIcon({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={clsx('shrink-0 text-[21px] transition-colors', className)}
      {...props}
    />
  );
}

function OptionValue({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={clsx(
        'text-grey-100 text-s text-start font-normal transition-colors',

        className
      )}
      {...props}
    />
  );
}

export const Option = {
  Container: OptionContainer,
  Icon: OptionIcon,
  Value: OptionValue,
};

export function getDataTypeIcon(dataType?: DataType) {
  switch (dataType) {
    case 'String':
      return String;
    case 'Int':
    case 'Float':
      return Number;
    case 'Bool':
      return Boolean;
    default:
      return undefined;
  }
}

export function getDataTypeTKey(
  dataType?: DataType
): ParseKeys<'scenarios'> | undefined {
  switch (dataType) {
    case 'String':
      return 'edit_operand.data_type.string';
    case 'Int':
    case 'Float':
      return 'edit_operand.data_type.number';
    case 'Bool':
      return 'edit_operand.data_type.boolean';
    case 'Timestamp':
      return 'edit_operand.data_type.timestamp';
    default:
      return undefined;
  }
}

export function getOperatorTypeIcon(operatorType?: string) {
  switch (operatorType) {
    case customListAccessAstNodeName:
      return List;
    case databaseAccessAstNodeName:
    case payloadAstNodeName:
      return Field;
    case aggregationAstNodeName:
      return Variable;
    default:
      return undefined;
  }
}

export function getOperatorTypeTKey(
  operatorType?: string
): ParseKeys<'scenarios'> | undefined {
  switch (operatorType) {
    case customListAccessAstNodeName:
      return 'edit_operand.operator_type.list';
    case databaseAccessAstNodeName:
    case payloadAstNodeName:
      return 'edit_operand.operator_type.field';
    case aggregationAstNodeName:
      return 'edit_operand.operator_type.variable';
    default:
      return undefined;
  }
}
