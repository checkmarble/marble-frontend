import {
  Callout,
  Paper,
  scenarioI18n,
  ScenarioPage,
} from '@app-builder/components';
import { AstBuilder } from '@app-builder/components/AstBuilder';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type AstNode } from '@app-builder/models';
import { adaptDataModelDto } from '@app-builder/models/data-model';
import { EditRule } from '@app-builder/routes/ressources/scenarios/$scenarioId/$iterationId/rules/$ruleId/edit';
import { DeleteRule } from '@app-builder/routes/ressources/scenarios/$scenarioId/$iterationId/rules/delete';
import { useTriggerOrRuleValidationFetcher } from '@app-builder/routes/ressources/scenarios/$scenarioId/$iterationId/validate-with-given-trigger-or-rule';
import { useAstBuilder } from '@app-builder/services/editor/ast-editor';
import { serverServices } from '@app-builder/services/init.server';
import {
  countNodeEvaluationErrors,
  findRuleValidation,
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
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: [...scenarioI18n, 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient, editor, scenario, user } =
    await authService.isAuthenticated(request, {
      failureRedirect: '/login',
    });

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

  const { data_model } = await apiClient.getDataModel();

  return json({
    rule: await scenarioIterationRulePromise,
    identifiers: await identifiersPromise,
    operators: await operatorsPromise,
    ruleValidation: findRuleValidation(
      await scenario.validate({ iterationId }),
      ruleId
    ),
    scenarioId,
    dataModels: adaptDataModelDto(data_model),
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

    const astNode = (await request.json()) as AstNode;

    await editor.saveRule({
      ruleId,
      astNode,
    });

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });
    return json(
      {
        success: true as const,
        error: null,
        astNode,
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
        astNode: null,
      },
      { headers: { 'Set-Cookie': await commitSession(session) } }
    );
  }
}

export default function RuleEdit() {
  const { t } = useTranslation(handle.i18n);
  const { rule, identifiers, operators, ruleValidation, dataModels } =
    useLoaderData<typeof loader>();

  const iterationId = useParam('iterationId');
  const scenarioId = useParam('scenarioId');
  const ruleId = useParam('ruleId');

  const fetcher = useFetcher<typeof action>();
  const { validate, validation: localValidation } =
    useTriggerOrRuleValidationFetcher(scenarioId, iterationId, ruleId);

  const astEditor = useAstBuilder({
    backendAst: rule.formula,
    backendValidation: ruleValidation,
    localValidation,
    identifiers,
    operators,
    dataModels,
    onSave: (astNodeToSave: AstNode) => {
      fetcher.submit(astNodeToSave, {
        method: 'PATCH',
        encType: 'application/json',
      });
    },
    onValidate: validate,
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
              <Button
                type="submit"
                className="w-fit"
                onClick={() => {
                  astEditor.save();
                }}
              >
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
