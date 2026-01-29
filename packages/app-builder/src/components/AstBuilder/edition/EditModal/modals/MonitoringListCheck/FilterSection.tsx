import { SCREENING_CATEGORY_I18N_KEY_MAP, type ScreeningCategory } from '@app-builder/models/screening';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

/**
 * The available screening categories for monitoring list checks.
 * Order matters for display.
 */
const SCREENING_CATEGORIES: ScreeningCategory[] = ['sanctions', 'peps', 'third-parties', 'adverse-media'];

type FilterSectionProps = {
  selectedTopics: ScreeningCategory[];
  onTopicsChange: (topics: ScreeningCategory[]) => void;
};

export function FilterSection({ selectedTopics, onTopicsChange }: FilterSectionProps) {
  const { t } = useTranslation(['scenarios']);

  const [filterEnabled, setFilterEnabled] = useState(selectedTopics.length > 0);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleFilterToggle = (checked: boolean) => {
    setFilterEnabled(checked);
    if (!checked) {
      onTopicsChange([]);
    }
  };

  const handleTopicToggle = (topic: ScreeningCategory, checked: boolean) => {
    if (checked) {
      onTopicsChange([...selectedTopics, topic]);
    } else {
      onTopicsChange(selectedTopics.filter((t) => t !== topic));
    }
  };

  const selectedTopicsDisplay = useMemo(() => {
    if (selectedTopics.length === 0) {
      return t('scenarios:monitoring_list_check.select_hit_types');
    }
    return selectedTopics
      .map((topic) => t(`scenarios:monitoring_list_check.hit_type.${SCREENING_CATEGORY_I18N_KEY_MAP[topic]}`))
      .join(', ');
  }, [selectedTopics, t]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-s font-medium text-grey-primary">{t('scenarios:monitoring_list_check.filter_question')}</p>

      {/* Horizontal layout: Checkbox + label on left, dropdown on right */}
      <div className="flex items-center gap-2">
        {/* Left side: Checkbox + Hit types label + info icon */}
        <label className="flex shrink-0 cursor-pointer items-center gap-2">
          <Checkbox checked={filterEnabled} onCheckedChange={handleFilterToggle} />
          <span className="text-s text-grey-primary">{t('scenarios:monitoring_list_check.hit_types_label')}</span>
          <Icon icon="tip" className="size-5 text-purple-primary" />
        </label>

        {/* Right side: MenuCommand dropdown for topic selection */}
        <MenuCommand.Menu open={menuOpen} onOpenChange={setMenuOpen}>
          <MenuCommand.Trigger>
            <MenuCommand.SelectButton className="flex-1" disabled={!filterEnabled}>
              <span className="truncate">{selectedTopicsDisplay}</span>
            </MenuCommand.SelectButton>
          </MenuCommand.Trigger>
          <MenuCommand.Content className="min-w-[250px]">
            <div className="flex flex-col gap-1 p-2">
              {SCREENING_CATEGORIES.map((topic) => (
                <label
                  key={topic}
                  className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-grey-02"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedTopics.includes(topic)}
                    onCheckedChange={(checked) => handleTopicToggle(topic, checked === true)}
                  />
                  <span className="text-s text-grey-primary">
                    {t(`scenarios:monitoring_list_check.hit_type.${SCREENING_CATEGORY_I18N_KEY_MAP[topic]}`)}
                  </span>
                </label>
              ))}
            </div>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      </div>
    </div>
  );
}
