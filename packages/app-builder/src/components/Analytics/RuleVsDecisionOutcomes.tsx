import { Spinner } from '@app-builder/components/Spinner';
import {
  type DecisionOutcomes,
  type DecisionsFilter,
  type Outcome,
  outcomeColors,
  type RuleVsDecisionOutcome,
} from '@app-builder/models/analytics';
import { useFormatLanguage } from '@app-builder/utils/format';
import { type ComputedDatum, ResponsiveBar } from '@nivo/bar';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { OutcomeFilter } from './OutcomeFilter';

type DecisionOutcomesRow = {
  rule: string;
  approve: number;
  review: number;
  blockAndReview: number;
  decline: number;
  total: number;
};

export function RuleVsDecisionOutcomes({
  data,
  isLoading = false,
}: {
  // Be flexible here because the transport may serialize Map as object
  data: RuleVsDecisionOutcome | Record<string, DecisionOutcomes> | null;
  isLoading?: boolean;
}) {
  const { t } = useTranslation(['analytics']);
  const language = useFormatLanguage();

  const defaultDecisions: DecisionsFilter = useMemo(
    () =>
      new Map<Outcome, boolean>([
        ['decline', true],
        ['blockAndReview', true],
        ['review', true],
        ['approve', true],
      ]),
    [],
  );
  const [decisions, setDecisions] = useState<DecisionsFilter>(defaultDecisions);

  const fixedOrder: Outcome[] = useMemo(
    () => ['decline', 'blockAndReview', 'review', 'approve'],
    [],
  );

  const rows: DecisionOutcomesRow[] = useMemo(() => {
    if (!data) return [];

    // Normalize either Map<string, DecisionOutcomes> or Record<string, DecisionOutcomes>
    const entries: Array<readonly [string, any]> =
      data instanceof Map ? Array.from(data.entries()) : Object.entries(data);

    return entries.map(([ruleName, v]) => ({
      rule: ruleName,
      approve: Number(v.approve ?? 0),
      review: Number(v.review ?? 0),
      blockAndReview: Number(v.block_and_review ?? v.blockAndReview ?? 0),
      decline: Number(v.decline ?? 0),
      total: Number(v.total ?? 0),
    }));
  }, [data]);

  const selectedKeys = useMemo(
    () => fixedOrder.filter((k) => decisions.get(k)),
    [fixedOrder, decisions],
  );

  // Adaptive chart height: keep each rule bar thin, and overall height small when few rows
  const perRowHeightPx = 20; // thin bars similar to the wireframe
  const minHeightPx = 120; // small when few rules
  const chartHeight = Math.max(rows.length * perRowHeightPx, minHeightPx);

  const getBarColors = (d: ComputedDatum<DecisionOutcomesRow>) => {
    const id = String(d.id) as Outcome;
    return outcomeColors[id] ?? '#9ca3af';
  };

  const handleExportCsv = () => {
    if (!rows.length) return;
    const headers = ['rule', ...fixedOrder, 'total'];
    const lines = rows.map((row) =>
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
        <h2 className="text-h2 font-semibold">Rule vs Decision outcomes</h2>
        <ButtonV2
          variant="secondary"
          className="flex items-center gap-v2-sm"
          disabled={isLoading || rows.length === 0}
          onClick={handleExportCsv}
        >
          <Icon icon="download" className="size-4" />
          {t('analytics:decisions.export.button', 'Export CSV')}
        </ButtonV2>
      </div>

      <div
        aria-busy={isLoading}
        className="bg-white border border-grey-90 rounded-lg p-v2-md shadow-sm mt-v2-sm relative"
      >
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-grey-98/80 hover:bg-grey-95/80">
            <Spinner className="size-6" />
          </div>
        ) : null}

        <div className="flex w-full flex-col items-start gap-v2-md">
          <div className="w-full" style={{ height: chartHeight }}>
            <ResponsiveBar
              data={rows}
              indexBy="rule"
              enableLabel={false}
              keys={selectedKeys}
              padding={0.5}
              margin={{ top: 5, right: 16, bottom: 24, left: 260 }}
              colors={getBarColors}
              layout="horizontal"
              valueScale={{ type: 'linear', min: 0, max: 100 }}
              axisLeft={{}}
              axisBottom={{
                format: (value: number) =>
                  new Intl.NumberFormat(language, {
                    style: 'percent',
                    maximumFractionDigits: 0,
                  }).format((Number(value) || 0) / 100),
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
          <div className="flex w-full justify-center">
            <OutcomeFilter decisions={decisions} onChange={setDecisions} />
          </div>
        </div>
      </div>
    </div>
  );
}
