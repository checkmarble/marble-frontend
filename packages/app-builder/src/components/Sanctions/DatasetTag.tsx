import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { cn } from 'ui-design-system';

export const DatasetTag = ({ tag }: { tag: string }) => {
  const { t } = useTranslation(['scenarios']);

  return (
    <span
      className={cn('text-2xs shrink-0 rounded-full px-2 py-[3px] font-medium', {
        'bg-orange-95 text-orange-50': tag === 'peps',
        'bg-blue-96 text-blue-58': tag === 'third-parties',
        'bg-red-95 text-red-47': tag === 'negative-news',
        'bg-yellow-90 text-yellow-50': tag === 'adverse-media',
        'bg-grey-95 text-grey-50': tag === 'sanctions',
      })}
    >
      {match(tag)
        .with('peps', () => t(`scenarios:sanction.lists.peps`))
        .with('third-parties', () => t(`scenarios:sanction.lists.third_parties`))
        .with('sanctions', () => t(`scenarios:sanction.lists.sanctions`))
        .with('adverse-media', () => t(`scenarios:sanction.lists.adverse_media`))
        .with('negative-news', () => t(`scenarios:sanction.lists.negative_news`))
        .with('other', () => t(`scenarios:sanction.lists.other`))
        .otherwise(() => '')}
    </span>
  );
};
