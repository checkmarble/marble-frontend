import {
  isLexisTopic,
  isOpenSanctionTopic,
  lexisTopicIgnoreDisplay,
  lexisTopicToColor,
  openSanctionsTopicToColor,
} from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

export function isDisplayableTopic(topic: string): boolean {
  if (topic.startsWith('filter.')) return false;
  if (isLexisTopic(topic) && lexisTopicIgnoreDisplay(topic)) return false;
  return true;
}

export const TopicTag = ({ topic, className }: { topic: string; className?: string }) => {
  const { t } = useTranslation(['screeningTopics']);

  if (!isDisplayableTopic(topic)) {
    return null;
  }

  if (isOpenSanctionTopic(topic)) {
    return (
      <Tag color={openSanctionsTopicToColor(topic)} className={className}>
        {t(`screeningTopics:os.${topic}`, { defaultValue: topic })}
      </Tag>
    );
  }

  if (isLexisTopic(topic)) {
    return (
      <Tag color={lexisTopicToColor(topic)} className={className}>
        {t(`screeningTopics:lexis.${topic}`, { defaultValue: topic })}
      </Tag>
    );
  }

  return (
    <Tag color="grey" className={className}>
      {topic}
    </Tag>
  );
};
