import { SCREENING_TOPICS_MAP } from '@app-builder/models/sanction-check';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';

export const TopicTag = ({ topic }: { topic: string }) => {
  const { t } = useTranslation(['screeningTopics']);

  const category = SCREENING_TOPICS_MAP.get(topic);

  return (
    <span
      className={cn('text-2xs shrink-0 rounded-full px-2 py-[3px] font-medium', {
        'bg-orange-95 text-orange-50': category === 'peps',
        'bg-blue-96 text-blue-58': category === 'third-parties',
        // 'bg-red-95 text-red-47': category === 'negative-news',
        'bg-yellow-90 text-yellow-50': category === 'adverse-media',
        'bg-grey-95 text-grey-50': category === 'sanctions',
      })}
    >
      {t(`screeningTopics:${topic}`, { defaultValue: topic })}
    </span>
  );
};
