import { MONITORING_LIST_TOPICS, type MonitoringListTopic } from '@app-builder/models/astNode/monitoring-list-check';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

type FilterSectionProps = {
  currentTopics: MonitoringListTopic[];
  onTopicsChange: (topics: MonitoringListTopic[]) => void;
};

export function FilterSection({ currentTopics, onTopicsChange }: FilterSectionProps) {
  const { t } = useTranslation(['scenarios']);

  const [topicsFilterEnabled, setTopicsFilterEnabled] = useState(currentTopics.length > 0);

  const handleTopicsFilterToggle = (checked: boolean) => {
    setTopicsFilterEnabled(checked);
    if (!checked) {
      onTopicsChange([]);
    }
  };

  const handleTopicToggle = (topic: MonitoringListTopic, checked: boolean) => {
    if (checked) {
      onTopicsChange([...currentTopics, topic]);
    } else {
      onTopicsChange(currentTopics.filter((t) => t !== topic));
    }
  };

  const selectedTopicsDisplay = useMemo(() => {
    if (currentTopics.length === 0) return t('scenarios:monitoring_list_check.select_topics');
    return currentTopics.join(', ');
  }, [currentTopics, t]);

  const [topicsMenuOpen, setTopicsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-s font-medium text-grey-primary">{t('scenarios:monitoring_list_check.filter_question')}</p>

      {/* Topics Filter - Horizontal layout */}
      <div className="flex items-center gap-2">
        <label className="flex shrink-0 cursor-pointer items-center gap-2">
          <Checkbox checked={topicsFilterEnabled} onCheckedChange={handleTopicsFilterToggle} />
          <span className="text-s text-grey-primary">{t('scenarios:monitoring_list_check.topics_label')}</span>
          <Icon icon="tip" className="size-4 text-purple-primary" />
        </label>

        <MenuCommand.Menu open={topicsMenuOpen} onOpenChange={setTopicsMenuOpen}>
          <MenuCommand.Trigger>
            <MenuCommand.SelectButton className="min-w-[200px] flex-1" disabled={!topicsFilterEnabled}>
              <span className="truncate">{selectedTopicsDisplay}</span>
            </MenuCommand.SelectButton>
          </MenuCommand.Trigger>
          <MenuCommand.Content className="min-w-[250px]">
            <div className="flex flex-col gap-1 p-2">
              {MONITORING_LIST_TOPICS.map((topic) => (
                <label
                  key={topic}
                  className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-grey-background-light"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={currentTopics.includes(topic)}
                    onCheckedChange={(checked) => handleTopicToggle(topic, checked === true)}
                  />
                  <span className="text-s text-grey-primary">{topic}</span>
                </label>
              ))}
            </div>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      </div>
    </div>
  );
}
