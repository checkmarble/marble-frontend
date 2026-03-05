import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  SCORING_LEVELS_COLORS,
  SCORING_LEVELS_LABELS,
  ScoringSettings as ScoringSettingsModel,
} from '@app-builder/models/scoring';
import { useUpdateScoringSettingsMutation } from '@app-builder/queries/scoring/update-settings';
import { useState } from 'react';
import { Button, cn } from 'ui-design-system';

export const ScoringSettings = ({ settings }: { settings: ScoringSettingsModel | null }) => {
  return settings ? <ScoringSettingsDisplay settings={settings} /> : <ScoringSettingsForm />;
};

const ScoringSettingsDisplay = ({ settings }: { settings: ScoringSettingsModel }) => {
  return (
    <div className="bg-surface-card border border-grey-border rounded-v2-md p-v2-md flex gap-v2-md items-center">
      <span>Echelle de risque utilisée:</span>
      <div className="flex gap-v2-md items-center py-v2-sm px-v2-md bg-grey-background-light border border-grey-border rounded-full">
        <span>{settings.maxRiskLevel} niveaux de risque:</span>
        <ScoringLevels maxLevel={settings.maxRiskLevel} className="flex items-center gap-v2-md" />
      </div>
    </div>
  );
};

const ScoringSettingsForm = () => {
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
        <span>Define a risk scale, then choose the entity on which you want to create the ruleset.</span>
        <Button appearance="stroked" onClick={handleValidateScale} disabled={updateScoringSettingsMutation.isPending}>
          Valider l'échelle de risques
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-v2-md">
        {[3, 4, 5, 6].map((v) => (
          <ScoringScaleCard key={v} maxLevel={v} selected={maxRiskLevel === v} onSelect={() => setMaxRiskLevel(v)} />
        ))}
      </div>
    </div>
  );
};

type ScoringScaleCardProps = {
  maxLevel: number;
  selected: boolean;
  onSelect: () => void;
};

const ScoringScaleCard = ({ maxLevel, selected, onSelect }: ScoringScaleCardProps) => {
  return (
    <div
      className={cn(
        'bg-grey-background-light border border-grey-border p-v2-md rounded-v2-md flex flex-col gap-v2-md',
        {
          'bg-purple-background-light border-purple-primary': selected,
        },
      )}
      onClick={() => onSelect()}
    >
      <div>{maxLevel} levels of risk</div>
      <ScoringLevels maxLevel={maxLevel} className="flex flex-col gap-v2-md" />
    </div>
  );
};

const ScoringLevels = ({ maxLevel, className }: { maxLevel: number; className?: string }) => {
  if (!(maxLevel in SCORING_LEVELS_COLORS) || !(maxLevel in SCORING_LEVELS_LABELS)) {
    return null;
  }

  const scoringColors = SCORING_LEVELS_COLORS[maxLevel as keyof typeof SCORING_LEVELS_COLORS];
  const scoringLabels = SCORING_LEVELS_LABELS[maxLevel as keyof typeof SCORING_LEVELS_LABELS];

  return (
    <div className={cn('', className)}>
      {scoringColors.map((color, i) => (
        <div key={color} className="flex gap-v2-sm items-center">
          <div className="size-4 rounded-full" style={{ backgroundColor: color }} />
          <span>{scoringLabels[i]}</span>
        </div>
      ))}
    </div>
  );
};
