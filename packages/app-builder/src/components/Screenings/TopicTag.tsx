import { SCREENING_CATEGORY_COLORS, SCREENING_TOPICS_MAP } from '@app-builder/models/screening';
import * as Sentry from '@sentry/remix';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';

export const TopicTag = ({ topic }: { topic: string }) => {
  const { t } = useTranslation(['screeningTopics']);

  const category = SCREENING_TOPICS_MAP.get(topic);

  if (!category) {
    Sentry.captureMessage(`No category found for topic: ${topic}`, 'warning');
    console.warn(`No category found for topic: ${topic}`);
    return null;
  }

  return (
    <span
      className={cn(
        'text-2xs shrink-0 rounded-full px-2 py-[3px] font-medium',
        SCREENING_CATEGORY_COLORS[category],
      )}
    >
      {t(`screeningTopics:${topic}`, { defaultValue: topic })}
    </span>
  );
};
