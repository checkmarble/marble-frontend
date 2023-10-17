import {
  type SelectTriggerProps,
  Trigger,
  Value,
} from '@radix-ui/react-select';
import clsx from 'clsx';
import { forwardRef } from 'react';

export const selectBorderColor = ['grey-10', 'red-100', 'red-25'] as const;

interface OperatorViewerProps extends SelectTriggerProps {
  borderColor?: (typeof selectBorderColor)[number];
}

export const OperatorViewer = forwardRef<
  HTMLButtonElement,
  OperatorViewerProps
>(({ className, borderColor = 'grey-10', ...props }, ref) => (
  <Trigger
    ref={ref}
    data-border-color={borderColor}
    className={clsx(
      'bg-grey-00 text-s text-grey-100 group flex h-10 min-w-[40px] items-center justify-between border font-medium outline-none',
      'radix-state-open:border-purple-100 radix-state-open:bg-purple-05',
      'radix-disabled:border-grey-02 radix-disabled:bg-grey-02',
      'gap-2 rounded px-2',
      // Border color variants
      'data-[border-color=grey-10]:border-grey-10 data-[border-color=grey-10]:focus:border-purple-100',
      'data-[border-color=red-100]:border-red-100 data-[border-color=red-100]:focus:border-purple-100',
      'data-[border-color=red-25]:border-red-25 data-[border-color=red-25]:focus:border-purple-100',
      className
    )}
    {...props}
  >
    <span className="w-full text-center">
      <Value placeholder="..." />
    </span>
  </Trigger>
));
OperatorViewer.displayName = 'OperatorViewer';
