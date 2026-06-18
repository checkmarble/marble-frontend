import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  isMaxRiskLevelInRange,
  MAX_RISK_LEVELS,
  type MaxRiskLevel,
  SCORING_LEVELS_COLORS,
  SCORING_LEVELS_LABEL_KEYS,
  type ScoringSettings as ScoringSettingsModel,
  scoringLevelEntries,
} from '@app-builder/models/scoring';
import { useUpdateScoringSettingsMutation } from '@app-builder/queries/scoring/update-settings';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, cn } from 'ui-design-system';

export function ScoringSettings({ settings }: { settings: ScoringSettingsModel | null }) {
  return settings ? <ScoringSettingsDisplay settings={settings} /> : <ScoringSettingsForm />;
}

function ScoringSettingsDisplay({ settings }: { settings: ScoringSettingsModel }) {
  const { t } = useTranslation(['user-scoring']);
  return (
    <div className="bg-surface-card border border-grey-border rounded-md p-md flex gap-md items-center">
      <span>{t('user-scoring:settings.scale_used')}</span>
      <div className="flex gap-md items-center py-sm px-md bg-grey-background-light border border-grey-border rounded-full">
        <span>{t('user-scoring:settings.risk_levels_count', { count: settings.maxRiskLevel })}</span>
        <ScoringLevels maxLevel={settings.maxRiskLevel} className="flex items-center gap-md" />
      </div>
    </div>
  );
}

function ScoringSettingsForm() {
  const { t } = useTranslation(['user-scoring', 'common']);
  const [maxRiskLevel, setMaxRiskLevel] = useState(3);
  const updateScoringSettingsMutation = useUpdateScoringSettingsMutation();
  const revalidate = useLoaderRevalidator();

  const handleValidateScale = () => {
    updateScoringSettingsMutation
      .mutateAsync({ maxRiskLevel })
      .then(() => {
        revalidate();
      })
      .catch(() => {
        toast.error(t('common:errors.unknown'));
      });
  };

  return (
    <div className="bg-surface-card border border-grey-border rounded-md p-md flex flex-col gap-md">
      <div className="flex justify-between items-center">
        <span>{t('user-scoring:settings.define_scale')}</span>
        <Button appearance="stroked" onClick={handleValidateScale} disabled={updateScoringSettingsMutation.isPending}>
          {t('user-scoring:settings.validate_scale')}
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-md">
        {MAX_RISK_LEVELS.map((v) => (
          <ScoringScaleCard key={v} maxLevel={v} selected={maxRiskLevel === v} onSelect={() => setMaxRiskLevel(v)} />
        ))}
      </div>
    </div>
  );
}

type ScoringScaleCardProps = {
  maxLevel: MaxRiskLevel;
  selected: boolean;
  onSelect: () => void;
};

function ScoringScaleCard({ maxLevel, selected, onSelect }: ScoringScaleCardProps) {
  const { t } = useTranslation(['user-scoring']);
  return (
    <button
      type="button"
      className={cn(
        'bg-grey-background-light border border-grey-border p-md rounded-md flex flex-col gap-md text-left',
        {
          'bg-purple-background-light border-purple-primary': selected,
        },
      )}
      onClick={onSelect}
    >
      <div>{t('user-scoring:settings.levels', { count: maxLevel })}</div>
      <ScoringLevels maxLevel={maxLevel} className="flex flex-col gap-md" />
    </button>
  );
}

function ScoringLevels({ maxLevel, className }: { maxLevel: number; className?: string }) {
  const { t } = useTranslation(['user-scoring']);
  if (!isMaxRiskLevelInRange(maxLevel)) {
    return null;
  }

  const colorEntries = scoringLevelEntries(SCORING_LEVELS_COLORS[maxLevel]);
  const labelKeys = SCORING_LEVELS_LABEL_KEYS[maxLevel];

  return (
    <div className={cn(className)}>
      {colorEntries.map(([level, color]) => (
        <div key={level} className="flex gap-sm items-center">
          <div className="size-4 rounded-full" style={{ backgroundColor: color }} />
          <span>{t(labelKeys[level] ?? '')}</span>
        </div>
      ))}
    </div>
  );
}
