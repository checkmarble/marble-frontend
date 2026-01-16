import { type MonitoringListHitType } from '@app-builder/models/astNode/monitoring-list-check';
import { type ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Select } from 'ui-design-system';

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

  const hitTypeLabels = useMemo(
    () => ({
      sanctions: t('scenarios:monitoring_list_check.hit_type.sanctions'),
      peps: t('scenarios:monitoring_list_check.hit_type.peps'),
      'third-parties': t('scenarios:monitoring_list_check.hit_type.third_parties'),
      'adverse-media': t('scenarios:monitoring_list_check.hit_type.adverse_media'),
    }),
    [t],
  );

  const handleHitTypeToggle = (hitType: MonitoringListHitType, checked: boolean) => {
    if (checked) {
      onHitTypesChange([...currentHitTypes, hitType]);
    } else {
      onHitTypesChange(currentHitTypes.filter((h) => h !== hitType));
    }
  };

  // Determine which filter mode is active
  const filterMode = currentScreeningConfigId ? 'config' : currentHitTypes.length > 0 ? 'hitTypes' : 'none';

  return (
    <div className="flex flex-col gap-4">
      <div className="text-s font-medium text-grey-primary">{t('scenarios:monitoring_list_check.filter_label')}</div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Screening Config Select */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-grey-secondary">
            {t('scenarios:monitoring_list_check.screening_config_label')}
          </label>
          <Select.Root
            value={currentScreeningConfigId ?? ANY_CONFIG_VALUE}
            onValueChange={(value) => {
              onScreeningConfigChange(value === ANY_CONFIG_VALUE ? null : value);
            }}
            disabled={filterMode === 'hitTypes'}
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

        {/* OR divider */}
        <div className="flex h-full items-center">
          <span className="text-s font-medium text-grey-disabled">{t('scenarios:monitoring_list_check.or')}</span>
        </div>

        {/* Hit Types Multi-select */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-grey-secondary">{t('scenarios:monitoring_list_check.hit_types_label')}</label>
          <div className="flex flex-col gap-1">
            {HIT_TYPES.map((hitType) => (
              <label
                key={hitType}
                className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-grey-background-light"
              >
                <Checkbox
                  checked={currentHitTypes.includes(hitType)}
                  onCheckedChange={(checked) => handleHitTypeToggle(hitType, checked === true)}
                  disabled={filterMode === 'config'}
                />
                <span className="text-s text-grey-primary">{hitTypeLabels[hitType]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
