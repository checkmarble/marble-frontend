import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { Icon } from 'ui-icons';

export const variants = ['info', 'error'] as const;

const callout = cva(
  'text-s text-grey-100 flex flex-row items-center gap-2 rounded p-2 font-normal',
  {
    variants: {
      /**
       * Outlined variant is usefull when you want to use the callout on non white background
       * @default soft
       */
      variant: {
        outlined: 'bg-grey-00 border-grey-10 border',
        soft: 'bg-grey-02',
      },
      color: {
        purple: 'border-s-2 border-s-purple-100',
        red: 'border-s-2 border-s-red-100',
      },
    },
  },
);

interface CalloutProps
  extends VariantProps<typeof callout>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {}

export function Callout({
  children,
  className,
  color = 'purple',
  variant = 'soft',
  ...otherProps
}: CalloutProps) {
  if (!children) return null;

  return (
    <div className={callout({ color, variant, className })} {...otherProps}>
      <Icon icon="lightbulb" className="size-6 shrink-0" />
      {children}
    </div>
  );
}

export function CalloutV2({
  children,
  className,
  ...otherProps
}: React.ComponentPropsWithoutRef<'aside'>) {
  if (!children) return null;

  return (
    <aside
      className={clsx(
        'bg-purple-05 text-s flex flex-row gap-2 rounded-lg p-4 font-normal text-purple-100',
        className,
      )}
      {...otherProps}
    >
      <Icon icon="tip" className="size-5 shrink-0" />
      {children}
    </aside>
  );
}
