import { cva, type VariantProps } from 'class-variance-authority';
import { type ReactNode } from 'react';
import { Typo } from 'ui-design-system';

const titleVariants = cva('text-s px-xs py-sm font-semibold flex justify-between items-center', {
  variants: {
    borderless: {
      true: null,
      false: 'border-b border-grey-border',
    },
  },
  defaultVariants: {
    borderless: false,
  },
});

type DataCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
} & VariantProps<typeof titleVariants>;

export function DataCard({ title, subtitle, children, borderless }: DataCardProps) {
  return (
    <div>
      <Typo variant="subtitle1" className={titleVariants({ borderless })}>
        <span>{title}</span>
        {subtitle ? <span className="text-purple-disabled text-xs">{subtitle}</span> : null}
      </Typo>
      {children}
    </div>
  );
}
