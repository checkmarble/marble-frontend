import { SCORING_LEVELS_COLORS, SCORING_LEVELS_LABEL_KEYS } from '@app-builder/models/scoring';
import { useScoreLatestQuery } from '@app-builder/queries/scoring/get-score-latest';
import { useScoringSettingsQuery } from '@app-builder/queries/scoring/get-scoring-settings';
import { isAccessible } from '@app-builder/services/feature-access';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';
import { ScoreDetailPanel } from '../../ClientDetail/ScoreDetailPanel';

type UserScoreBadgeProps = {
  objectType: string;
  objectId: string;
  userScoringAccess: FeatureAccessLevelDto;
};

export function UserScoreBadge({ objectType, objectId, userScoringAccess }: UserScoreBadgeProps) {
  const { t } = useTranslation(['cases', 'user-scoring']);
  const [panelOpen, setPanelOpen] = useState(false);
  const settingsQuery = useScoringSettingsQuery();
  const scoreQuery = useScoreLatestQuery(objectType, objectId);

  if (!isAccessible(userScoringAccess)) return null;

  const settings = settingsQuery.data?.settings;
  const score = scoreQuery.data?.score;
  if (!settings || !score) return null;

  const maxRiskLevel = settings.maxRiskLevel as 3 | 4 | 5 | 6;
  const scoreColor = SCORING_LEVELS_COLORS[maxRiskLevel][score.risk_level] ?? 'inherit';
  const scoreLabel = t(SCORING_LEVELS_LABEL_KEYS[maxRiskLevel][score.risk_level] ?? score.risk_level.toString());

  return (
    <>
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="inline-flex items-center gap-xs rounded-md border px-sm py-xs text-small cursor-pointer"
        style={{ backgroundColor: `${scoreColor}20`, borderColor: scoreColor }}
      >
        <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: scoreColor }} />
        <span>{t('cases:manager.client.risk_label')}</span>
        <span className="font-medium">{scoreLabel}</span>
        <Icon icon="visibility" className="size-4" />
      </button>
      <ScoreDetailPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        objectType={objectType}
        activeScore={score}
        scoringSettings={settings}
      />
    </>
  );
}
