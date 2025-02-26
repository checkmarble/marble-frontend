import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { Icon } from 'ui-icons';

const variances = cva(
  'border-grey-90 text-grey-00 hover:bg-grey-95 active:bg-grey-90 flex min-h-8 w-fit shrink-0 cursor-pointer select-none items-center gap-3 break-all rounded border px-2 font-normal transition-colors',
  {
    variants: {
      dimmed: {
        true: 'text-grey-50',
        false: null,
      },
    },
    defaultVariants: {
      dimmed: false,
    },
  },
);

export type CopyToClipboardButtonProps = ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof variances> & {
    toCopy: string;
  };

export const CopyToClipboardButton = forwardRef<HTMLButtonElement, CopyToClipboardButtonProps>(
  function CopyToClipboardButton({ children, className, toCopy, dimmed, ...props }, ref) {
    const getCopyToClipboardProps = useGetCopyToClipboard();
    return (
      <button
        ref={ref}
        className={variances({ dimmed, className })}
        {...getCopyToClipboardProps(toCopy)}
        {...props}
      >
        {children}
        <Icon icon="copy" className="size-4 shrink-0 text-current" />
      </button>
    );
  },
);
