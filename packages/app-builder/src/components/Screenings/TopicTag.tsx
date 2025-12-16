import { SCREENING_CATEGORY_COLORS, SCREENING_TOPICS_MAP } from '@app-builder/models/screening';
import * as Sentry from '@sentry/remix';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

export const TopicTag = ({ topic, className }: { topic: string; className?: string }) => {
  const { t } = useTranslation(['screeningTopics']);

  const category = SCREENING_TOPICS_MAP.get(topic);
  if (!category) {
    Sentry.captureMessage(`No category found for topic: ${topic}`, 'warning');
    console.warn(`No category found for topic: ${topic}`);
    return null;
  }

  return (
    <Tag color={SCREENING_CATEGORY_COLORS[category]}>{t(`screeningTopics:${topic}`, { defaultValue: topic })}</Tag>
  );
};
