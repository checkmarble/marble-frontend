import { Combobox as ComboboxPrimitive } from '@headlessui/react';
import clsx from 'clsx';
import * as React from 'react';

import Input from '../Input/Input';

const ComboboxRoot = ComboboxPrimitive;

const ComboboxInput = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Input>
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
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Options>
>(({ className, ...props }, ref) => (
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
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Option>
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

export const Combobox = {
  Root: ComboboxRoot,
  Input: ComboboxInput,
  Options: ComboboxOptions,
  Option: ComboboxOption,
};
