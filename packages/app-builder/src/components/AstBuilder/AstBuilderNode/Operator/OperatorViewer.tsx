import {
  type SelectTriggerProps,
  Trigger,
  Value,
} from '@radix-ui/react-select';
import clsx from 'clsx';
import { forwardRef } from 'react';

export const selectBorderColor = ['grey', 'green', 'red'] as const;

interface OperatorViewerProps extends SelectTriggerProps {
  borderColor?: (typeof selectBorderColor)[number];
}

export const OperatorViewer = forwardRef<
  HTMLButtonElement,
  OperatorViewerProps
>(({ className, borderColor = 'grey', ...props }, ref) => (
  <Trigger
    ref={ref}
    data-border-color={borderColor}
    className={clsx(
      'bg-grey-00 text-s text-grey-100 group flex h-10 min-w-[40px] items-center justify-between border font-medium outline-none',
      'radix-state-open:border-purple-100 radix-state-open:bg-purple-05',
      'radix-disabled:border-grey-02 radix-disabled:bg-grey-02',
      'gap-2 rounded px-2',
      // Border color variants
      'data-[border-color=grey]:border-grey-10 data-[border-color=grey]:focus:border-purple-100',
      'data-[border-color=red]:border-red-100 data-[border-color=red]:focus:border-purple-100',
      'data-[border-color=green]:border-green-100 data-[border-color=green]:focus:border-purple-100',
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
