import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'ui-design-system';

const tagVariants = cva('shrink-0 rounded-full font-medium', {
  variants: {
    size: {
      sm: 'text-2xs py-0.5 px-1',
      md: 'px-2 py-0.5 text-xs',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

type DatasetTagProps = VariantProps<typeof tagVariants> & { tag: string };

export const DatasetTag = ({ tag, size }: DatasetTagProps) => (
  <span
    className={tagVariants({
      size,
      className: cn('bg-grey-95 text-grey-50', {
        'bg-orange-95 text-orange-50': tag === 'peps',
        'bg-blue-96 text-blue-58': tag === 'third-parties',
        'bg-red-95 text-red-47': tag === 'negative-news',
        'bg-yellow-90 text-yellow-50': tag === 'adverse-media',
      }),
    })}
  >
    {tag}
  </span>
);
