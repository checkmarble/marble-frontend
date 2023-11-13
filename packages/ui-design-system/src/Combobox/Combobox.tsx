import { Combobox as ComboboxPrimitive } from '@headlessui/react';
import clsx, { type ClassValue } from 'clsx';
import * as React from 'react';

import Input, { type InputProps } from '../Input/Input';

type WithoutRefAndCompatibleClassname<P extends React.ElementType> = Omit<
  React.ComponentPropsWithoutRef<P>,
  'className'
> & {
  className?: ClassValue;
};

const ComboboxRoot = ComboboxPrimitive;

const ComboboxInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  WithoutRefAndCompatibleClassname<typeof ComboboxPrimitive.Input> &
    Omit<InputProps, 'ref'>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Input
    ref={ref}
    as={Input}
    className={clsx(
      'ui-disabled:cursor-not-allowed ui-disabled:opacity-50',
      className
    )}
    {...props}
  />
));
ComboboxInput.displayName = 'Combobox.Input';

const ComboboxOptions = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Options>,
  WithoutRefAndCompatibleClassname<typeof ComboboxPrimitive.Options>
>(({ className, ...props }, ref) => (
  //@ts-expect-error issue on unmount that is passed to the component
  <ComboboxPrimitive.Options
    ref={ref}
    className={clsx(
      'bg-grey-00 border-grey-10 absolute z-10 mt-1 flex max-h-[300px] flex-col gap-2 overflow-y-auto overflow-x-hidden rounded border p-2 shadow-md',
      className
    )}
    {...props}
  />
));
ComboboxOptions.displayName = 'Combobox.Options';

const ComboboxOption = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Option>,
  WithoutRefAndCompatibleClassname<typeof ComboboxPrimitive.Option>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Option
    ref={ref}
    className={clsx(
      'ui-active:bg-purple-05 text-s cursor-default select-none rounded-sm p-2 outline-none',
      'ui-disabled:pointer-events-none ui-disabled:opacity-50',
      className
    )}
    {...props}
  />
));
ComboboxOption.displayName = 'Combobox.Option';

/**
 * @deprecated use SelectWithCombobox instead, or create a new component. @headlessui/react is planned to be removed.
 */
export const Combobox = {
  Root: ComboboxRoot,
  Input: ComboboxInput,
  Options: ComboboxOptions,
  Option: ComboboxOption,
};
