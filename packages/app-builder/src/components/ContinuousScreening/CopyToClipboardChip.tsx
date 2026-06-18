import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
/**
 * @deprecated use CopyToClipboardButton instead (with size = chip and rounded = true)
 */
export const CopyToClipboardChip = ({
  value,
  className,
  iconClassName,
}: {
  value: string;
  className?: string;
  iconClassName?: string;
}) => {
  const copyToClipboardProps = useGetCopyToClipboard();
  const { onClick, ...clipboardProps } = copyToClipboardProps(value);

  return (
    <button
      className={cn(
        'cursor-pointer border border-grey-border rounded-full py-xs px-sm flex items-center gap-xs font-semibold text-small',
        className,
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      {...clipboardProps}
    >
      <span className="truncate">{value}</span>
      <Icon icon="copy" className={cn('shrink-0 size-4', iconClassName)} />
    </button>
  );
};
