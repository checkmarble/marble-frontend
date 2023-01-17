import { Page } from '@marble-front/builder/components/Page';
import { Link } from '@remix-run/react';
import { useCurrentRule } from '@marble-front/builder/hooks/scenarios';
import Callout from '@marble-front/builder/components/Callout';
import { fromUUID } from '@marble-front/builder/utils/short-uuid';

export default function ScenarioLayout() {
  const rule = useCurrentRule();

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
