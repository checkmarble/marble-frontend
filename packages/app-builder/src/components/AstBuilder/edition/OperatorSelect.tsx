import { undefinedAstNodeName } from '@app-builder/models';
import { getOperatorName } from '@app-builder/models/get-operator-name';
import { cva, type VariantProps } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';

export const operatorContainerClassnames = cva(
  [
    'flex h-10 min-w-[40px] items-center justify-between outline-none gap-2 rounded px-2 border',
    'bg-grey-100 disabled:border-grey-98 disabled:bg-grey-98',
    'radix-state-open:border-purple-65  radix-state-open:bg-purple-98',
  ],
  {
    variants: {
      validationStatus: {
        valid: 'border-grey-90 focus:border-purple-65',
        error: 'border-red-47 focus:border-purple-65',
      },
    },
    defaultVariants: {
      validationStatus: 'valid',
    },
  },
);

export type OperatorSelectOptions<Op extends string> = Record<Op, { keywords?: string[] }>;

export function OperatorSelect<Op extends string>({
  options,
  operator,
  onOperatorChange,
  validationStatus,
  isFilter = false,
  hideArrow = false,
}: {
  options: readonly Op[] | OperatorSelectOptions<Op>;
  operator: Op | null;
  onOperatorChange: (v: Op) => void;
  isFilter?: boolean;
  hideArrow?: boolean;
} & VariantProps<typeof operatorContainerClassnames>) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation(['common', 'scenarios']);
  const mappedOptions = mapOptions(options);

  const _value = operator !== undefinedAstNodeName && operator !== null ? operator : null;
  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <button type="button" className={operatorContainerClassnames({ validationStatus })}>
          <span className="text-s text-grey-00 w-full text-center font-medium">
            {_value ? getOperatorName(t, _value, isFilter) : '...'}
          </span>
          {hideArrow ? null : <MenuCommand.Arrow />}
        </button>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth sideOffset={4} align="start" className="min-w-24">
        <MenuCommand.Combobox />
        <MenuCommand.List>
          {mappedOptions.map((op) => (
            <MenuCommand.Item
              keywords={op.keywords ?? [op.value]}
              selected={operator === op.value}
              key={op.value}
              onSelect={() => onOperatorChange(op.value)}
            >
              <span className="font-semibold">{getOperatorName(t, op.value, isFilter)}</span>
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

type Options<Op extends string> = {
  value: Op;
  keywords?: string[];
}[];

function mapOptions<Op extends string>(
  options: readonly Op[] | OperatorSelectOptions<Op>,
): Options<Op> {
  const isOpSelect = isOperationSelectOptions(options);
  const values = isOpSelect ? (Object.keys(options) as Op[]) : options;

  return values.map((value) => {
    if (isOpSelect) {
      return { value, ...options[value] };
    } else {
      return { value };
    }
  });
}

function isOperationSelectOptions<Op extends string>(
  opts: readonly Op[] | OperatorSelectOptions<Op>,
): opts is OperatorSelectOptions<Op> {
  return !Array.isArray(opts);
}
