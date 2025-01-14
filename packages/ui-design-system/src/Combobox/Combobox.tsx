import * as Ariakit from '@ariakit/react';
import { type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import * as React from 'react';

import { selectTrigger } from '../Select/Select';

export const ComboboxRoot = Ariakit.ComboboxProvider;
export const ComboboxLabel = Ariakit.ComboboxLabel;

export const Combobox = React.forwardRef<
  HTMLInputElement,
  Ariakit.ComboboxProps & VariantProps<typeof selectTrigger>
>(function Combobox(
  {
    className,
    border = 'square',
    borderColor = 'greyfigma-90',
    disabled,
    ...props
  },
  ref,
) {
  return (
    <Ariakit.Combobox
      ref={ref}
      className={clsx(
        'group',
        selectTrigger({
          border,
          borderColor,
          backgroundColor: disabled ? 'disabled' : 'enabled',
        }),
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
});

export const ComboboxPopover = React.forwardRef<
  HTMLDivElement,
  Ariakit.ComboboxPopoverProps
>(function ComboboxPopover({ className, ...props }, ref) {
  return (
    <Ariakit.ComboboxPopover
      ref={ref}
      fitViewport
      gutter={8}
      className={clsx(
        'bg-grey-100 border-grey-90 max-h-[min(var(--popover-available-height),_300px)] -translate-y-1 rounded border opacity-0 shadow-md transition-all data-[enter]:translate-y-0 data-[enter]:opacity-100',
        className,
      )}
      {...props}
    />
  );
});

export const ComboboxItem = React.forwardRef<
  HTMLDivElement,
  Ariakit.ComboboxItemProps
>(function ComboboxItem(props, ref) {
  return (
    <Ariakit.ComboboxItem
      ref={ref}
      {...props}
      className={clsx(
        'data-[active-item]:bg-purple-98 hover:bg-purple-98 group flex flex-row items-center gap-2 rounded p-2',
        props.className,
      )}
    />
  );
});
