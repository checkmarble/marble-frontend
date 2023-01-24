import { Page } from '@marble-front/builder/components/Page';
import { Link, useParams } from '@remix-run/react';
import Callout from '@marble-front/builder/components/Callout';
import { fromUUID, toUUID } from '@marble-front/builder/utils/short-uuid';
import { useCurrentScenarioIncrement } from '../$incrementId';
import invariant from 'tiny-invariant';

export default function RuleViewer() {
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
        <Link to="./..">
          <Page.BackButton className="mr-4" />
        </Link>
        {rule.name ?? fromUUID(rule.id)}
      </Page.Header>
      <Page.Content>
        <Callout>{rule.description}</Callout>
        <pre>{JSON.stringify(rule, undefined, 2)}</pre>
      </Page.Content>
    </Page.Container>
  );
}
