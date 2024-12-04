import { forwardRef, type ComponentProps } from 'react';
import {
  Root,
  Item,
  Indicator,
  type RadioGroupProps as RadixRadioGroupsProps,
  type RadioGroupItemProps as RadixRadioGroupItemProps,
  type RadioGroupIndicatorProps as RadixRadioGroupIndicatorProps,
} from '@radix-ui/react-radio-group';
import { cva, type VariantProps } from 'class-variance-authority';

export const radioGroup = cva([
  'flex flex-row w-fit',
  'p-1',
  'rounded-lg',
  'bg-purple-05',
]);

export type RadioGroupProps = VariantProps<typeof radioGroup> &
  RadixRadioGroupsProps;

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup({ className, ...props }, ref) {
    return <Root {...props} ref={ref} className={radioGroup({ className })} />;
  },
);

export const radioGroupItem = cva([
  'flex',
  'flex-row',
  'items-center',
  'gap-2',
  'text-purple-50',
  'text-s',
  'font-medium',
  'data-[state=checked]:bg-purple-100 data-[state=checked]:text-grey-00',
  'px-2',
  'py-1',
  'rounded-[4px]',
]);

export type RadioGroupItem = VariantProps<typeof radioGroupItem> &
  RadixRadioGroupItemProps;

export const RadioGroupItem = forwardRef<
  HTMLButtonElement,
  RadioGroupItem & ComponentProps<'button'>
>(function RadioGroupItem({ className, ...props }, ref) {
  return (
    <Item {...props} className={radioGroupItem({ className })} ref={ref} />
  );
});

export const radioGroupIndicator = cva(['']);

export type RadioGroupIndicator = VariantProps<typeof radioGroupIndicator> &
  RadixRadioGroupIndicatorProps;

export const RadioGroupIndicator = forwardRef<
  HTMLDivElement,
  RadioGroupIndicator
>(function RadioGroupIndicator({ className, ...props }, ref) {
  return (
    <Indicator
      {...props}
      className={radioGroupIndicator({ className })}
      ref={ref}
    />
  );
});
