import { type DataType, type LabelledAst } from '@app-builder/models';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import { type ParseKeys } from 'i18next';
import { Icon, type IconName } from 'ui-icons';

function OptionContainer({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenu.Item>) {
  return (
    <DropdownMenu.Item
      className={clsx(
        'radix-highlighted:bg-purple-05 grid w-full select-none grid-cols-[20px_1fr_20px] gap-1 rounded-sm p-2 outline-none transition-colors',

        className,
      )}
      {...props}
    />
  );
}

function OptionIcon({
  className,
  ...props
}: React.ComponentProps<typeof Icon>) {
  return (
    <Icon
      className={clsx('h-5 w-5 shrink-0 transition-colors', className)}
      {...props}
    />
  );
}

function OptionValue({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={clsx(
        'text-grey-100 text-s overflow-hidden text-ellipsis text-start font-normal transition-colors',

        className,
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

export function getDataTypeIcon(dataType?: DataType): IconName | undefined {
  switch (dataType) {
    case 'Timestamp':
      return 'schedule';
    case 'String':
      return 'string';
    case 'Int':
    case 'Float':
      return 'number';
    case 'Bool':
      return 'boolean';
    default:
      return undefined;
  }
}

export function getDataTypeTKey(
  dataType?: DataType,
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

export function getOperatorTypeIcon(
  operatorType: LabelledAst['operandType'],
): IconName | undefined {
  switch (operatorType) {
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

export function getOperatorTypeTKey(
  operatorType: LabelledAst['operandType'],
): ParseKeys<'scenarios'> | undefined {
  switch (operatorType) {
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
