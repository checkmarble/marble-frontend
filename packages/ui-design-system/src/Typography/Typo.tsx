import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentPropsWithoutRef, type ElementType, forwardRef } from 'react';
import { cn } from '../utils';

export const typoClassName = cva('text-grey-primary leading-[140%]', {
  variants: {
    variant: {
      title1: 'text-h1 font-bold',
      title2: 'text-h2 font-semibold',
      subtitle1: 'text-default font-semibold',
      subtitle2: 'text-small font-semibold',
      text: 'text-tiny',
    },
  },
  defaultVariants: {
    variant: 'text',
  },
});

const defaultElementByType = {
  title1: 'h1',
  title2: 'h2',
  subtitle1: 'h3',
  subtitle2: 'h4',
  text: 'p',
} as const satisfies Record<NonNullable<VariantProps<typeof typoClassName>['variant']>, keyof HTMLElementTagNameMap>;

type TypoType = keyof typeof defaultElementByType;

type TypoOwnProps = VariantProps<typeof typoClassName> & {
  className?: string;
  children?: React.ReactNode;
};

export type TypoProps<E extends ElementType = 'p'> = TypoOwnProps & {
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof TypoOwnProps | 'as'>;

type TypoComponent = <E extends ElementType = 'p'>(
  props: TypoProps<E> & { ref?: React.Ref<React.ComponentRef<E>> },
) => React.ReactElement | null;

export const Typo = forwardRef<HTMLElement, TypoProps<ElementType>>(function Typo(
  { as, variant = 'text', className, children, ...props },
  ref,
) {
  const resolvedType: TypoType = variant ?? 'text';
  const Component = (as ?? defaultElementByType[resolvedType]) as ElementType;

  return (
    <Component ref={ref} className={cn(typoClassName({ variant }), className)} {...props}>
      {children}
    </Component>
  );
}) as unknown as TypoComponent;

export default Typo;
