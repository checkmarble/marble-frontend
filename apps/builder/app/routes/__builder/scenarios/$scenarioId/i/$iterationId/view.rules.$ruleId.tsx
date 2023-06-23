import {
  Callout,
  Rule,
  scenarioI18n,
  ScenarioPage,
} from '@marble-front/builder/components';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { fromParams, fromUUID } from '@marble-front/builder/utils/short-uuid';
import { json, type LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: [...scenarioI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { apiClient } = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const ruleId = fromParams(params, 'ruleId');

  const rule = await apiClient.getScenarioIterationRule(ruleId);

  return json(rule);
}

export default function RuleView() {
  const rule = useLoaderData<typeof loader>();

  return (
    <ScenarioPage.Container>
      <ScenarioPage.Header>
        <Link to="./.." className="mr-4">
          <ScenarioPage.BackButton />
        </Link>
        {rule.name ?? fromUUID(rule.id)}
      </ScenarioPage.Header>
      <ScenarioPage.Content className="max-w-3xl">
        <Callout className="w-full">{rule.description}</Callout>
        <Rule rule={rule} />
      </ScenarioPage.Content>
    </ScenarioPage.Container>
  );
}
