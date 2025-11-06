import {
  Indicator,
  Item,
  type RadioGroupIndicatorProps as RadixRadioGroupIndicatorProps,
  type RadioGroupItemProps as RadixRadioGroupItemProps,
  type RadioGroupProps as RadixRadioGroupsProps,
  Root,
} from '@radix-ui/react-radio-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps, forwardRef } from 'react';

export const radioGroup = cva(['flex flex-row w-fit', 'p-1', 'rounded-lg', 'bg-purple-98']);

export type RadioGroupProps = VariantProps<typeof radioGroup> & RadixRadioGroupsProps;

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { className, ...props },
  ref,
) {
  return <Root {...props} ref={ref} className={radioGroup({ className })} />;
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

export type RadioGroupItem = VariantProps<typeof radioGroupItem> & RadixRadioGroupItemProps;

export const RadioGroupItem = forwardRef<HTMLButtonElement, RadioGroupItem & ComponentProps<'button'>>(
  function RadioGroupItem({ className, ...props }, ref) {
    return <Item {...props} className={radioGroupItem({ className })} ref={ref} />;
  },
);

export const radioGroupIndicator = cva(['']);

export type RadioGroupIndicator = VariantProps<typeof radioGroupIndicator> & RadixRadioGroupIndicatorProps;

export const RadioGroupIndicator = forwardRef<HTMLDivElement, RadioGroupIndicator>(function RadioGroupIndicator(
  { className, ...props },
  ref,
) {
  return <Indicator {...props} className={radioGroupIndicator({ className })} ref={ref} />;
});
