import { TestRunRuleExecution } from '@app-builder/models/testrun';
import { VersionSummary } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/test-run+/$testRunId';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { entries, groupBy } from 'remeda';
import { Collapsible, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

const TestRunRuleName = ({
  rulesByVersion,
  versionSummary: { ref, test },
}: {
  rulesByVersion: Record<string, TestRunRuleExecution[]>;
  versionSummary: VersionSummary;
}) => {
  const refRuleName = rulesByVersion[ref.version]![0]!.name;
  const testRuleName = rulesByVersion[test.version]![0]!.name;

  return (
    <div className="flex flex-col">
      <span className="text-s font-normal">{testRuleName}</span>
      {refRuleName !== testRuleName && (
        <span className="text-grey-50 inline-flex flex-row items-center gap-2">
          <Icon icon="arrow-top-left" className="size-2" />
          <span className="text-xs">{refRuleName}</span>
        </span>
      )}
    </div>
  );
};

const TestRunRuleHitPercentage = ({
  rulesByVersion,
  versionSummary: { ref, test },
}: {
  rulesByVersion: Record<string, TestRunRuleExecution[]>;
  versionSummary: VersionSummary;
}) => {
  const refRuleHitPercentage = useMemo(() => {
    const refRuleTotal = rulesByVersion[ref.version]!.reduce(
      (acc, rule) => acc + rule.total,
      0,
    );
    const refRuleHitTotal = rulesByVersion[ref.version]!.filter(
      (r) => r.status === 'hit',
    ).reduce((acc, rule) => acc + rule.total, 0);
    return Math.round((refRuleHitTotal * 100) / refRuleTotal);
  }, [rulesByVersion, ref]);

  const testRuleHitPercentage = useMemo(() => {
    const testRuleTotal = rulesByVersion[test.version]!.reduce(
      (acc, rule) => acc + rule.total,
      0,
    );
    const testRuleHitTotal = rulesByVersion[test.version]!.filter(
      (r) => r.status === 'hit',
    ).reduce((acc, rule) => acc + rule.total, 0);
    return Math.round((testRuleHitTotal * 100) / testRuleTotal);
  }, [rulesByVersion, test]);

  const direction =
    refRuleHitPercentage - testRuleHitPercentage < 0
      ? 'up'
      : refRuleHitPercentage - testRuleHitPercentage > 0
        ? 'down'
        : 'equal';

  return (
    <div className="flex flex-row items-center gap-2">
      {direction === 'up' && (
        <span className="text-s text-grey-50 font-normal">
          {refRuleHitPercentage}%
        </span>
      )}
      <div
        className={clsx(
          'flex flex-row items-center justify-center rounded p-1.5',
          {
            'bg-purple-10': direction === 'up' || direction === 'down',
            'bg-grey-05': direction === 'equal',
          },
        )}
      >
        <Icon
          icon={
            direction === 'up' || direction === 'down'
              ? 'arrow-forward'
              : 'dash'
          }
          className={clsx('size-2.5', {
            'text-purple-100': direction === 'up' || direction === 'down',
            'rotate-90': direction === 'down',
            '-rotate-90': direction === 'up',
            'text-green-100': direction === 'equal',
          })}
        />
      </div>
      <span className="text-s text-grey-100 font-medium">
        {testRuleHitPercentage}%
      </span>
    </div>
  );
};

const RuleExecution = ({
  id,
  rules,
  versionSummary,
}: {
  id: string;
  rules: TestRunRuleExecution[];
  versionSummary: VersionSummary;
}) => {
  const rulesByVersion = useMemo(
    () => groupBy(rules, (r) => r.version),
    [rules],
  );

  return (
    <Collapsible.Container defaultOpen={false} key={id}>
      <div className="grid-cols-ts-by-ds grid w-full items-center">
        <Collapsible.Title size="small" />
        <TestRunRuleName
          rulesByVersion={rulesByVersion}
          versionSummary={versionSummary}
        />
        <TestRunRuleHitPercentage
          rulesByVersion={rulesByVersion}
          versionSummary={versionSummary}
        />
        {/* <div className="flex flex-row items-center gap-2">
          <span className="text-s bg-purple-10 inline-block rounded px-2 py-1.5 font-normal text-purple-100">
            +100
          </span>
          <div className="bg-purple-10 flex flex-row items-center justify-center rounded p-1.5">
            <Icon
              icon="arrow-forward"
              className="size-2.5 -rotate-90 text-purple-100"
            />
          </div>
          <span className="text-s bg-purple-10 inline-block rounded px-2 py-1.5 font-normal text-purple-100">
            +120
          </span>
        </div> */}
      </div>
      <Collapsible.Content>
        <div>World</div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};

export const FilterTransactionByDecision = ({
  rules,
  versionSummary,
}: {
  rules: TestRunRuleExecution[];
  versionSummary: VersionSummary;
}) => {
  const { t } = useTranslation(['scenarios']);
  const [displayRulesChange, toggleDisplayRulesChange] = useState(true);

  const rulesByRuleId = useMemo(
    () => groupBy(rules, (r) => r.rule_id),
    [rules],
  );

  return (
    <Collapsible.Container className="bg-grey-00">
      <Collapsible.Title>
        {t('scenarios:testrun.transaction_by_decision')}
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-8">
          <div className="flex w-full flex-row items-center justify-end gap-2">
            <span className="text-s text-grey-100 font-medium">
              {t('scenarios:testrun.show_rules_changes')}
            </span>
            <Switch
              checked={displayRulesChange}
              onCheckedChange={toggleDisplayRulesChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="grid-cols-ts-by-ds text-s grid w-full font-semibold">
              <span />
              <span>{t('scenarios:testrun.filters.rule_name')}</span>
              <span>{t('scenarios:testrun.filters.alerts')}</span>
              {/* <span>{t('scenarios:testrun.filters.score')}</span> */}
            </div>
            {entries(rulesByRuleId).map(([ruleId, rules]) => (
              <RuleExecution
                id={ruleId}
                rules={rules}
                versionSummary={versionSummary}
              />
            ))}
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
