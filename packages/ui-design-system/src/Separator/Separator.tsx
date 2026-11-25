import { Separator as RawSeparator, type SeparatorProps } from '@radix-ui/react-separator';
import { cn } from '../utils';

export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <RawSeparator
      className={cn(
        'radix-orientation-horizontal:h-px radix-orientation-horizontal:w-full',
        'radix-orientation-vertical:w-px radix-orientation-vertical:h-full',
        className,
      )}
      {...props}
    />
  );
}
