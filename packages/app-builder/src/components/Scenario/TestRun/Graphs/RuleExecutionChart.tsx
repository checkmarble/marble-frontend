import { useMemo, useState } from 'react';
import { toggle } from 'radash';
import { Button, RadioGroup, RadioGroupItem } from 'ui-design-system';
import clsx from 'clsx';
import { entries, unique, groupBy, mapValues, omit, sumBy } from 'remeda';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';
import {
  TestRunRuleExecution,
  TestRunRuleStatus,
} from '@app-builder/models/testrun';
import { VersionSummary } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/test-run+/$testRunId';

type Type = 'absolute' | 'percentage';
type Summary = { total: number } & Partial<{
  [status in TestRunRuleStatus]: number;
}>;

const SanKey = ({
  version,
  summary,
  type,
  legend,
}: {
  version: string;
  type: Type;
  summary: Summary;
  legend: TestRunRuleStatus[];
}) => {
  const pairs = useMemo(
    () =>
      entries(omit(summary, ['total'])).filter(([status]) =>
        legend.includes(status),
      ),
    [summary, legend],
  );

  return (
    <div className="flex size-full flex-col items-center gap-4">
      <span className="text-xs font-medium uppercase">{version}</span>
      <div className="flex size-full flex-col gap-1">
        {pairs.length === 0 ? (
          <div className="border-grey-10 size-full rounded-lg border-2" />
        ) : (
          pairs.map(([status, count]) => (
            <div
              key={status}
              style={{
                flexBasis: `${Math.round((count * 100) / summary.total)}%`,
              }}
              className={clsx(
                'flex min-h-[24px] w-full shrink grow flex-row items-center justify-center rounded-[4px]',
                {
                  'bg-green-10': status === 'hit',
                  'bg-grey-10': status === 'no_hit',
                  'bg-red-10': status === 'error',
                  'bg-[#AAA6CC]': status === 'snoozed',
                },
              )}
            >
              <span className="text-s text-grey-100 font-medium">
                {type === 'percentage'
                  ? `${Math.round((count * 100) / summary.total)}%`
                  : count}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const RuleExecutionChart = ({
  rules,
  versionSummary,
}: {
  rules: TestRunRuleExecution[];
  versionSummary: VersionSummary;
}) => {
  const { t } = useTranslation(['scenarios', 'decisions']);

  const statuses = useMemo(() => unique(rules.map((d) => d.status)), [rules]);

  const [type, setTytpe] = useState<Type>('percentage');
  const [legend, updateLegend] = useState<TestRunRuleStatus[]>(statuses);

  const summaryByVersions = useMemo(
    () =>
      mapValues(
        groupBy(rules, (d) => d.version),
        (rulesByVersion) => ({
          total: sumBy(rulesByVersion, (d) => d.total),
          ...mapValues(
            groupBy(rulesByVersion, (d) => d.status),
            (dbvao) => sumBy(dbvao, (d) => d.total),
          ),
        }),
      ),
    [rules],
  );

  return (
    <div className="flex flex-col gap-8">
      <RadioGroup onValueChange={(type) => setTytpe(type as Type)} value={type}>
        <RadioGroupItem value="absolute">
          {t('scenarios:testrun.distribution.absolute')}
        </RadioGroupItem>
        <RadioGroupItem value="percentage">
          {t('scenarios:testrun.distribution.percentage')}
        </RadioGroupItem>
      </RadioGroup>
      <div className="flex h-60 w-full flex-row items-center justify-center gap-4 px-8">
        <SanKey
          type={type}
          legend={legend}
          version={versionSummary.ref.version}
          summary={summaryByVersions[versionSummary.ref.version] as Summary}
        />
        <Icon icon="arrow-forward" className="text-grey-100 h-4" />
        <SanKey
          type={type}
          legend={legend}
          version={versionSummary.test.version}
          summary={summaryByVersions[versionSummary.test.version] as Summary}
        />
      </div>
      <div className="flex flex-row justify-center gap-2 px-24">
        {statuses.map((status) => (
          <Button
            variant="tertiary"
            key={status}
            className="text-grey-100 gap-3"
            onClick={() => updateLegend((prev) => toggle(prev, status))}
          >
            <div
              className={clsx('size-4 rounded-[4px]', {
                'bg-green-10': status === 'hit' && legend.includes('hit'),
                'border-green-10 border-2':
                  status === 'hit' && !legend.includes('hit'),
                'bg-grey-10': status === 'no_hit' && legend.includes('no_hit'),
                'border-grey-10 border-2':
                  status === 'no_hit' && !legend.includes('no_hit'),
                'bg-red-10': status === 'error' && legend.includes('error'),
                'border-red-10 border-2':
                  status === 'error' && !legend.includes('error'),
                'bg-[#AAA6CC]':
                  status === 'snoozed' && legend.includes('snoozed'),
                'border-2 border-[#AAA6CC]':
                  status === 'snoozed' && !legend.includes('snoozed'),
              })}
            />
            <span>{t(`decisions:rules.status.${status}`)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
