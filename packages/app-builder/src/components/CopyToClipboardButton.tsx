import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

const variances = cva(
  'border-grey-90 text-grey-00 hover:bg-grey-95 active:bg-grey-90 flex w-fit shrink-0 cursor-pointer select-none items-center break-all rounded border font-normal transition-colors',
  {
    variants: {
      size: {
        sm: 'p-0.5 gap-2',
        lg: 'min-h-8 gap-3 px-2',
      },
      dimmed: {
        true: 'text-grey-50',
        false: null,
      },
    },
    defaultVariants: {
      dimmed: false,
      size: 'lg',
    },
  },
);

export type CopyToClipboardButtonProps = ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof variances> & {
    toCopy: string;
  };

export const CopyToClipboardButton = forwardRef<HTMLButtonElement, CopyToClipboardButtonProps>(
  function CopyToClipboardButton({ children, className, toCopy, dimmed, size, ...props }, ref) {
    const getCopyToClipboardProps = useGetCopyToClipboard();
    return (
      <button
        ref={ref}
        className={variances({ dimmed, className, size })}
        {...getCopyToClipboardProps(toCopy)}
        {...props}
      >
        {children}
        <Icon
          icon="copy"
          className={cn('shrink-0 text-current', {
            'size-4': size === undefined || size === 'lg',
            'size-3': size === 'sm',
          })}
        />
      </button>
    );
  },
);
