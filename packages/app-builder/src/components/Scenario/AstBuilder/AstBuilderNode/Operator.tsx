import { undefinedAstNodeName } from '@app-builder/models/astNode/ast-node';
import { getOperatorName } from '@app-builder/models/get-operator-name';
import { type OperatorOption } from '@app-builder/models/operator-options';
import { Trigger, Value } from '@radix-ui/react-select';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, type SelectTriggerProps } from 'ui-design-system';

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
  },
);

interface OperatorLabelProps
  extends SelectTriggerProps,
    VariantProps<typeof operatorContainerClassnames> {}

const OperatorLabel = forwardRef<HTMLButtonElement, OperatorLabelProps>(
  function OperatorViewer(
    { className, validationStatus = 'valid', ...props },
    ref,
  ) {
    return (
      <Trigger
        ref={ref}
        className={operatorContainerClassnames({ validationStatus, className })}
        {...props}
      >
        <span className="text-s text-grey-00 w-full text-center font-medium">
          <Value placeholder="..." />
        </span>
      </Trigger>
    );
  },
);

interface OperatorProps<T extends OperatorOption>
  extends VariantProps<typeof operatorContainerClassnames> {
  value?: T;
  setValue: (operator: T) => void;
  operators: readonly T[];
  viewOnly?: boolean;
  isFilter?: boolean;
  'aria-labelledby'?: string;
}

/**
 * TODO: refactor to separate component label and select so we can use the label in the OperandInfos component (better than a disabled select requiring operators to be passed in as a prop)
 *
 * For now, this is not possible due to the Radix Select component not allowing for a custom label component
 */
export function Operator<T extends OperatorOption>({
  value,
  setValue,
  operators,
  validationStatus,
  viewOnly,
  isFilter,
  ...rest
}: OperatorProps<T>) {
  const { t } = useTranslation(['common', 'scenarios']);

  // We treat undefinedAstNodeName as "no value"
  const _value = value !== undefinedAstNodeName ? value : undefined;

  return (
    <Select.Root
      value={_value}
      onValueChange={setValue}
      disabled={viewOnly}
      {...rest}
    >
      <OperatorLabel validationStatus={validationStatus} />
      <Select.Content className="max-h-60">
        <Select.Viewport>
          {operators.map((operator) => {
            return (
              <Select.Item
                className="min-w-[110px]"
                key={operator}
                value={operator}
              >
                <Select.ItemText>
                  <span className="text-s text-grey-00 font-semibold">
                    {getOperatorName(t, operator, isFilter)}
                  </span>
                </Select.ItemText>
              </Select.Item>
            );
          })}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
}
