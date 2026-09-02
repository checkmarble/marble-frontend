import {
  SCORING_LEVELS_COLORS,
  SCORING_LEVELS_LABEL_KEYS,
  ScoringDryRun,
  ScoringDryRunDistributionItem,
  ScoringRulesetWithRules,
  ScoringSettings,
} from '@app-builder/models/scoring';
import { formatNumber, useFormatDateTime } from '@app-builder/utils/format';
import { ResponsivePie } from '@nivo/pie';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Card, Tag, Typo, useFormatLanguage } from 'ui-design-system';
import { Spinner } from '../Spinner';

interface ScoringBatchTestProps {
  ruleset: ScoringRulesetWithRules;
  settings: ScoringSettings;
  lastDryRun: ScoringDryRun | null;
}

export function ScoringBatchTest({ ruleset, settings, lastDryRun }: ScoringBatchTestProps) {
  const { t } = useTranslation(['user-scoring']);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();

  return (
    <Card className="grid gap-sm">
      <Typo variant="title2" className="flex items-center gap-sm p-md">
        {t('user-scoring:batch_test.title', { name: ruleset.name })}
        {match(lastDryRun)
          .with({ status: 'pending' }, () => <Tag color="orange">{t('user-scoring:batch_test.pending')}</Tag>)
          .with({ status: 'completed' }, () => <Tag color="purple">{t('user-scoring:batch_test.completed')}</Tag>)
          .with({ status: 'running' }, () => <Tag color="green">{t('user-scoring:batch_test.running')}</Tag>)
          .with({ status: 'cancelled' }, () => <Tag color="red">{t('user-scoring:batch_test.cancelled')}</Tag>)
          .otherwise(() => (
            <Spinner />
          ))}
      </Typo>
      <div className="flex gap-sm justify-between">
        <p className="text-grey-placeholder">
          {t('user-scoring:ruleset.batch_test.progress', {
            total: lastDryRun?.recordCount ?? 0,
            progress: formatNumber(lastDryRun?.progress ?? 0, { language, style: 'percent' }),
          })}
        </p>
        {lastDryRun?.createdAt ? <Tag color="grey">{formatDateTime(lastDryRun?.createdAt)}</Tag> : null}
      </div>
      <PieDistribution distribution={lastDryRun?.distribution ?? []} settings={settings} />
    </Card>
  );
}

function PieDistribution({
  distribution,
  settings,
}: {
  distribution: ScoringDryRunDistributionItem[];
  settings: ScoringSettings;
}) {
  const { t } = useTranslation(['user-scoring', 'common']);
  const language = useFormatLanguage();

  if (!distribution.length) return <PieSkeletton />;
  const maxRiskLevel = settings.maxRiskLevel as 3 | 4 | 5 | 6;
  const colors = SCORING_LEVELS_COLORS[maxRiskLevel];
  const labelKeys = SCORING_LEVELS_LABEL_KEYS[maxRiskLevel];

  const total = distribution.reduce((sum, item) => sum + item.count, 0);
  const pieData = distribution
    .filter((item) => item.count > 0)
    .map((item) => ({
      id: item.riskLevel,
      label: t(labelKeys[item.riskLevel] ?? item.riskLevel.toString()),
      value: item.count,
      color: colors[item.riskLevel] ?? '#ccc',
    }));
  return (
    <div className="flex gap-sm">
      <div className="flex flex-col gap-sm min-h-80">
        {pieData.map((item) => (
          <div key={item.id} className="flex items-center gap-xs">
            <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-xs font-medium text-grey-secondary">{item.label}</span>
          </div>
        ))}
      </div>
      <ResponsivePie
        data={pieData}
        innerRadius={0.7}
        padAngle={1}
        colors={{ datum: 'data.color' }}
        enableArcLabels={false}
        tooltip={({ datum }) => (
          <div className="flex items-center gap-xs bg-surface-card p-xs rounded-lg border border-grey-border shadow-sm text-s text-grey-primary whitespace-nowrap">
            <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: datum.color }} />
            {datum.label}: {datum.value} ({Math.round((datum.value / total) * 100)}%)
          </div>
        )}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        arcLinkLabel={(datum) =>
          formatNumber(datum.value / total, { language, style: 'percent', maximumFractionDigits: 1 })
        }
        activeOuterRadiusOffset={10}
        arcLinkLabelsStraightLength={0}
        arcLinkLabelsThickness={0}
      />
    </div>
  );
}

function PieSkeletton() {
  return (
    <div className="flex gap-sm animate-pulse">
      <div className="flex flex-col gap-sm min-h-80">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="w-8 h-4 bg-grey-placeholder rounded-xs "></div>
        ))}
      </div>
      <svg className="size-80 text-grey-placeholder mx-auto" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="14" fill="none" />
      </svg>
    </div>
  );
}
