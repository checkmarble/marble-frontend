import {
  Page,
  Callout,
  Rule,
  ruleI18n,
} from '@marble-front/builder/components';
import { Link, useParams } from '@remix-run/react';
import { fromUUID, toUUID } from '@marble-front/builder/utils/short-uuid';
import { useCurrentScenarioIncrement } from '../$incrementId';
import invariant from 'tiny-invariant';

export const handle = {
  i18n: [...ruleI18n] as const,
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
    <Page.Container>
      <Page.Header>
        <Link to="./.." className="mr-4">
          <Page.BackButton />
        </Link>
        {rule.name ?? fromUUID(rule.id)}
      </Page.Header>
      <Page.Content>
        <Callout>{rule.description}</Callout>
        <Rule rule={rule} />
      </Page.Content>
    </Page.Container>
  );
}
