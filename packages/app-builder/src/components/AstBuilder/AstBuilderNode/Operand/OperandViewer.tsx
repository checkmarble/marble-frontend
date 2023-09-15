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
        'bg-grey-00 flex h-fit min-h-[40px] w-fit min-w-[40px] items-center justify-between rounded border px-2 outline-none',
        'disabled:bg-grey-02 disabled:border-grey-02',
        'radix-state-open:border-purple-100 radix-state-open:bg-purple-05',
        // Border color variants
        'enabled:data-[border-color=grey]:border-grey-10 enabled:data-[border-color=grey]:focus:border-purple-100',
        'enabled:data-[border-color=red]:border-red-100 enabled:data-[border-color=red]:focus:border-purple-100',
        'enabled:data-[border-color=green]:border-green-100 enabled:data-[border-color=green]:focus:border-purple-100'
      )}
      {...props}
    />
  )
);
OperandViewer.displayName = 'OperandViewer';
