import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  isMaxRiskLevelInRange,
  MAX_RISK_LEVELS,
  MaxRiskLevel,
  SCORING_LEVELS_COLORS,
  SCORING_LEVELS_LABELS,
  type ScoringSettings as ScoringSettingsModel,
} from '@app-builder/models/scoring';
import { useUpdateScoringSettingsMutation } from '@app-builder/queries/scoring/update-settings';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn } from 'ui-design-system';

export function ScoringSettings({ settings }: { settings: ScoringSettingsModel | null }) {
  return settings ? <ScoringSettingsDisplay settings={settings} /> : <ScoringSettingsForm />;
}

function ScoringSettingsDisplay({ settings }: { settings: ScoringSettingsModel }) {
  const { t } = useTranslation(['user-scoring']);
  return (
    <div className="bg-surface-card border border-grey-border rounded-v2-md p-v2-md flex gap-v2-md items-center">
      <span>{t('user-scoring:settings.scale_used')}</span>
      <div className="flex gap-v2-md items-center py-v2-sm px-v2-md bg-grey-background-light border border-grey-border rounded-full">
        <span>{t('user-scoring:settings.risk_levels_count', { count: settings.maxRiskLevel })}</span>
        <ScoringLevels maxLevel={settings.maxRiskLevel} className="flex items-center gap-v2-md" />
      </div>
    </div>
  );
}

function ScoringSettingsForm() {
  const { t } = useTranslation(['user-scoring']);
  const [maxRiskLevel, setMaxRiskLevel] = useState(3);
  const updateScoringSettingsMutation = useUpdateScoringSettingsMutation();
  const revalidate = useLoaderRevalidator();

  const handleValidateScale = () => {
    updateScoringSettingsMutation.mutateAsync({ maxRiskLevel }).then(() => {
      revalidate();
    });
  };

  return (
    <div className="bg-surface-card border border-grey-border rounded-v2-md p-v2-md flex flex-col gap-v2-md">
      <div className="flex justify-between items-center">
        <span>{t('user-scoring:settings.define_scale')}</span>
        <Button appearance="stroked" onClick={handleValidateScale} disabled={updateScoringSettingsMutation.isPending}>
          {t('user-scoring:settings.validate_scale')}
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-v2-md">
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
        'bg-grey-background-light border border-grey-border p-v2-md rounded-v2-md flex flex-col gap-v2-md text-left',
        {
          'bg-purple-background-light border-purple-primary': selected,
        },
      )}
      onClick={onSelect}
    >
      <div>{t('user-scoring:settings.levels', { count: maxLevel })}</div>
      <ScoringLevels maxLevel={maxLevel} className="flex flex-col gap-v2-md" />
    </button>
  );
}

function ScoringLevels({ maxLevel, className }: { maxLevel: number; className?: string }) {
  if (!isMaxRiskLevelInRange(maxLevel)) {
    return null;
  }

  const scoringColors = SCORING_LEVELS_COLORS[maxLevel];
  const scoringLabels = SCORING_LEVELS_LABELS[maxLevel];

  return (
    <div className={cn(className)}>
      {scoringColors.map((color, i) => (
        <div key={color} className="flex gap-v2-sm items-center">
          <div className="size-4 rounded-full" style={{ backgroundColor: color }} />
          <span>{scoringLabels[i]}</span>
        </div>
      ))}
    </div>
  );
}
