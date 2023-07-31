import {
  Callout,
  Rule,
  scenarioI18n,
  ScenarioPage,
} from '@app-builder/components';
import {
  EditorIdentifiersProvider,
  EditorOperatorsProvider,
} from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: [...scenarioI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { editor, scenario } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const ruleId = fromParams(params, 'ruleId');
  const scenarioId = fromParams(params, 'scenarioId');

  const rule = scenario.getScenarioIterationRule({
    ruleId,
  });
  const operators = editor.listOperators({
    scenarioId,
  });

  const identifiers = editor.listIdentifiers({
    scenarioId,
  });
  return json({
    rule: await rule,
    identifiers: await identifiers,
    operators: await operators,
  });
}

export default function RuleView() {
  const { rule, identifiers, operators } = useLoaderData<typeof loader>();

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
        <EditorIdentifiersProvider identifiers={identifiers}>
          <EditorOperatorsProvider operators={operators}>
            <Rule rule={rule} />
          </EditorOperatorsProvider>
        </EditorIdentifiersProvider>
      </ScenarioPage.Content>
    </ScenarioPage.Container>
  );
}
