import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

export const variants = ['info', 'error'] as const;

const callout = cva('text-s text-grey-00 flex flex-row items-center gap-2 rounded-sm p-2 font-normal', {
  variants: {
    /**
     * Outlined variant is usefull when you want to use the callout on non white background
     * @default soft
     */
    variant: {
      outlined: 'bg-grey-100 border-grey-90 border',
      soft: 'bg-grey-98',
    },
    color: {
      purple: 'border-s-2 border-s-purple-65',
      red: 'border-s-2 border-s-red-47',
      orange: 'border-s-2 border-s-orange-50',
      yellow: 'border-s-2 border-s-yellow-50',
    },
    bordered: {
      true: 'border border-grey-90',
      false: null,
    },
  },
});

interface CalloutProps extends VariantProps<typeof callout>, Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  icon?: IconName;
}

export function Callout({
  children,
  className,
  color = 'purple',
  variant = 'soft',
  bordered,
  icon = 'lightbulb',
  ...otherProps
}: CalloutProps) {
  if (!children) return null;

  return (
    <div className={callout({ color, variant, className, bordered })} {...otherProps}>
      <Icon icon={icon} className="size-4 shrink-0" />
      {children}
    </div>
  );
}

export function CalloutV2({ children, className, ...otherProps }: React.ComponentPropsWithoutRef<'aside'>) {
  if (!children) return null;

  return (
    <aside
      className={cn(
        'bg-purple-98 text-s text-purple-65 flex flex-row gap-2 rounded-lg p-4 font-normal items-center',
        className,
      )}
      {...otherProps}
    >
      <Icon icon="tip" className="size-4 shrink-0" />
      {children}
    </aside>
  );
}
