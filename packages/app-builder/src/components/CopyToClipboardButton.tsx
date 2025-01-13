import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import clsx from 'clsx';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { Icon } from 'ui-icons';

export const CopyToClipboardButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<'button'> & {
    toCopy: string;
  }
>(function CopyToClipboardButton(
  { children, className, toCopy, ...props },
  ref,
) {
  const getCopyToClipboardProps = useGetCopyToClipboard();
  return (
    <button
      ref={ref}
      className={clsx(
        'border-grey-90 text-grey-00 hover:bg-grey-95 active:bg-grey-90 flex min-h-8 w-fit shrink-0 cursor-pointer select-none items-center gap-3 break-all rounded border px-2 font-normal transition-colors',
        className,
      )}
      {...getCopyToClipboardProps(toCopy)}
      {...props}
    >
      {children}
      <Icon icon="copy" className="size-4 shrink-0" />
    </button>
  );
});
