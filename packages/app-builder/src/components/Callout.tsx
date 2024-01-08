import { cva, type VariantProps } from 'class-variance-authority';
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
        purple: 'border-l-2 border-l-purple-100',
        red: 'border-l-2 border-l-red-100',
      },
    },
  },
);

interface CalloutProps extends VariantProps<typeof callout> {
  children: React.ReactNode;
  className?: string;
}

export function Callout({
  children,
  className,
  color = 'purple',
  variant = 'soft',
}: CalloutProps) {
  if (!children) return null;

  return (
    <div className={callout({ color, variant, className })}>
      <Icon icon="lightbulb" className="size-6 shrink-0" />
      {children}
    </div>
  );
}
