import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps, type ElementType, type ReactNode } from 'react';
import { cn } from '../utils';

const cardClassName = cva('border rounded-md p-md', {
  variants: {
    color: {
      default: 'border-grey-border bg-surface-card',
      purple: 'border-purple-border-light bg-purple-background-light dark:border-purple-disabled dark:bg-purple-border',
      grey: 'border-grey-background-light bg-grey-background-light',
    },
  },
  defaultVariants: {
    color: 'default',
  },
});

type CardOwnProps = {
  children?: ReactNode;
  className?: string;
} & VariantProps<typeof cardClassName>;

export type CardProps<E extends ElementType = 'div'> = CardOwnProps & {
  as?: E;
} & Omit<ComponentProps<E>, keyof CardOwnProps | 'as'>;

export function Card<E extends ElementType = 'div'>({ as, children, className, color, ...props }: CardProps<E>) {
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component className={cn(cardClassName({ color }), className)} {...props}>
      {children}
    </Component>
  );
}
