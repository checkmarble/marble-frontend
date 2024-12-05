import { useMemo, useState } from 'react';
import { toggle } from 'radash';
import {
  Button,
  Collapsible,
  RadioGroup,
  RadioGroupItem,
} from 'ui-design-system';
import clsx from 'clsx';
import { entries, unique, groupBy, mapValues, omit, sumBy } from 'remeda';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';
import { TestRunDecision } from '@app-builder/models/testrun';
import { Outcome } from '@app-builder/models/outcome';
import { VersionSummary } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/test-run+/$testRunId';

type Type = 'absolute' | 'percentage';
type Summary = { total: number } & Partial<{ [outcome in Outcome]: number }>;

const SanKey = ({
  version,
  summary,
  type,
  legend,
}: {
  version: string;
  type: Type;
  summary: Summary;
  legend: Outcome[];
}) => {
  const pairs = useMemo(
    () =>
      entries(omit(summary, ['total'])).filter(([outcome]) =>
        legend.includes(outcome),
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
          pairs.map(([outcome, count]) => (
            <div
              key={outcome}
              style={{
                flexBasis: `${Math.round((count * 100) / summary.total)}%`,
              }}
              className={clsx(
                'flex min-h-[24px] w-full shrink grow flex-row items-center justify-center rounded-[4px]',
                {
                  'bg-green-100': outcome === 'approve',
                  'bg-yellow-100': outcome === 'review',
                  'bg-orange-100': outcome === 'block_and_review',
                  'bg-red-100': outcome === 'decline',
                },
              )}
            >
              <span className="text-s text-grey-00 font-medium">
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

export const SanKeyChart = ({
  decisions,
  versionSummary,
}: {
  decisions: TestRunDecision[];
  versionSummary: VersionSummary;
}) => {
  const { t } = useTranslation(['scenarios', 'decisions']);

  const outcomes = useMemo(
    () => unique(decisions.map((d) => d.outcome)),
    [decisions],
  );

  const [type, setTytpe] = useState<Type>('percentage');
  const [legend, updateLegend] = useState<Outcome[]>(outcomes);

  const summaryByVersions = useMemo(
    () =>
      mapValues(
        groupBy(decisions, (d) => d.version),
        (decisionsByVersion) => ({
          total: sumBy(decisionsByVersion, (d) => d.count),
          ...mapValues(
            groupBy(decisionsByVersion, (d) => d.outcome),
            (dbvao) => sumBy(dbvao, (d) => d.count),
          ),
        }),
      ),
    [decisions],
  );

  return (
    <Collapsible.Container className="bg-grey-00" defaultOpen={false}>
      <Collapsible.Title>
        {t('scenarios:testrun.distribution')}
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-8">
          <RadioGroup
            onValueChange={(type) => setTytpe(type as Type)}
            value={type}
          >
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
              summary={
                summaryByVersions[versionSummary.test.version] as Summary
              }
            />
          </div>
          <div className="flex flex-row justify-center gap-2 px-24">
            {outcomes.map((outcome) => (
              <Button
                variant="tertiary"
                key={outcome}
                className="text-grey-100 gap-3"
                onClick={() => updateLegend((prev) => toggle(prev, outcome))}
              >
                <div
                  className={clsx('size-4 rounded-[4px]', {
                    'bg-green-100':
                      outcome === 'approve' && legend.includes('approve'),
                    'border-2 border-green-100':
                      outcome === 'approve' && !legend.includes('approve'),
                    'bg-yellow-100':
                      outcome === 'review' && legend.includes('review'),
                    'border-2 border-yellow-100':
                      outcome === 'review' && !legend.includes('review'),
                    'bg-orange-100':
                      outcome === 'block_and_review' &&
                      legend.includes('block_and_review'),
                    'border-2 border-orange-100':
                      outcome === 'block_and_review' &&
                      !legend.includes('block_and_review'),
                    'bg-red-100':
                      outcome === 'decline' && legend.includes('decline'),
                    'border-2 border-red-100':
                      outcome === 'decline' && !legend.includes('decline'),
                  })}
                />
                <span>{t(`decisions:outcome.${outcome}`)}</span>
              </Button>
            ))}
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
