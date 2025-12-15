import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

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

  return (
    <button
      className={cn(
        'cursor-pointer border border-grey-border rounded-full py-v2-xs px-v2-sm flex items-center gap-v2-xs font-semibold text-small',
        className,
      )}
      {...copyToClipboardProps(value)}
    >
      <span className="truncate">{value}</span>
      <Icon icon="copy" className={cn('shrink-0 size-4', iconClassName)} />
    </button>
  );
};
