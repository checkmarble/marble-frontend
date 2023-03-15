import {
  Callout,
  Rule,
  scenarioI18n,
  ScenarioPage,
} from '@marble-front/builder/components';
import { fromUUID, toUUID } from '@marble-front/builder/utils/short-uuid';
import { Link, useParams } from '@remix-run/react';
import { type Namespace } from 'i18next';
import invariant from 'tiny-invariant';

import { useCurrentScenarioIncrement } from '../$incrementId';

export const handle = {
  i18n: [...scenarioI18n] satisfies Namespace,
};

export default function RuleView() {
  const {
    body: { rules },
  } = useCurrentScenarioIncrement();

  const { ruleId } = useParams();
  invariant(ruleId, 'ruleId is required');

  const rule = rules.find(({ id }) => id === toUUID(ruleId));
  invariant(rule, `Unknown rule`);

  return (
    <ScenarioPage.Container>
      <ScenarioPage.Header>
        <Link to="./.." className="mr-4">
          <ScenarioPage.BackButton />
        </Link>
        {rule.name ?? fromUUID(rule.id)}
      </ScenarioPage.Header>
      <ScenarioPage.Content>
        <Callout>{rule.description}</Callout>
        <Rule rule={rule} />
      </ScenarioPage.Content>
    </ScenarioPage.Container>
  );
}
