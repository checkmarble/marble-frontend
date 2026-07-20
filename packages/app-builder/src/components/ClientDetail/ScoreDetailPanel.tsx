import { Panel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { SwitchNodeView } from '@app-builder/components/UserScoring/SwitchNode/SwitchNodeView';
import { type CustomList } from '@app-builder/models/custom-list';
import {
  isMaxRiskLevelInRange,
  type MatchedScoreRule,
  matchScoreEvaluationsToRules,
  RISK_TYPES,
  SCORING_LEVELS_COLORS,
  SCORING_LEVELS_LABEL_KEYS,
  type ScoringSettings,
  scoringLevelEntries,
} from '@app-builder/models/scoring';
import { useGetCustomListsQuery } from '@app-builder/queries/get-custom-lists';
import { useGetScoringRulesetQuery } from '@app-builder/queries/scoring/get-ruleset';
import { useDataModel } from '@app-builder/services/data/data-model';
import { useFormatDateTime } from '@app-builder/utils/format';
import { type ScoringScore } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { Tag, Typo } from 'ui-design-system';

interface ScoreDetailPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objectType: string;
  activeScore: ScoringScore;
  scoringSettings: ScoringSettings;
}

export function ScoreDetailPanel({
  open,
  onOpenChange,
  objectType,
  activeScore,
  scoringSettings,
}: ScoreDetailPanelProps) {
  const { t } = useTranslation(['client360', 'user-scoring']);
  const formatDateTime = useFormatDateTime();
  const rulesetQuery = useGetScoringRulesetQuery(objectType);
  const thresholds = rulesetQuery.data?.ruleset.thresholds;

  const maxRiskLevel = scoringSettings.maxRiskLevel as 3 | 4 | 5 | 6;
  const scoreColor = SCORING_LEVELS_COLORS[maxRiskLevel][activeScore.risk_level] ?? 'inherit';
  const scoreLabel = t(
    SCORING_LEVELS_LABEL_KEYS[maxRiskLevel][activeScore.risk_level] ?? activeScore.risk_level.toString(),
  );

  return (
    <Panel.Root open={open} onOpenChange={onOpenChange}>
      <Panel.Container size="small">
        <Panel.Content className="flex flex-col gap-lg">
          <Panel.Header>
            <div className="flex flex-col">
              <div className="flex flex-wrap gap-xs">
                <Typo variant="title2">{t('client360:client_detail.score_panel.title')}</Typo>
                <Tag color="grey">{objectType}</Tag>
                <Tag color="grey">
                  {t('client360:client_detail.score_panel.last_computed', {
                    date: formatDateTime(activeScore.created_at, { dateStyle: 'medium' }),
                  })}
                </Tag>
              </div>
            </div>
          </Panel.Header>
          {/* Risk level card */}
          <div
            className="flex items-center gap-sm rounded-lg border p-md"
            style={{ borderColor: scoreColor, backgroundColor: `${scoreColor}20` }}
          >
            <div className="size-4 shrink-0 rounded-full" style={{ backgroundColor: scoreColor }} />
            <span className="font-semibold">{scoreLabel}</span>
            {activeScore.source === 'override' && (
              <Tag color="grey">{t('client360:client_detail.score_panel.source_override')}</Tag>
            )}
          </div>

          {/* Score scale */}
          <div className="flex flex-col gap-sm border border-grey-border rounded-md p-md">
            <span className="text-s font-medium text-grey-primary">
              {t('client360:client_detail.score_panel.score_scale')}
            </span>
            <ScoreScale maxRiskLevel={maxRiskLevel} currentLevel={activeScore.risk_level} thresholds={thresholds} />
          </div>
          {activeScore.source === 'ruleset' && activeScore.evaluations && activeScore.evaluations.length > 0 ? (
            <ScoreEvaluationBreakdown activeScore={activeScore} objectType={objectType} maxRiskLevel={maxRiskLevel} />
          ) : null}
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}

interface ScoreScaleProps {
  maxRiskLevel: 3 | 4 | 5 | 6;
  currentLevel: number;
  thresholds?: number[];
}

function ScoreScale({ maxRiskLevel, currentLevel, thresholds }: ScoreScaleProps) {
  const colorMap = SCORING_LEVELS_COLORS[maxRiskLevel];
  const colorEntries = scoringLevelEntries(colorMap);

  const proportional =
    thresholds && thresholds.length === maxRiskLevel - 1
      ? (() => {
          const minValue = thresholds[0]! > 10 ? thresholds[0]! - 10 : 0;
          const maxValue = thresholds[thresholds.length - 1]! + 10;
          const totalRange = maxValue - minValue;
          const showZeroLabel = thresholds[0]! !== 0;
          const zeroLabelPct = ((0 - minValue) / totalRange) * 100;
          const segmentWidths = colorEntries.map((_, i) => {
            const segStart = i === 0 ? minValue : thresholds[i - 1]!;
            const segEnd = i === thresholds.length ? maxValue : thresholds[i]!;
            return ((segEnd - segStart) / totalRange) * 100;
          });
          const markerPositions = thresholds.map((v) => ((v - minValue) / totalRange) * 100);
          // currentLevel is 1-based
          const segStart = currentLevel <= 1 ? minValue : thresholds[currentLevel - 2]!;
          const segEnd = currentLevel > thresholds.length ? maxValue : thresholds[currentLevel - 1]!;
          const markerPct = (((segStart + segEnd) / 2 - minValue) / totalRange) * 100;

          // Build all labels (0 + thresholds) sorted by position, then stagger when too close
          const allLabels: Array<{ value: string; pct: number; staggered: boolean }> = [];
          if (showZeroLabel) {
            allLabels.push({ value: '0', pct: zeroLabelPct, staggered: false });
          }
          for (let i = 0; i < thresholds.length; i++) {
            allLabels.push({ value: String(thresholds[i]), pct: markerPositions[i]!, staggered: false });
          }
          allLabels.sort((a, b) => a.pct - b.pct);
          const minGap = 5; // % of total bar width
          for (let i = 1; i < allLabels.length; i++) {
            if (allLabels[i]!.pct - allLabels[i - 1]!.pct < minGap) {
              // Stagger if the previous wasn't already staggered; otherwise keep on the same row
              allLabels[i]!.staggered = !allLabels[i - 1]!.staggered;
            }
          }

          return { segmentWidths, markerPositions, markerPct, showZeroLabel, zeroLabelPct, allLabels };
        })()
      : undefined;

  return (
    <div className="flex flex-col gap-xs">
      <div className="relative h-6">
        <div className="relative flex w-full overflow-hidden rounded-lg gap-px mt-sm">
          {colorEntries.map(([level, color], i) => (
            <div
              key={level}
              className="h-2"
              style={{
                backgroundColor: color,
                ...(proportional ? { width: `${proportional.segmentWidths[i]}%` } : { flex: 1 }),
              }}
            />
          ))}
          {proportional?.showZeroLabel ? (
            <div className="absolute inset-y-0 w-px bg-white" style={{ left: `${proportional.zeroLabelPct}%` }} />
          ) : null}
        </div>
        {proportional ? (
          <div
            className="absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-sm"
            style={{
              left: `${proportional.markerPct}%`,
              backgroundColor: colorMap[currentLevel],
            }}
          />
        ) : null}
      </div>
      {proportional ? (
        <div className="relative mt-xs" style={{ height: proportional.allLabels.some((l) => l.staggered) ? 32 : 16 }}>
          {proportional.allLabels.map((label) => (
            <div
              key={label.value}
              className="absolute text-xs text-grey-secondary"
              style={{
                left: `${label.pct}%`,
                top: label.staggered ? 16 : 0,
                ...(label.pct > 0 && { transform: 'translateX(-50%)' }),
              }}
            >
              {label.value}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MatchedRuleCard({
  matched,
  objectType,
  maxRiskLevel,
  customLists,
}: {
  matched: MatchedScoreRule;
  objectType: string;
  maxRiskLevel: number;
  customLists: CustomList[];
}) {
  const { t } = useTranslation(['user-scoring', 'client360']);
  const dataModel = useDataModel();
  const { rule, impact, appliedModifier, matchedBranchIndex } = matched;
  // Switch return_value is the applied score; impact/floor only when branch match succeeded
  const modifier = appliedModifier ?? (matchedBranchIndex !== null ? (impact?.modifier ?? null) : null);
  const floor = matchedBranchIndex !== null ? impact?.floor : undefined;
  const floorColors = isMaxRiskLevelInRange(maxRiskLevel) ? SCORING_LEVELS_COLORS[maxRiskLevel] : {};

  return (
    <div className="flex flex-col gap-sm border border-grey-border rounded-md p-md">
      <div className="flex items-start justify-between gap-md">
        <div className="flex min-w-0 flex-wrap items-center gap-xs">
          <span className="text-s font-medium text-grey-primary">{rule.name}</span>
          {rule.riskType && (RISK_TYPES as readonly string[]).includes(rule.riskType) ? (
            <Tag color="grey">{t(`user-scoring:risk_type.${rule.riskType as (typeof RISK_TYPES)[number]}`)}</Tag>
          ) : rule.riskType ? (
            <Tag color="grey">{rule.riskType}</Tag>
          ) : null}
        </div>
        {modifier ? (
          <Tag color="purple" className="flex items-center gap-xs">
            <span>{t('client360:client_detail.score_panel.score_modifier')}</span>
            <span>
              {modifier > 0 ? '+' : ''}
              {modifier}
            </span>
            {floor !== undefined ? (
              <span className="flex items-center gap-xs">
                {t('user-scoring:switch.floor_label')}
                <span className="size-3 rounded-full" style={{ backgroundColor: floorColors[floor] }} />
              </span>
            ) : null}
          </Tag>
        ) : (
          <div>
            <Tag color="grey">{t('client360:client_detail.score_panel.no_modification')}</Tag>
          </div>
        )}
      </div>
      <SwitchNodeView
        node={rule.ast}
        dataModel={dataModel}
        entityType={objectType}
        maxRiskLevel={maxRiskLevel}
        customLists={customLists}
        matchedBranchIndex={matchedBranchIndex}
      />
    </div>
  );
}

function ScoreEvaluationBreakdown({
  activeScore,
  objectType,
  maxRiskLevel,
}: {
  activeScore: ScoringScore;
  objectType: string;
  maxRiskLevel: number;
}) {
  const { t } = useTranslation(['client360']);
  const dataModel = useDataModel();
  const rulesetQuery = useGetScoringRulesetQuery(objectType);
  const customListsQuery = useGetCustomListsQuery();

  if (rulesetQuery.isPending || customListsQuery.isPending) {
    return (
      <div className="flex flex-col gap-sm border border-grey-border rounded-md p-md">
        <span className="text-s font-medium text-grey-primary">
          {t('client360:client_detail.score_panel.applied_rules')}
        </span>
        <div className="flex justify-center py-md">
          <Spinner className="size-6" />
        </div>
      </div>
    );
  }

  if (!rulesetQuery.data || !customListsQuery.data || !activeScore.evaluations) {
    return (
      <div className="flex flex-col gap-sm border border-grey-border rounded-md p-md">
        <span className="text-s font-medium text-grey-primary">
          {t('client360:client_detail.score_panel.applied_rules')}
        </span>
        <p className="text-s text-grey-secondary">{t('client360:client_detail.score_panel.evaluation_unavailable')}</p>
      </div>
    );
  }

  const matchResult = matchScoreEvaluationsToRules(
    activeScore.evaluations,
    rulesetQuery.data.ruleset.rules,
    objectType,
    dataModel,
  );

  if (!matchResult.ok) {
    return (
      <div className="flex flex-col gap-sm border border-grey-border rounded-md p-md">
        <span className="text-s font-medium text-grey-primary">
          {t('client360:client_detail.score_panel.applied_rules')}
        </span>
        <p className="text-s text-grey-secondary">{t('client360:client_detail.score_panel.evaluation_unavailable')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sm">
      <span className="text-s font-medium text-grey-primary">
        {t('client360:client_detail.score_panel.applied_rules')}
      </span>
      {matchResult.rules.map((matched) => (
        <MatchedRuleCard
          key={matched.rule.stableId}
          matched={matched}
          objectType={objectType}
          maxRiskLevel={maxRiskLevel}
          customLists={customListsQuery.data}
        />
      ))}
    </div>
  );
}
