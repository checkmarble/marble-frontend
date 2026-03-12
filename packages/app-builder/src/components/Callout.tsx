import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

export const variants = ['info', 'error'] as const;

const callout = cva('text-s text-grey-primary flex flex-row items-center gap-2 rounded-sm p-2 font-normal', {
  variants: {
    /**
     * Outlined variant is usefull when you want to use the callout on non white background
     * @default soft
     */
    variant: {
      outlined: 'bg-surface-card border-grey-border border',
      soft: 'bg-grey-background-light',
    },
    color: {
      grey: null,
      purple: 'border-s-2 border-s-purple-primary',
      red: 'border-s-2 border-s-red-primary',
      orange: 'border-s-2 border-s-orange-primary',
      yellow: 'border-s-2 border-s-yellow-primary',
    },
    bordered: {
      true: 'border border-grey-border',
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
        'bg-purple-background-light text-s text-purple-primary flex flex-row gap-2 rounded-lg p-4 font-normal items-center dark:text-grey-primary',
        className,
      )}
      {...otherProps}
    >
      <Icon icon="tip" className="size-4 shrink-0" />
      {children}
    </aside>
  );
}
