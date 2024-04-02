import {
  getOperatorName,
  type OperatorFunction,
  undefinedAstNodeName,
} from '@app-builder/models/editable-operators';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import { Trigger, Value } from '@radix-ui/react-select';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, type SelectTriggerProps } from 'ui-design-system';

const operatorContainerClassnames = cva(
  [
    'flex h-10 min-w-[40px] items-center justify-between outline-none gap-2 rounded px-2 border',
    'bg-grey-00 disabled:border-grey-02 disabled:bg-grey-02',
    'radix-state-open:border-purple-100  radix-state-open:bg-purple-05',
  ],
  {
    variants: {
      borderColor: {
        'grey-10': 'border-grey-10 focus:border-purple-100',
        'red-100': 'border-red-100 focus:border-purple-100',
        'red-25': 'border-red-25 focus:border-purple-100',
      },
    },
  },
);

interface OperatorLabelProps
  extends SelectTriggerProps,
    VariantProps<typeof operatorContainerClassnames> {}

const OperatorLabel = forwardRef<HTMLButtonElement, OperatorLabelProps>(
  function OperatorViewer(
    { className, borderColor = 'grey-10', ...props },
    ref,
  ) {
    return (
      <Trigger
        ref={ref}
        className={operatorContainerClassnames({ borderColor, className })}
        {...props}
      >
        <span className="text-s text-grey-100 w-full text-center font-medium">
          <Value placeholder="..." />
        </span>
      </Trigger>
    );
  },
);

/**
 * TODO: refactor to separate component label and select so we can use the label in the OperandInfos component (better than a disabled select requiring operators to be passed in as a prop)
 *
 * For now, this is not possible due to the Radix Select component not allowing for a custom label component
 */
export function Operator<T extends OperatorFunction>({
  value,
  setValue,
  operators,
  errors,
  viewOnly,
  ...rest
}: {
  value?: T;
  setValue: (operator: T) => void;
  operators: readonly T[];
  errors?: EvaluationError[];
  viewOnly?: boolean;
  'aria-labelledby'?: string;
}) {
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
      <OperatorLabel
        borderColor={errors && errors.length > 0 ? 'red-100' : 'grey-10'}
      />
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
                  <span className="text-s text-grey-100 font-semibold">
                    {getOperatorName(t, operator)}
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
