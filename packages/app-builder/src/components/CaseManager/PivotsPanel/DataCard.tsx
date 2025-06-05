import { cva, type VariantProps } from 'class-variance-authority';
import { type ReactNode } from 'react';

const titleVariants = cva('text-s px-2 py-3 font-semibold flex justify-between items-center', {
  variants: {
    borderless: {
      true: null,
      false: 'border-b border-grey-90',
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
      <h3 className={titleVariants({ borderless })}>
        <span>{title}</span>
        {subtitle ? <span className="text-purple-82 text-xs">{subtitle}</span> : null}
      </h3>
      {children}
    </div>
  );
}
