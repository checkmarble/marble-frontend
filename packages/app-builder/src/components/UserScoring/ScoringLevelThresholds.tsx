import { SCORING_LEVELS_COLORS, SCORING_LEVELS_LABELS } from '@app-builder/models/scoring';
import { Input } from 'ui-design-system';

interface ScoringLevelThresholdsProps {
  maxRiskLevel: number;
  thresholds: number[];
  onThresholdsChange: (thresholds: number[]) => void;
}

export function ScoringLevelThresholds({ maxRiskLevel, thresholds, onThresholdsChange }: ScoringLevelThresholdsProps) {
  if (!(maxRiskLevel in SCORING_LEVELS_COLORS) || !(maxRiskLevel in SCORING_LEVELS_LABELS)) {
    return null;
  }

  const colors = SCORING_LEVELS_COLORS[maxRiskLevel as keyof typeof SCORING_LEVELS_COLORS];
  const labels = SCORING_LEVELS_LABELS[maxRiskLevel as keyof typeof SCORING_LEVELS_LABELS];

  const handleChange = (index: number, value: number) => {
    const next = [...thresholds];
    next[index] = value;
    onThresholdsChange(next);
  };

  return (
    <div className="flex flex-col gap-v2-sm">
      <span className="text-s font-medium text-grey-primary">Paramètres des scores</span>
      <div className="bg-surface-card border border-grey-border rounded-v2-md p-v2-md flex flex-col gap-v2-md">
        <span className="text-s text-grey-primary">Niveaux de risque :</span>
        {colors.map((color, i) => {
          const isFirst = i === 0;
          const isLast = i === maxRiskLevel - 1;
          const upperThreshold = thresholds[i];
          const lowerBound = i > 0 ? (thresholds[i - 1] ?? 0) + 1 : undefined;

          return (
            <div key={color} className="flex items-center gap-v2-sm">
              {/* Level name display */}
              <div className="flex items-center gap-v2-xs h-10 w-[195px] shrink-0 border border-grey-border rounded-sm px-2">
                <div className="size-4 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-s font-medium flex-1 min-w-0 truncate">{labels[i]}</span>
              </div>

              {isFirst ? (
                <>
                  <span className="text-s font-medium w-[30px] shrink-0 text-right">≤</span>
                  <Input
                    type="number"
                    className="flex-1"
                    value={upperThreshold ?? ''}
                    onChange={(e) => handleChange(i, Number(e.target.value))}
                  />
                </>
              ) : isLast ? (
                <>
                  <span className="text-s font-medium w-[30px] shrink-0 text-right">{'>'}</span>
                  <Input type="number" className="flex-1" value={lowerBound ?? ''} readOnly />
                </>
              ) : (
                <>
                  <span className="text-s text-grey-primary whitespace-nowrap shrink-0">entre</span>
                  <Input type="number" className="flex-1" value={lowerBound ?? ''} readOnly />
                  <span className="text-s text-grey-primary whitespace-nowrap shrink-0">et</span>
                  <Input
                    type="number"
                    className="flex-1"
                    value={upperThreshold ?? ''}
                    onChange={(e) => handleChange(i, Number(e.target.value))}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
