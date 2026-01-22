import { type MonitoringListHitType } from '@app-builder/models/astNode/monitoring-list-check';
import { type ScreeningCategory } from '@app-builder/models/screening';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

const SCREENING_CATEGORIES: ScreeningCategory[] = ['sanctions', 'peps', 'third-parties', 'adverse-media'];

type FilterSectionProps = {
  currentHitTypes: MonitoringListHitType[];
  onHitTypesChange: (hitTypes: MonitoringListHitType[]) => void;
};

export function FilterSection({ currentHitTypes, onHitTypesChange }: FilterSectionProps) {
  const { t } = useTranslation(['scenarios']);

  const [hitTypesFilterEnabled, setHitTypesFilterEnabled] = useState(currentHitTypes.length > 0);

  const hitTypeLabels = useMemo(
    () => ({
      sanctions: t('scenarios:monitoring_list_check.hit_type.sanctions'),
      peps: t('scenarios:monitoring_list_check.hit_type.peps'),
      'third-parties': t('scenarios:monitoring_list_check.hit_type.third_parties'),
      'adverse-media': t('scenarios:monitoring_list_check.hit_type.adverse_media'),
    }),
    [t],
  );

  const handleHitTypesFilterToggle = (checked: boolean) => {
    setHitTypesFilterEnabled(checked);
    if (!checked) {
      onHitTypesChange([]);
    }
  };

  const handleHitTypeToggle = (hitType: MonitoringListHitType, checked: boolean) => {
    if (checked) {
      onHitTypesChange([...currentHitTypes, hitType]);
    } else {
      onHitTypesChange(currentHitTypes.filter((h) => h !== hitType));
    }
  };

  const selectedHitTypesDisplay = useMemo(() => {
    if (currentHitTypes.length === 0) return t('scenarios:monitoring_list_check.select_hit_types');
    return currentHitTypes.map((ht) => hitTypeLabels[ht]).join(', ');
  }, [currentHitTypes, hitTypeLabels, t]);

  const [hitTypesMenuOpen, setHitTypesMenuOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-s font-medium text-grey-primary">{t('scenarios:monitoring_list_check.filter_question')}</p>

      {/* Hit Types Filter - Horizontal layout */}
      <div className="flex items-center gap-2">
        <label className="flex shrink-0 cursor-pointer items-center gap-2">
          <Checkbox checked={hitTypesFilterEnabled} onCheckedChange={handleHitTypesFilterToggle} />
          <span className="text-s text-grey-primary">{t('scenarios:monitoring_list_check.hit_types_label')}</span>
          <Icon icon="tip" className="size-4 text-purple-primary" />
        </label>

        <MenuCommand.Menu open={hitTypesMenuOpen} onOpenChange={setHitTypesMenuOpen}>
          <MenuCommand.Trigger>
            <MenuCommand.SelectButton className="min-w-[200px] flex-1" disabled={!hitTypesFilterEnabled}>
              <span className="truncate">{selectedHitTypesDisplay}</span>
            </MenuCommand.SelectButton>
          </MenuCommand.Trigger>
          <MenuCommand.Content className="min-w-[250px]">
            <div className="flex flex-col gap-1 p-2">
              {SCREENING_CATEGORIES.map((hitType) => (
                <label
                  key={hitType}
                  className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-grey-background-light"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={currentHitTypes.includes(hitType)}
                    onCheckedChange={(checked) => handleHitTypeToggle(hitType, checked === true)}
                  />
                  <span className="text-s text-grey-primary">{hitTypeLabels[hitType]}</span>
                </label>
              ))}
            </div>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      </div>
    </div>
  );
}
