import { Spinner } from '@app-builder/components/Spinner';
import { ScenarioIterationRuleMetadata } from '@app-builder/models/scenario/iteration-rule';
import { useRuleSnoozesQuery } from '@app-builder/queries/scenarios/rule-snoozes';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function RuleSnoozeDetail({
  scenarioId,
  iterationId,
  rulesMetadata,
}: {
  scenarioId: string;
  iterationId: string;
  rulesMetadata: ScenarioIterationRuleMetadata[];
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const ruleSnoozesQuery = useRuleSnoozesQuery(scenarioId, iterationId);

  if (ruleSnoozesQuery.isPending) return <Spinner className="size-5 shrink-0" />;

  if (ruleSnoozesQuery.isError) {
    return <div className="text-s text-red-primary">{t('common:errors.unknown')}</div>;
  }

  const ruleSnoozes = ruleSnoozesQuery.data.ruleSnoozes;
  const hasSnoozesActive = ruleSnoozes.some((snooze) => snooze.hasSnoozesActive);

  if (!hasSnoozesActive) {
    return (
      <p className="text-grey-secondary text-s first-letter:capitalize">
        {t('scenarios:deployment_modal.activate.without_rule_snooze')}
      </p>
    );
  }

  return (
    <Collapsible.Container>
      <Collapsible.Title>
        <span className="text-grey-secondary text-s first-letter:capitalize">
          {t('scenarios:deployment_modal.activate.with_rule_snooze')}
        </span>
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="max-h-40 overflow-y-auto">
          <ul className="list-none">
            {rulesMetadata.map((rule) => {
              const hasSnoozesActive = ruleSnoozes.find((snooze) => snooze.ruleId === rule.id)?.hasSnoozesActive;
              return (
                <li key={rule.id} className="flex flex-row">
                  <Icon
                    className={clsx(
                      'size-5 shrink-0',
                      hasSnoozesActive === true && 'text-green-primary',
                      hasSnoozesActive === false && 'text-red-primary',
                    )}
                    icon={hasSnoozesActive ? 'tick' : 'cross'}
                  />
                  <span className="text-s text-grey-primary font-normal">{rule.name}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
}
