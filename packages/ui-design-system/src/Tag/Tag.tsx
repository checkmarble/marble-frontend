import { cva, VariantProps } from 'class-variance-authority';
import { ComponentProps, forwardRef } from 'react';
import { cn } from '../utils';

export const tagClassName = cva('inline-flex items-center justify-center border text-nowrap', {
  variants: {
    size: {
      small: 'h-6 px-v2-sm rounded-full text-small',
      medium: 'h-8 px-v2-sm rounded-v2-s text-default font-medium',
      big: 'h-10 px-v2-sm rounded-v2-s text-default font-medium',
    },
    color: {
      purple: 'text-purple-primary border-purple-primary',
      blue: 'text-blue-58 border-blue-58',
      green: 'text-green-primary border-green-primary',
      yellow: 'text-yellow-primary border-yellow-primary',
      orange: 'text-orange-primary border-orange-primary',
      red: 'text-red-primary border-red-primary',
      grey: 'text-grey-secondary border-grey-secondary',
      'grey-light': 'text-grey-primary border-grey-border',
    },
  },
  defaultVariants: {
    color: 'purple',
    size: 'small',
  },
});

export type TagProps = ComponentProps<'span'> & VariantProps<typeof tagClassName>;

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag({ size, color, className, ...props }, ref) {
  return <span ref={ref} className={cn(tagClassName({ size, color }), className)} {...props} />;
});

export default Tag;
