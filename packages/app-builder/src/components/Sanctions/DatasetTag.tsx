import { cn } from 'ui-design-system';

export const DatasetTag = ({ tag }: { tag: string }) => (
  <span
    className={cn(
      'bg-grey-95 text-grey-50 text-2xs shrink-0 rounded-full px-2 py-[3px] font-medium',
      {
        'bg-orange-95 text-orange-50': tag === 'peps',
        'bg-blue-96 text-blue-58': tag === 'third-parties',
        'bg-red-95 text-red-47': tag === 'negative-news',
        'bg-yellow-90 text-yellow-50': tag === 'adverse-media',
      },
    )}
  >
    {tag}
  </span>
);
