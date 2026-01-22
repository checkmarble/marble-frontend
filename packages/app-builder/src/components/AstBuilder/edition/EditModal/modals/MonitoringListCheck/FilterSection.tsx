import { type MonitoringListHitType } from '@app-builder/models/astNode/monitoring-list-check';
import { type ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';

const HIT_TYPES: MonitoringListHitType[] = ['sanctions', 'peps', 'third-parties', 'adverse-media'];
const ANY_CONFIG_VALUE = '__any__';

type FilterSectionProps = {
  screeningConfigs: ContinuousScreeningConfig[];
  currentScreeningConfigId: string | null;
  currentHitTypes: MonitoringListHitType[];
  onScreeningConfigChange: (configId: string | null) => void;
  onHitTypesChange: (hitTypes: MonitoringListHitType[]) => void;
};

export function FilterSection({
  screeningConfigs,
  currentScreeningConfigId,
  currentHitTypes,
  onScreeningConfigChange,
  onHitTypesChange,
}: FilterSectionProps) {
  const { t } = useTranslation(['scenarios']);

  // Track which filters are enabled
  const [configFilterEnabled, setConfigFilterEnabled] = useState(currentScreeningConfigId !== null);
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

  const handleConfigFilterToggle = (checked: boolean) => {
    setConfigFilterEnabled(checked);
    if (!checked) {
      onScreeningConfigChange(null);
    }
  };

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

  return (
    <div className="flex flex-col gap-6">
      <div className="text-s font-medium text-grey-primary">{t('scenarios:monitoring_list_check.filter_question')}</div>

      {/* Screening Config Filter */}
      <div className="flex flex-col gap-3">
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox checked={configFilterEnabled} onCheckedChange={handleConfigFilterToggle} />
          <span className="text-s text-grey-primary">
            {t('scenarios:monitoring_list_check.screening_config_label')}
          </span>
          <Icon icon="tip" className="size-4 text-grey-disabled" />
        </label>

        {configFilterEnabled && (
          <div className="ml-6">
            <Select.Root
              value={currentScreeningConfigId ?? ANY_CONFIG_VALUE}
              onValueChange={(value) => {
                onScreeningConfigChange(value === ANY_CONFIG_VALUE ? null : value);
              }}
            >
              <Select.Trigger className="w-full">
                <Select.Value placeholder={t('scenarios:monitoring_list_check.screening_config_placeholder')} />
              </Select.Trigger>
              <Select.Content>
                <Select.Viewport>
                  <Select.Item value={ANY_CONFIG_VALUE}>{t('scenarios:monitoring_list_check.any_config')}</Select.Item>
                  {screeningConfigs.map((config) => (
                    <Select.Item key={config.id} value={config.id}>
                      {config.name}
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Root>
          </div>
        )}
      </div>

      {/* Hit Types Filter */}
      <div className="flex flex-col gap-3">
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox checked={hitTypesFilterEnabled} onCheckedChange={handleHitTypesFilterToggle} />
          <span className="text-s text-grey-primary">{t('scenarios:monitoring_list_check.hit_types_label')}</span>
          <Icon icon="tip" className="size-4 text-grey-disabled" />
        </label>

        {hitTypesFilterEnabled && (
          <div className="ml-6">
            <Select.Root
              value={currentHitTypes.length > 0 ? currentHitTypes[0] : ''}
              onValueChange={() => {
                /* Handled by checkboxes below */
              }}
            >
              <Select.Trigger className="w-full">
                <span className="truncate">{selectedHitTypesDisplay}</span>
              </Select.Trigger>
              <Select.Content>
                <Select.Viewport>
                  <div className="flex flex-col gap-1 p-1">
                    {HIT_TYPES.map((hitType) => (
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
                </Select.Viewport>
              </Select.Content>
            </Select.Root>
          </div>
        )}
      </div>
    </div>
  );
}
