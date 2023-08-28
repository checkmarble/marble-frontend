import {
  Callout,
  Paper,
  scenarioI18n,
  ScenarioPage,
} from '@app-builder/components';
import { AstBuilder } from '@app-builder/components/AstBuilder';
import { EditAstNode, RootOrOperator } from '@app-builder/components/Edit';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { adaptNodeEvaluationErrors, type AstNode } from '@app-builder/models';
import { EditRule } from '@app-builder/routes/ressources/scenarios/$scenarioId/$iterationId/rules/$ruleId/edit';
import { DeleteRule } from '@app-builder/routes/ressources/scenarios/$scenarioId/$iterationId/rules/delete';
import {
  EditorIdentifiersProvider,
  EditorOperatorsProvider,
} from '@app-builder/services/editor';
import { useAstBuilder } from '@app-builder/services/editor/ast-editor';
import { serverServices } from '@app-builder/services/init.server';
import {
  countNodeEvaluationErrors,
  findRuleValidation,
  useGetNodeEvaluationErrorMessage,
} from '@app-builder/services/validation/scenario-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import {
  type ActionArgs,
  json,
  type LoaderArgs,
  redirect,
} from '@remix-run/node';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { Button, Tag } from '@ui-design-system';
import { type Namespace } from 'i18next';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: [...scenarioI18n, 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { editor, scenario, user } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: '/login',
    }
  );

  const ruleId = fromParams(params, 'ruleId');
  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  if (!user.permissions.canManageScenario) {
    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId/view/rules/:ruleId', {
        scenarioId: fromUUID(scenarioId),
        iterationId: fromUUID(iterationId),
        ruleId: fromUUID(ruleId),
      })
    );
  }

  const scenarioIterationRulePromise = scenario.getScenarioIterationRule({
    ruleId,
  });

  const operatorsPromise = editor.listOperators({
    scenarioId,
  });

  const identifiersPromise = editor.listIdentifiers({
    scenarioId,
  });

  const validation = await scenario.validate({ iterationId });
  const ruleValidation = findRuleValidation(validation, ruleId);

  return json({
    rule: await scenarioIterationRulePromise,
    identifiers: await identifiersPromise,
    operators: await operatorsPromise,
    ruleValidation,
    scenarioId,
  });
}

export async function action({ request, params }: ActionArgs) {
  const {
    authService,
    sessionService: { getSession, commitSession },
  } = serverServices;
  const session = await getSession(request);
  const { editor } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  try {
    const ruleId = fromParams(params, 'ruleId');

    const expression = (await request.json()) as {
      astNode: AstNode;
    };

    await editor.saveRule({
      ruleId,
      astNode: expression.astNode,
    });

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });
    return json(
      {
        success: true as const,
        error: null,
        values: expression,
      },
      { headers: { 'Set-Cookie': await commitSession(session) } }
    );
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });
    return json(
      {
        success: false as const,
        error: null,
        values: null,
      },
      { headers: { 'Set-Cookie': await commitSession(session) } }
    );
  }
}

export default function RuleEdit() {
  const { t } = useTranslation(handle.i18n);
  const { rule, identifiers, operators, ruleValidation } =
    useLoaderData<typeof loader>();

  const iterationId = useParam('iterationId');
  const scenarioId = useParam('scenarioId');
  const ruleId = useParam('ruleId');

  const fetcher = useFetcher<typeof action>();

  const astEditor = useAstBuilder({
    ast: rule.astNode,
    validation: ruleValidation,
    identifiers,
    operators,
    onSave: (astNodeToSave: AstNode) => {
      fetcher.submit(JSON.stringify(astNodeToSave), {
        method: 'PATCH',
        encType: 'application/json',
      });
    },
  });

  return (
    <ScenarioPage.Container>
      <ScenarioPage.Header>
        <div className="flex flex-row items-center gap-4">
          <Link to="./..">
            <ScenarioPage.BackButton />
          </Link>
          {rule.name ?? fromUUID(rule.id)}
          <Tag size="big" border="square">
            {/* TODO(builder): use transaltion */}
            Edit
          </Tag>
        </div>
      </ScenarioPage.Header>
      <ScenarioPage.Content className="max-w-3xl">
        <Callout variant="error">
          {t('common:validation_error', {
            count: countNodeEvaluationErrors(ruleValidation),
          })}
        </Callout>
        <EditRule
          rule={rule}
          iterationId={iterationId}
          scenarioId={scenarioId}
        />

        <div className="max-w flex flex-col gap-4">
          <Paper.Container scrollable={false}>
            <AstBuilder builder={astEditor} />
            <div className="flex flex-row justify-end">
              <Button type="submit" className="w-fit">
                {t('common:save')}
              </Button>
            </div>
          </Paper.Container>
        </div>
        <DeleteRule
          ruleId={ruleId}
          iterationId={iterationId}
          scenarioId={scenarioId}
        />
      </ScenarioPage.Content>
    </ScenarioPage.Container>
  );
}
