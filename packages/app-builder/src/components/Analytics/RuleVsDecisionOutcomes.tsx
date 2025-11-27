import { Spinner } from '@app-builder/components/Spinner';
import { OUTCOME_COLORS } from '@app-builder/constants/analytics';
import { type DecisionsFilter, type Outcome } from '@app-builder/models/analytics';
import { RuleVsDecisionOutcome } from '@app-builder/models/analytics/rule-vs-decision-outcome';
import { downloadFile } from '@app-builder/utils/download-file';
import { formatPercentage, useFormatLanguage } from '@app-builder/utils/format';
import { type ComputedDatum, ResponsiveBar } from '@nivo/bar';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { OutcomeFilter } from './OutcomeFilter';
import { AnalyticsTooltip } from './Tooltip';

const handleExportCsv = (data: RuleVsDecisionOutcome[], decisions: DecisionsFilter) => {
  const headers = ['rule', ...decisions.keys(), 'total'];
  const lines = data.map((row) =>
    [
      row.rule,
      String(row.decline ?? 0),
      String(row.blockAndReview ?? 0),
      String(row.review ?? 0),
      String(row.approve ?? 0),
      String(row.total ?? 0),
    ].join(','),
  );
  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8,' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, `rule_vs_decision_outcomes.csv`);
};

export function RuleVsDecisionOutcomes({
  data,
  isLoading = false,
}: {
  data: RuleVsDecisionOutcome[] | null;
  isLoading?: boolean;
}) {
  const { t } = useTranslation(['analytics']);

  const [decisions, setDecisions] = useState<DecisionsFilter>(
    new Map([
      ['decline', true],
      ['blockAndReview', true],
      ['review', true],
      ['approve', true],
    ]),
  );

  const selectedOutcomes: Outcome[] = Array.from(decisions.entries())
    .filter(([, value]) => value)
    .map(([key]) => key);

  const maxValueScale = useMemo(
    () =>
      Math.max(
        ...(data?.map((rule) => selectedOutcomes.reduce((acc, outcome) => acc + (rule[outcome] ?? 0), 0)) ?? []),
      ),
    [data, selectedOutcomes],
  );

  const getBarColors = (d: ComputedDatum<RuleVsDecisionOutcome>) => {
    const id = String(d.id) as Outcome;
    return OUTCOME_COLORS[id] ?? '#9ca3af';
  };
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      className="bg-white border border-grey-border rounded-v2-lg p-v2-md flex flex-col gap-v2-sm"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-v2-sm">
          <h2 className="text-h2 font-semibold">{t('analytics:rule_vs_decision_outcomes.title')}</h2>
          <AnalyticsTooltip className="size-5" content={t('analytics:rule_vs_decision_outcomes.tooltip')} />
        </span>
        <ButtonV2
          variant="secondary"
          className="flex items-center gap-v2-sm"
          disabled={isLoading || !data?.length}
          onClick={() => data && handleExportCsv(data, decisions)}
        >
          <Icon icon="download" className="size-4" />
          {t('analytics:export.button')}
        </ButtonV2>
      </div>

      <div className="flex flex-col relative">
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-grey-98/80 hover:bg-grey-95/80">
            <Spinner className="size-6" />
          </div>
        ) : null}
        <div className="flex flex-col" style={{ height: data?.length ? data.length * 30 + 42 : '120px' }}>
          {data ? (
            <RulesVsDecisionsOutcomesGraph
              data={data}
              selectedOutcomes={selectedOutcomes}
              maxValueScale={maxValueScale}
              getBarColors={getBarColors}
            />
          ) : null}
        </div>
        <div className="flex w-full justify-center">
          <OutcomeFilter disabled={!data?.length} decisions={decisions} onChange={setDecisions} highlight={isHovered} />
        </div>
      </div>
    </div>
  );
}

type RulesVsDecisionsOutcomesGraphProps = {
  data: RuleVsDecisionOutcome[];
  selectedOutcomes: Outcome[];
  maxValueScale: number;
  getBarColors: (d: ComputedDatum<RuleVsDecisionOutcome>) => string;
};

const RulesVsDecisionsOutcomesGraph = ({
  data,
  selectedOutcomes,
  maxValueScale,
  getBarColors,
}: RulesVsDecisionsOutcomesGraphProps) => {
  const { t } = useTranslation(['analytics']);
  const language = useFormatLanguage();

  return data.length ? (
    <div className="flex flex-col gap-v2-md h-full">
      <div className="flex-1 w-full">
        <ResponsiveBar
          data={data ?? []}
          indexBy="rule"
          enableLabel={false}
          keys={selectedOutcomes}
          padding={0.6}
          margin={{ top: 0, right: 20, bottom: 42, left: 240 }}
          colors={getBarColors}
          layout="horizontal"
          valueScale={{ type: 'linear', min: 0, max: maxValueScale }}
          theme={{
            axis: {
              ticks: {
                text: {
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  fill: 'var(--color-grey-50)',
                },
              },
            },
            grid: {
              line: {
                stroke: 'var(--color-grey-90)',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              },
            },
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 26,
            truncateTickAt: 35,
          }}
          enableGridX
          gridXValues={[0, 25, 50, 75, 100]}
          axisBottom={{
            format: (value: number) => formatPercentage(value, language),
            tickValues: [0, 25, 50, 75, 100],
          }}
          tooltip={({ id, value, data }) => (
            <div className="flex flex-col gap-v2-xs w-auto max-w-max bg-white p-v2-sm rounded-lg border border-grey-90 shadow-sm whitespace-nowrap">
              <div className="flex items-center gap-v2-sm">
                <strong className="text-grey-00 font-semibold">
                  {String(id)}: {Number(value).toFixed(1)}%
                </strong>
              </div>
              <div className="text-s text-grey-60">{data.rule}</div>
            </div>
          )}
          motionConfig={{
            mass: 1,
            tension: 170,
            friction: 8,
            clamp: true,
            precision: 0.01,
            velocity: 0,
          }}
        />
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <span className="text-v2-md text-grey-80">{t('analytics:no_data')}</span>
    </div>
  );
};
