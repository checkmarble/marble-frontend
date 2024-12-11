import { type TestRunRuleExecutionCount } from '@app-builder/models/testrun';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import clsx from 'clsx';
import { t } from 'i18next';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  entries,
  flat,
  groupBy,
  isDeepEqual,
  mapValues,
  omit,
  omitBy,
  values,
} from 'remeda';
import { Collapsible, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { HamburgerChart, type Versions } from './HamburgerGraph';

const TestRunRuleName = ({
  rulesByVersion,
  versions: { ref, test },
}: {
  rulesByVersion: Record<string, TestRunRuleExecutionCount[]>;
  versions: Versions;
}) => {
  const refRuleName = rulesByVersion[ref.value]?.[0]?.name;
  const testRuleName = rulesByVersion[test.value]?.[0]?.name;

  if (refRuleName !== undefined && testRuleName !== undefined) {
    return (
      <div className="flex flex-col">
        <span className="text-s font-normal">{testRuleName}</span>
        {refRuleName !== testRuleName ? (
          <span className="text-grey-50 inline-flex flex-row items-center gap-2">
            <Icon icon="arrow-top-left" className="size-2" />
            <span className="text-xs">{refRuleName}</span>
          </span>
        ) : null}
      </div>
    );
  }

  if (refRuleName === undefined && testRuleName !== undefined) {
    return (
      <div className="flex flex-row items-baseline gap-2">
        <span className="text-s font-normal">{testRuleName}</span>
        <span className="text-xs font-semibold text-green-100">
          ({t('scenarios:testrun.rule.new')})
        </span>
      </div>
    );
  }

  if (refRuleName !== undefined && testRuleName === undefined) {
    return (
      <div className="flex flex-row items-baseline gap-2">
        <span className="text-s font-normal">{refRuleName}</span>
        <span className="text-grey-25 text-xs font-semibold">
          ({t('scenarios:testrun.rule.old')})
        </span>
      </div>
    );
  }
};

const TestRunRuleHitPercentage = ({
  rulesByVersion,
  versions: { ref, test },
}: {
  rulesByVersion: Record<string, TestRunRuleExecutionCount[]>;
  versions: Versions;
}) => {
  const language = useFormatLanguage();

  const refRuleHitPercentage = useMemo(() => {
    const refRuleTotal = rulesByVersion[ref.value]?.reduce(
      (acc, rule) => acc + rule.total,
      0,
    );

    const refRuleHitTotal = rulesByVersion[ref.value]
      ?.filter((r) => r.status === 'hit')
      .reduce((acc, rule) => acc + rule.total, 0);

    if (refRuleTotal === undefined || refRuleHitTotal === undefined) {
      return undefined;
    }

    return refRuleTotal === 0 || refRuleHitTotal === 0
      ? 0
      : Math.round((refRuleHitTotal * 100) / refRuleTotal);
  }, [rulesByVersion, ref]);

  const testRuleHitPercentage = useMemo(() => {
    const testRuleTotal = rulesByVersion[test.value]?.reduce(
      (acc, rule) => acc + rule.total,
      0,
    );

    const testRuleHitTotal = rulesByVersion[test.value]
      ?.filter((r) => r.status === 'hit')
      .reduce((acc, rule) => acc + rule.total, 0);

    if (testRuleTotal === undefined || testRuleHitTotal === undefined) {
      return undefined;
    }

    return testRuleTotal === 0 || testRuleHitTotal === 0
      ? 0
      : Math.round((testRuleHitTotal * 100) / testRuleTotal);
  }, [rulesByVersion, test]);

  let direction = 'equal';

  if (
    refRuleHitPercentage !== undefined &&
    testRuleHitPercentage !== undefined
  ) {
    direction =
      refRuleHitPercentage - testRuleHitPercentage < 0
        ? 'up'
        : refRuleHitPercentage - testRuleHitPercentage > 0
          ? 'down'
          : 'equal';
  }

  return (
    <div className="flex flex-row items-center gap-2">
      {direction !== 'equal' ? (
        <span className="text-s text-grey-50 font-normal">
          {formatNumber(refRuleHitPercentage! / 100, {
            language,
            style: 'percent',
          })}
        </span>
      ) : null}
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
          className={clsx({
            'size-1.5': direction === 'equal',
            'size-2.5 text-purple-100':
              direction === 'up' || direction === 'down',
            'rotate-90': direction === 'down',
            '-rotate-90': direction === 'up',
            'text-green-100': direction === 'equal',
          })}
        />
      </div>
      <span className="text-s text-grey-100 font-medium">
        {formatNumber(
          (testRuleHitPercentage !== undefined
            ? testRuleHitPercentage
            : refRuleHitPercentage)! / 100,
          { language, style: 'percent' },
        )}
      </span>
    </div>
  );
};

const RuleExecution = ({
  rules,
  versions,
}: {
  rules: Record<string, TestRunRuleExecutionCount[]>;
  versions: Versions;
}) => {
  const { t } = useTranslation(['decisions']);

  return (
    <Collapsible.Container defaultOpen={false}>
      <div className="grid w-full grid-cols-[9%_40%_25%_auto] items-center">
        <Collapsible.Title size="small" />
        <TestRunRuleName rulesByVersion={rules} versions={versions} />
        <TestRunRuleHitPercentage rulesByVersion={rules} versions={versions} />
      </div>
      <Collapsible.Content>
        <HamburgerChart
          versions={versions}
          items={flat(values(rules)).map((r) => ({
            version: r.version,
            count: r.total,
            option: r.status,
          }))}
          mapping={{
            hit: {
              border: 'border-green-50',
              background: 'bg-green-50',
              text: 'text-grey-100',
              name: t('decisions:rules.status.hit'),
            },
            no_hit: {
              border: 'border-grey-10',
              background: 'bg-grey-10',
              text: 'text-grey-100',
              name: t('decisions:rules.status.no_hit'),
            },
            error: {
              border: 'border-red-50',
              background: 'bg-red-50',
              text: 'text-grey-100',
              name: t('decisions:rules.status.error'),
            },
            snoozed: {
              border: 'border-[#AAA6CC]',
              background: 'bg-[#AAA6CC]',
              text: 'text-grey-00',
              name: t('decisions:rules.status.snoozed'),
            },
          }}
        />
      </Collapsible.Content>
    </Collapsible.Container>
  );
};

export const FilterTransactionByDecision = ({
  rules,
  versions,
}: {
  rules: TestRunRuleExecutionCount[];
  versions: Versions;
}) => {
  const { t } = useTranslation(['scenarios']);
  const [displayChangedRules, toggleChangedRulesDisplay] = useState(true);

  const rulesByRuleId = useMemo(() => {
    const rulesSummary = mapValues(
      groupBy(rules, ({ ruleId }) => ruleId ?? `random_${crypto.randomUUID()}`),
      (rulesByVersion) => groupBy(rulesByVersion, ({ version }) => version),
    );

    return displayChangedRules
      ? omitBy(rulesSummary, (rs) =>
          isDeepEqual(
            rs[versions.ref.value]?.map((r) => omit(r, ['version'])),
            rs[versions.test.value]?.map((r) => omit(r, ['version'])),
          ),
        )
      : rulesSummary;
  }, [displayChangedRules, rules, versions]);

  return (
    <Collapsible.Container className="bg-grey-00">
      <Collapsible.Title>
        {t('scenarios:testrun.transaction_by_decision')}
      </Collapsible.Title>
      <Collapsible.Content>
        {rules.length === 0 ? (
          <span className="text-grey-50 inline-block w-full text-center font-semibold">
            {t('scenarios:testrun.no_rules')}
          </span>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex w-full flex-row items-center justify-end gap-2">
              <span className="text-s text-grey-100 font-medium">
                {t('scenarios:testrun.show_rules_changes')}
              </span>
              <Switch
                checked={displayChangedRules}
                onCheckedChange={toggleChangedRulesDisplay}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-s grid w-full grid-cols-[9%_40%_25%_auto] font-semibold">
                <span />
                <span>{t('scenarios:testrun.filters.rule_name')}</span>
                <span>{t('testrun.filters.hit')}</span>
              </div>
              {entries(rulesByRuleId).map(([ruleId, rules]) => (
                <RuleExecution key={ruleId} rules={rules} versions={versions} />
              ))}
            </div>
          </div>
        )}
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
