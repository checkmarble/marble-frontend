import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

export const variants = ['info', 'error'] as const;

const iconColorClassName = {
  grey: 'text-grey-primary',
  purple: 'text-purple-primary',
  red: 'text-red-primary',
  orange: 'text-orange-primary',
  yellow: 'text-yellow-primary',
} as const;

const callout = cva('text-s grid grid-cols-[2px_1fr] rounded-md font-normal overflow-hidden', {
  variants: {
    /**
     * Outlined variant is usefull when you want to use the callout on non white background
     * @default soft
     */
    variant: {
      outlined: 'bg-surface-card border-grey-border border',
      soft: 'bg-grey-background-light',
    },
    bordered: {
      true: 'border border-grey-border',
      false: null,
    },
  },
});

const calloutBorder = cva('w-0.5', {
  variants: {
    color: {
      grey: 'bg-grey-border',
      purple: 'bg-purple-primary',
      red: 'bg-red-primary',
      orange: 'bg-orange-primary',
      yellow: 'bg-yellow-primary',
    },
  },
});

interface CalloutProps
  extends VariantProps<typeof callout>,
    VariantProps<typeof calloutBorder>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  icon?: IconName;
  iconColor?: keyof typeof iconColorClassName;
}

export function Callout({
  children,
  className,
  color = 'purple',
  variant = 'soft',
  bordered,
  icon = 'lightbulb',
  iconColor = 'grey',
  ...otherProps
}: CalloutProps) {
  if (!children) return null;

  return (
    <div className={callout({ variant, className, bordered })} {...otherProps}>
      <div className={calloutBorder({ color })} />
      <div className="flex flex-row items-center gap-sm p-sm">
        <Icon icon={icon} className={cn('size-4 shrink-0', iconColorClassName[iconColor ?? 'grey'])} />
        {children}
      </div>
    </div>
  );
}

export function CalloutV2({ children, className, ...otherProps }: React.ComponentPropsWithoutRef<'aside'>) {
  if (!children) return null;

  return (
    <aside
      className={cn(
        'bg-purple-background-light text-s text-purple-primary flex flex-row gap-sm rounded-lg p-md font-normal items-center dark:text-grey-primary',
        className,
      )}
      {...otherProps}
    >
      <Icon icon="tip" className="size-4 shrink-0" />
      {children}
    </aside>
  );
}
