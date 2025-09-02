import { cva, type VariantProps } from 'class-variance-authority';
import { RadioGroup as RadixRadioGroup } from 'radix-ui';
import { type ComponentProps, forwardRef } from 'react';

export const radioGroup = cva(['flex flex-row w-fit', 'p-1', 'rounded-lg', 'bg-purple-98']);

export type RadioGroupProps = VariantProps<typeof radioGroup> & RadixRadioGroup.RadioGroupProps;

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { className, ...props },
  ref,
) {
  return <RadixRadioGroup.Root {...props} ref={ref} className={radioGroup({ className })} />;
});

export const radioGroupItem = cva([
  'flex',
  'flex-row',
  'items-center',
  'gap-2',
  'text-purple-82',
  'text-s',
  'font-medium',
  'data-[state=checked]:bg-purple-65 data-[state=checked]:text-grey-100',
  'px-2',
  'py-1',
  'rounded-[4px]',
]);

export type RadioGroupItem = VariantProps<typeof radioGroupItem> &
  RadixRadioGroup.RadioGroupItemProps;

export const RadioGroupItem = forwardRef<
  HTMLButtonElement,
  RadioGroupItem & ComponentProps<'button'>
>(function RadioGroupItem({ className, ...props }, ref) {
  return <RadixRadioGroup.Item {...props} className={radioGroupItem({ className })} ref={ref} />;
});

export const radioGroupIndicator = cva(['']);

export type RadioGroupIndicator = VariantProps<typeof radioGroupIndicator> &
  RadixRadioGroup.RadioGroupIndicatorProps;

export const RadioGroupIndicator = forwardRef<HTMLDivElement, RadioGroupIndicator>(
  function RadioGroupIndicator({ className, ...props }, ref) {
    return (
      <RadixRadioGroup.Indicator
        {...props}
        className={radioGroupIndicator({ className })}
        ref={ref}
      />
    );
  },
);
