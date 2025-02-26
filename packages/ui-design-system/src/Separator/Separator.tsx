import { Separator as RawSeparator, type SeparatorProps } from '@radix-ui/react-separator';
import clsx from 'clsx';

export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <RawSeparator
      className={clsx(
        'radix-orientation-horizontal:h-px radix-orientation-horizontal:w-full',
        'radix-orientation-vertical:w-px radix-orientation-vertical:h-full',
        className,
      )}
      {...props}
    />
  );
}
