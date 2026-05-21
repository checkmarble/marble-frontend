import {
  isLexisTopic,
  isOpenSanctionTopic,
  lexisTopicIgnoreDisplay,
  lexisTopicToColor,
  openSanctionsTopicToColor,
} from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';

export const TopicTag = ({ topic, className }: { topic: string; className?: string }) => {
  const { t } = useTranslation(['screeningTopics']);
  console.log(topic);

  if (topic.startsWith('filter.')) {
    return null;
  }

  if (isOpenSanctionTopic(topic)) {
    return (
      <Tag color={openSanctionsTopicToColor(topic)}>{t(`screeningTopics:os.${topic}`, { defaultValue: topic })}</Tag>
    );
  }

  if (isLexisTopic(topic)) {
    if (lexisTopicIgnoreDisplay(topic)) {
      return null;
    }
    return <Tag color={lexisTopicToColor(topic)}>{t(`screeningTopics:lexis.${topic}`, { defaultValue: topic })}</Tag>;
  }

  return (
    <Tag color="grey" className={className}>
      {topic}
    </Tag>
  );
};
