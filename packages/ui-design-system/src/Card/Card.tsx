import { cva, VariantProps } from 'class-variance-authority';
import { ReactNode } from 'react';
import { cn } from 'ui-design-system';

const cardClassName = cva('border rounded-md p-md', {
  variants: {
    color: {
      default: 'border-grey-border bg-surface-card',
      purple: 'border-purple-border-light bg-purple-background-light dark:border-purple-disabled dark:bg-purple-border',
    },
  },
  defaultVariants: {
    color: 'default',
  },
});

export type CardProps = {
  children?: ReactNode;
  className?: string;
} & VariantProps<typeof cardClassName>;

export function Card({ children, className, color }: CardProps) {
  return <div className={cn(cardClassName({ color }), className)}>{children}</div>;
}
