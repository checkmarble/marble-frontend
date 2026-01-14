import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

const variances = cva(
  'border-grey-border text-grey-primary hover:bg-grey-background active:bg-grey-border flex w-fit shrink-0 cursor-pointer select-none items-center break-all border font-normal transition-colors',
  {
    variants: {
      size: {
        sm: 'p-0.5 gap-2',
        lg: 'min-h-8 gap-3 px-2',
      },
      dimmed: {
        true: 'text-grey-secondary',
        false: null,
      },
      rounded: {
        true: 'rounded-full',
        false: 'rounded-sm',
      },
    },
    defaultVariants: {
      dimmed: false,
      size: 'lg',
      rounded: false,
    },
  },
);

export type CopyToClipboardButtonProps = ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof variances> & {
    toCopy: string;
  };

export const CopyToClipboardButton = forwardRef<HTMLButtonElement, CopyToClipboardButtonProps>(
  function CopyToClipboardButton({ children, className, toCopy, dimmed, size, rounded, ...props }, ref) {
    const getCopyToClipboardProps = useGetCopyToClipboard();
    return (
      <button
        ref={ref}
        className={variances({ dimmed, className, size, rounded })}
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
