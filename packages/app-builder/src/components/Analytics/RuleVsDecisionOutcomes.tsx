import { Spinner } from '@app-builder/components/Spinner';
import { type DecisionsFilter, type Outcome, outcomeColors } from '@app-builder/models/analytics';
import { RuleVsDecisionOutcome } from '@app-builder/models/analytics/rule-vs-decision-outcome';
import { useFormatLanguage } from '@app-builder/utils/format';
import { type ComputedDatum, ResponsiveBar } from '@nivo/bar';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { OutcomeFilter } from './OutcomeFilter';

export function RuleVsDecisionOutcomes({
  data,
  isLoading = false,
}: {
  data: RuleVsDecisionOutcome[] | null;
  isLoading?: boolean;
}) {
  const { t } = useTranslation(['analytics']);
  const language = useFormatLanguage();

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
        ...(data?.map((rule) =>
          selectedOutcomes.reduce((acc, outcome) => acc + (rule[outcome] ?? 0), 0),
        ) ?? []),
      ),
    [data, selectedOutcomes],
  );

  const getBarColors = (d: ComputedDatum<RuleVsDecisionOutcome>) => {
    const id = String(d.id) as Outcome;
    return outcomeColors[id] ?? '#9ca3af';
  };

  const handleExportCsv = () => {
    if (!data || !data.length) return;
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
    const a = document.createElement('a');
    a.href = url;
    a.download = `rule_vs_decision_outcomes.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-v2-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-semibold">{t('analytics:rule_vs_decision_outcomes.title')}</h2>
        <ButtonV2
          variant="secondary"
          className="flex items-center gap-v2-sm"
          disabled={isLoading || !data?.length}
          onClick={handleExportCsv}
        >
          <Icon icon="download" className="size-4" />
          {t('analytics:decisions.export.button', 'Export CSV')}
        </ButtonV2>
      </div>

      <div
        className="bg-white border border-grey-90 rounded-lg p-v2-md shadow-sm mt-v2-sm flex flex-col"
        style={{ height: data?.length ? data.length * 42 + 120 : '48px' }}
      >
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-grey-98/80 hover:bg-grey-95/80">
            <Spinner className="size-6" />
          </div>
        ) : data?.length ? (
          <div className="flex flex-col gap-v2-md h-full">
            <div className="flex-1 w-full">
              <ResponsiveBar
                data={data ?? []}
                indexBy="rule"
                enableLabel={false}
                keys={selectedOutcomes}
                padding={0.5}
                margin={{ top: 8, right: 8, bottom: 42, left: 340 }}
                colors={getBarColors}
                layout="horizontal"
                valueScale={{ type: 'linear', min: 0, max: maxValueScale }}
                theme={{
                  axis: {
                    ticks: {
                      text: {
                        fontSize: '1rem',
                      },
                    },
                  },
                }}
                axisLeft={{
                  tickSize: 0,
                  tickPadding: 4,
                  truncateTickAt: 42,
                }}
                axisBottom={{
                  format: (value: number) =>
                    new Intl.NumberFormat(language, {
                      style: 'percent',
                      maximumFractionDigits: 0,
                    }).format((Number(value) || 0) / 100),
                  tickValues: maxValueScale
                    ? [
                        0,
                        maxValueScale / 4,
                        maxValueScale / 2,
                        (3 * maxValueScale) / 4,
                        maxValueScale,
                      ]
                    : undefined,
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
            <div className="flex w-full justify-center">
              <OutcomeFilter decisions={decisions} onChange={setDecisions} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-40">
            <span className="text-v2-md text-grey-80">{t('analytics:no_data')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
