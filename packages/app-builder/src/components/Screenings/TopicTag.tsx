import { getCategoryForTopic, SCREENING_CATEGORY_COLORS } from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

export const TopicTag = ({ topic, className }: { topic: string; className?: string }) => {
  const { t } = useTranslation(['screeningTopics']);

  const category = getCategoryForTopic(topic);
  if (!category) return null;

  return (
    <Tag color={SCREENING_CATEGORY_COLORS[category]}>{t(`screeningTopics:${topic}`, { defaultValue: topic })}</Tag>
  );
};
