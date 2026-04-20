import { isMaxRiskLevelInRange, SCORING_LEVELS_COLORS, SCORING_LEVELS_LABELS } from '@app-builder/models/scoring';
import { useTranslation } from 'react-i18next';
import { Input, NumberInput } from 'ui-design-system';

interface ScoringLevelThresholdsProps {
  maxRiskLevel: number;
  thresholds: number[];
  onThresholdsChange: (thresholds: number[]) => void;
}

export function ScoringLevelThresholds({ maxRiskLevel, thresholds, onThresholdsChange }: ScoringLevelThresholdsProps) {
  const { t } = useTranslation(['user-scoring']);
  if (!isMaxRiskLevelInRange(maxRiskLevel)) {
    return null;
  }

  const colors = SCORING_LEVELS_COLORS[maxRiskLevel];
  const labels = SCORING_LEVELS_LABELS[maxRiskLevel];

  const handleChange = (index: number, value: number) => {
    const next = [...thresholds];
    next[index] = value;
    onThresholdsChange(next);
  };

  return (
    <div className="flex flex-col gap-v2-sm">
      <span className="text-s font-medium text-grey-primary">{t('user-scoring:thresholds.title')}</span>
      <div className="bg-surface-card border border-grey-border rounded-v2-md p-v2-md flex flex-col gap-v2-md">
        <span className="text-s text-grey-primary">{t('user-scoring:thresholds.risk_levels')}</span>
        {colors.map((color, i) => {
          const isFirst = i === 0;
          const isLast = i === maxRiskLevel - 1;
          const upperThreshold = thresholds[i];
          const lowerBound = i > 0 ? (thresholds[i - 1] ?? 0) + 1 : undefined;
          const hasError = i > 0 && !isLast && (upperThreshold ?? 0) <= (thresholds[i - 1] ?? 0);

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
                  <NumberInput
                    className="flex-1"
                    value={upperThreshold ?? 0}
                    onChange={(value) => handleChange(i, value)}
                  />
                </>
              ) : null}
              {isLast ? (
                <>
                  <span className="text-s font-medium w-[30px] shrink-0 text-right">{'>'}</span>
                  <Input className="flex-1" value={lowerBound ?? ''} readOnly />
                </>
              ) : null}
              {!isFirst && !isLast ? (
                <>
                  <span className="text-s text-grey-primary whitespace-nowrap shrink-0">
                    {t('user-scoring:thresholds.between')}
                  </span>
                  <Input className="flex-1" value={lowerBound ?? ''} readOnly />
                  <span className="text-s text-grey-primary whitespace-nowrap shrink-0">
                    {t('user-scoring:thresholds.and')}
                  </span>
                  <NumberInput
                    className="flex-1"
                    borderColor={hasError ? 'redfigma-47' : 'greyfigma-90'}
                    value={upperThreshold ?? 0}
                    onChange={(value) => handleChange(i, value)}
                  />
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
