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

export const radioGroup = cva(['flex flex-row w-fit', 'p-1', 'rounded-lg', 'bg-purple-background-light']);

export type RadioGroupProps = VariantProps<typeof radioGroup> & RadixRadioGroupsProps;

/**
 * A tab-like radio group component built on Radix UI primitives.
 * Displays options as horizontal pills with filled background when selected.
 *
 * **When to use RadioGroup vs Radio:**
 * - Use `RadioGroup` for tab-like selection with filled background styling (e.g., view toggles)
 * - Use `Radio` for standard form radio buttons with circular indicators
 *
 * @example
 * ```tsx
 * <RadioGroup value={view} onValueChange={setView}>
 *   <RadioGroupItem value="list">List</RadioGroupItem>
 *   <RadioGroupItem value="grid">Grid</RadioGroupItem>
 * </RadioGroup>
 * ```
 */
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
  'text-purple-disabled',
  'text-s',
  'font-medium',
  'data-[state=checked]:bg-purple-primary data-[state=checked]:text-grey-white',
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
