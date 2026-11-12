import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '../utils';

const kbdClassName = cva('inline-flex shrink-0 items-center justify-center border border-b-2', {
  variants: {
    variant: {
      default: 'min-h-6 min-w-6 rounded-md border-b-2 border-grey-disabled bg-grey-background',
      // Outline key cap that sits inside a button without growing it.
      small: 'h-4 min-w-4 rounded-sm border-grey-border bg-transparent px-xs text-xs/none',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type KbdProps = ComponentProps<'kbd'> & VariantProps<typeof kbdClassName>;

export function Kbd({ className, variant, ...props }: KbdProps) {
  return <kbd className={cn(kbdClassName({ variant }), className)} {...props} />;
}
