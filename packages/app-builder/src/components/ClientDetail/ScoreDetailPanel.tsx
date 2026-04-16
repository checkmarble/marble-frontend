import { SCORING_LEVELS_COLORS, SCORING_LEVELS_LABELS, type ScoringSettings } from '@app-builder/models/scoring';
import { useGetScoringRulesetQuery } from '@app-builder/queries/scoring/get-ruleset';
import { useFormatDateTime } from '@app-builder/utils/format';
import { type ScoringScore } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { PanelContainer, PanelContent, PanelHeader, PanelRoot } from '../Panel';

interface ScoreDetailPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objectType: string;
  activeScore: ScoringScore;
  scoringSettings: ScoringSettings;
}

interface ScoreScaleProps {
  maxRiskLevel: 3 | 4 | 5 | 6;
  currentLevel: number;
  thresholds?: number[];
}

function ScoreScale({ maxRiskLevel, currentLevel, thresholds }: ScoreScaleProps) {
  const colors = SCORING_LEVELS_COLORS[maxRiskLevel];

  const proportional =
    thresholds && thresholds.length === maxRiskLevel - 1
      ? (() => {
          const minValue = thresholds[0]! >= 10 ? 0 : thresholds[0]! - 10;
          const maxValue = thresholds[thresholds.length - 1]! + 10;
          const totalRange = maxValue - minValue;
          const segmentWidths = colors.map((_, i) => {
            const segStart = i === 0 ? minValue : thresholds[i - 1]!;
            const segEnd = i === thresholds.length ? maxValue : thresholds[i]!;
            return ((segEnd - segStart) / totalRange) * 100;
          });
          const markerPositions = thresholds.map((v) => ((v - minValue) / totalRange) * 100);
          const segStart = currentLevel === 1 ? minValue : thresholds[currentLevel - 2]!;
          const segEnd = currentLevel > thresholds.length ? maxValue : thresholds[currentLevel - 1]!;
          const markerPct = (((segStart + segEnd) / 2 - minValue) / totalRange) * 100;
          return { segmentWidths, markerPositions, markerPct };
        })()
      : undefined;

  return (
    <div className="flex flex-col gap-v2-xs">
      <div className="relative h-6">
        <div className="flex w-full overflow-hidden rounded-lg gap-px mt-2">
          {colors.map((color, i) => (
            <div
              key={i}
              className="h-2"
              style={{
                backgroundColor: color,
                ...(proportional ? { width: `${proportional.segmentWidths[i]}%` } : { flex: 1 }),
              }}
            />
          ))}
        </div>
        {proportional ? (
          <div
            className="absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-sm"
            style={{
              left: `${proportional.markerPct}%`,
              backgroundColor: colors[currentLevel - 1],
            }}
          />
        ) : null}
      </div>
      {proportional ? (
        <div className="relative flex h-4 items-center mt-v2-xs">
          {thresholds!.map((value, i) => (
            <div
              key={i}
              className="absolute -translate-x-1/2 text-xs text-grey-secondary"
              style={{ left: `${proportional.markerPositions[i]}%` }}
            >
              {value}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ScoreDetailPanel({
  open,
  onOpenChange,
  objectType,
  activeScore,
  scoringSettings,
}: ScoreDetailPanelProps) {
  const { t } = useTranslation(['client360']);
  const formatDateTime = useFormatDateTime();
  const rulesetQuery = useGetScoringRulesetQuery(objectType);
  const thresholds = rulesetQuery.data?.ruleset.thresholds;

  const maxRiskLevel = scoringSettings.maxRiskLevel as 3 | 4 | 5 | 6;
  const scoreColor = SCORING_LEVELS_COLORS[maxRiskLevel][activeScore.risk_level - 1] ?? 'inherit';
  const scoreLabel =
    SCORING_LEVELS_LABELS[maxRiskLevel][activeScore.risk_level - 1] ?? activeScore.risk_level.toString();

  return (
    <PanelRoot open={open} onOpenChange={onOpenChange}>
      <PanelContainer size="lg" className="flex flex-col">
        <PanelHeader>{t('client360:client_detail.score_panel.title')}</PanelHeader>
        <div className="flex flex-wrap gap-v2-xs pb-v2-md">
          <Tag color="grey">{objectType}</Tag>
          <Tag color="grey">
            {t('client360:client_detail.score_panel.last_computed', {
              date: formatDateTime(activeScore.created_at, { dateStyle: 'medium' }),
            })}
          </Tag>
        </div>
        <PanelContent className="flex flex-col gap-v2-lg">
          {/* Risk level card */}
          <div
            className="flex items-center gap-v2-sm rounded-lg border p-v2-md"
            style={{ borderColor: scoreColor, backgroundColor: `${scoreColor}20` }}
          >
            <div className="size-4 shrink-0 rounded-full" style={{ backgroundColor: scoreColor }} />
            <span className="font-semibold">{scoreLabel}</span>
            {activeScore.source === 'override' && (
              <Tag color="grey">{t('client360:client_detail.score_panel.source_override')}</Tag>
            )}
          </div>

          {/* Score scale */}
          <div className="flex flex-col gap-v2-sm border border-grey-border rounded-v2-md p-v2-md">
            <span className="text-s font-medium text-grey-primary">
              {t('client360:client_detail.score_panel.score_scale')}
            </span>
            <ScoreScale maxRiskLevel={maxRiskLevel} currentLevel={activeScore.risk_level} thresholds={thresholds} />
          </div>
        </PanelContent>
      </PanelContainer>
    </PanelRoot>
  );
}
