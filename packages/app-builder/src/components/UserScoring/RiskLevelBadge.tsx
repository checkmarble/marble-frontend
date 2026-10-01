import { type MaxRiskLevel, SCORING_LEVELS_COLORS, SCORING_LEVELS_LABEL_KEYS } from '@app-builder/models/scoring';
import { type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

type RiskLevelBadgeProps = {
  riskLevel: number;
  maxRiskLevel: MaxRiskLevel;
  /** Makes the badge a button with a "view" affordance. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

/** Colored "Risk <level>" pill for a scored object. */
export function RiskLevelBadge({ riskLevel, maxRiskLevel, onClick }: RiskLevelBadgeProps) {
  const { t } = useTranslation(['cases', 'user-scoring']);

  const scoreColor = SCORING_LEVELS_COLORS[maxRiskLevel][riskLevel] ?? 'inherit';
  const scoreLabel = t(SCORING_LEVELS_LABEL_KEYS[maxRiskLevel][riskLevel] ?? riskLevel.toString());

  const className = 'inline-flex shrink-0 items-center gap-xs rounded-full border px-sm py-px text-xs';
  const style = { backgroundColor: `${scoreColor}20`, borderColor: scoreColor };
  const content = (
    <>
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: scoreColor }} />
      <span>
        {t('cases:manager.client.risk_label')} <strong>{scoreLabel}</strong>
      </span>
    </>
  );

  if (!onClick) {
    return (
      <span className={className} style={style}>
        {content}
      </span>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(className, 'cursor-pointer')} style={style}>
      {content}
      <Icon icon="visibility" className="size-3" />
    </button>
  );
}
