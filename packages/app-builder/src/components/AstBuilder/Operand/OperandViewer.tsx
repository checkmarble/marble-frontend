import clsx from 'clsx';
import { forwardRef } from 'react';

export const selectBorderColor = ['grey', 'green', 'red'] as const;

interface OperandViewerProps extends React.ComponentProps<'button'> {
  borderColor?: (typeof selectBorderColor)[number];
}

export const OperandViewer = forwardRef<HTMLButtonElement, OperandViewerProps>(
  ({ borderColor = 'grey', ...props }, ref) => (
    <button
      ref={ref}
      data-border-color={borderColor}
      className={clsx(
        'flex h-10 min-w-[40px] items-center justify-between px-2 outline-none',
        'bg-grey-00 disabled:bg-grey-05 radix-state-open:bg-purple-05',
        'radix-state-open:border-purple-100 disabled:border-grey-10 rounded border',
        // Border color variants
        'data-[border-color=grey]:border-grey-10 data-[border-color=grey]:focus:border-purple-100',
        'data-[border-color=red]:border-red-100 data-[border-color=red]:focus:border-purple-100',
        'data-[border-color=green]:border-green-100 data-[border-color=green]:focus:border-purple-100'
      )}
      {...props}
    />
  )
);
OperandViewer.displayName = 'OperandViewer';
