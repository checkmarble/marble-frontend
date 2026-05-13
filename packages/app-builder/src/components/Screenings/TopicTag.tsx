import { isOpenSanctionTopic, OS_SCREENING_TOPICS_MAP, SCREENING_CATEGORY_COLORS } from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

export const TopicTag = ({ topic, className }: { topic: string; className?: string }) => {
  const { t } = useTranslation(['screeningTopics']);

  let category = OS_SCREENING_TOPICS_MAP.get(topic);
  if (!category) {
    console.warn(`No category found for topic: ${topic}`);
    category = 'other';
    // Sentry.captureMessage(`No category found for topic: ${topic}`, 'warning');
    // return null;
  }

  if (!isOpenSanctionTopic(topic)) {
    return (
      <Tag color={SCREENING_CATEGORY_COLORS[category]}>{t(`screeningTopics:os.${topic}`, { defaultValue: topic })}</Tag>
    );
  }

  // else if lexis topic...
  // blabla

  return (
    <Tag color="grey" className={className}>
      {topic}
    </Tag>
  );
};
