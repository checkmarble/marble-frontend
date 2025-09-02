import clsx from 'clsx';
import { Separator as RadixSeparator } from 'radix-ui';

export function Separator({ className, ...props }: RadixSeparator.SeparatorProps) {
  return (
    <RadixSeparator.Root
      className={clsx(
        'radix-orientation-horizontal:h-px radix-orientation-horizontal:w-full',
        'radix-orientation-vertical:w-px radix-orientation-vertical:h-full',
        className,
      )}
      {...props}
    />
  );
}
