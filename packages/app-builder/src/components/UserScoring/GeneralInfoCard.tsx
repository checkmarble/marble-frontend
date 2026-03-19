import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { ScenarioPublicationStatus } from '@app-builder/models/scenario/publication';
import {
  formatCooldown,
  SCORING_LEVELS_COLORS,
  SCORING_LEVELS_LABELS,
  type ScoringRulesetWithRules,
  type ScoringSettings,
} from '@app-builder/models/scoring';
import { useCommitScoringRulesetMutation } from '@app-builder/queries/scoring/commit-ruleset';
import { useListScoringRulesetVersionsQuery } from '@app-builder/queries/scoring/list-ruleset-versions';
import { usePrepareScoringRulesetMutation } from '@app-builder/queries/scoring/prepare-ruleset';
import { useFormatDateTime } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, type SelectOption, SelectV2 } from 'ui-design-system';

interface GeneralInfoCardProps {
  ruleset: ScoringRulesetWithRules;
  settings: ScoringSettings;
  preparationStatus: ScenarioPublicationStatus | null;
}

export function GeneralInfoCard({ ruleset, settings, preparationStatus }: GeneralInfoCardProps) {
  const { t } = useTranslation(['user-scoring']);
  const navigate = useAgnosticNavigation();
  const formatDateTime = useFormatDateTime();
  const prepareMutation = usePrepareScoringRulesetMutation();
  const commitMutation = useCommitScoringRulesetMutation();
  const cooldownLabel = formatCooldown(ruleset.cooldownSeconds);
  const versionsQuery = useListScoringRulesetVersionsQuery(ruleset.recordType);
  const versionOptions: SelectOption<string>[] = (versionsQuery.data?.versions ?? []).map((v) => ({
    value: v.status === 'committed' ? v.version.toString() : 'draft',
    label: v.status === 'committed' ? `V${v.version}` : 'draft',
  }));

  const handleVersionChange = (version: string) => {
    navigate(getRoute('/user-scoring/:recordType/:version', { recordType: ruleset.recordType, version }));
  };

  return (
    <div className="bg-surface-card border border-grey-border rounded-v2-md p-v2-md flex flex-col gap-v2-md">
      <div className="flex items-center justify-between gap-v2-sm">
        <div>
          <span className="text-h3 font-semibold text-grey-primary">{t('user-scoring:ruleset.title')}</span>
        </div>
        <div className="flex items-center gap-v2-sm">
          <SelectV2
            options={versionOptions}
            placeholder={t('user-scoring:ruleset.version_placeholder')}
            value={ruleset.status === 'draft' ? 'draft' : ruleset.version.toString()}
            onChange={handleVersionChange}
            variant="tag"
            menuClassName="min-w-30"
          />
          {preparationStatus ? (
            preparationStatus.status === 'required' ? (
              <Button
                disabled={
                  preparationStatus.serviceStatus === 'occupied' ||
                  prepareMutation.isPending ||
                  ruleset.rules.length === 0
                }
                onClick={() => prepareMutation.mutate(ruleset.recordType)}
              >
                {t('user-scoring:ruleset.prepare')}
              </Button>
            ) : (
              <Button
                disabled={commitMutation.isPending || ruleset.rules.length === 0}
                onClick={() => commitMutation.mutate(ruleset.recordType)}
              >
                {t('user-scoring:ruleset.commit')}
              </Button>
            )
          ) : null}
          {/*<button
            type="button"
            className="text-grey-secondary hover:text-grey-primary transition-colors"
            aria-label="Edit"
          >
            <Icon icon="edit" className="size-5" />
          </button>*/}
        </div>
      </div>

      <div className="flex items-center gap-v2-md text-s text-grey-secondary">
        <span>
          {t('user-scoring:ruleset.last_update')}{' '}
          <span className="text-grey-primary">
            {formatDateTime(ruleset.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </span>
        {cooldownLabel ? (
          <>
            <span className="text-grey-border">|</span>
            <span>
              {t('user-scoring:ruleset.cooldown')} <span className="text-grey-primary">{cooldownLabel}</span>
            </span>
          </>
        ) : null}
      </div>

      <RiskLevelBadges maxRiskLevel={settings.maxRiskLevel} thresholds={ruleset.thresholds} />
    </div>
  );
}

function RiskLevelBadges({ maxRiskLevel, thresholds }: { maxRiskLevel: number; thresholds: number[] }) {
  const { t } = useTranslation(['user-scoring']);
  if (!(maxRiskLevel in SCORING_LEVELS_COLORS) || !(maxRiskLevel in SCORING_LEVELS_LABELS)) {
    return null;
  }

  const colors = SCORING_LEVELS_COLORS[maxRiskLevel as keyof typeof SCORING_LEVELS_COLORS];
  const labels = SCORING_LEVELS_LABELS[maxRiskLevel as keyof typeof SCORING_LEVELS_LABELS];

  return (
    <div className="flex flex-col gap-v2-sm">
      <span className="text-s text-grey-secondary">{t('user-scoring:ruleset.risk_level')}</span>
      <div className="flex items-center gap-v2-sm">
        {colors.map((color, i) => {
          const isLast = i === maxRiskLevel - 1;
          return (
            <Fragment key={color}>
              <div className="flex items-center gap-v2-xs h-6 px-2 rounded-full border" style={{ borderColor: color }}>
                <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs text-grey-primary">{labels[i]}</span>
              </div>
              {!isLast ? (
                <span className="text-xs font-medium text-grey-placeholder">{`≤ ${thresholds[i]} <`}</span>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
