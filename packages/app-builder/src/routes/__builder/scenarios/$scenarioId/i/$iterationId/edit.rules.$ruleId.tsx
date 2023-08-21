import {
  Callout,
  Paper,
  scenarioI18n,
  ScenarioPage,
} from '@app-builder/components';
import { EditAstNode, RootOrOperator } from '@app-builder/components/Edit';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import type {
  AstNode,
  EditorIdentifier,
  ScenarioIterationRule,
  ScenarioValidation,
} from '@app-builder/models';
import { type AstOperator } from '@app-builder/models/ast-operators';
import { EditRule } from '@app-builder/routes/ressources/scenarios/$scenarioId/$iterationId/rules/$ruleId/edit';
import { DeleteRule } from '@app-builder/routes/ressources/scenarios/$scenarioId/$iterationId/rules/delete';
import {
  EditorIdentifiersProvider,
  EditorOperatorsProvider,
} from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import { DevTool } from '@hookform/devtools';
import {
  type ActionArgs,
  json,
  type LoaderArgs,
  redirect,
} from '@remix-run/node';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { Button, Tag } from '@ui-design-system';
import { type Namespace } from 'i18next';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils';

export const handle = {
  i18n: [...scenarioI18n, 'common'] satisfies Namespace,
};

interface EditRuleLoaderResult {
  rule: ScenarioIterationRule;
  identifiers: {
    databaseAccessors: EditorIdentifier[];
    payloadAccessors: EditorIdentifier[];
    customListAccessors: EditorIdentifier[];
  };
  operators: AstOperator[];
  scenarioValidation: ScenarioValidation | null;
  scenarioId: string;
}

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

  const scenarioIterationRule = scenario.getScenarioIterationRule({
    ruleId,
  });

  const operators = editor.listOperators({
    scenarioId,
  });

  const identifiers = editor.listIdentifiers({
    scenarioId,
  });

  const scenarioValidation: ScenarioValidation | null = null;

  return json<EditRuleLoaderResult>({
    rule: await scenarioIterationRule,
    identifiers: await identifiers,
    operators: await operators,
    scenarioValidation,
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
    const iterationId = fromParams(params, 'iterationId');

    const expression = (await request.json()) as {
      astNode: AstNode;
    };

    await editor.saveRule({
      ruleId,
      astNode: expression.astNode,
    });

    const scenarioValidation = await editor.validate({
      iterationId: iterationId,
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
        scenarioValidation,
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
        scenarioValidation: null,
      },
      { headers: { 'Set-Cookie': await commitSession(session) } }
    );
  }
}

export default function RuleEdit() {
  const { t } = useTranslation(handle.i18n);
  const { rule, identifiers, operators, scenarioValidation } = useLoaderData<
    typeof loader
  >() as EditRuleLoaderResult;

  const iterationId = useParam('iterationId');
  const scenarioId = useParam('scenarioId');
  const ruleId = useParam('ruleId');

  const fetcher = useFetcher<typeof action>();

  // @ts-expect-error recursive type is not supported
  const formMethods = useForm({
    defaultValues: { astNode: rule.astNode },
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
        {scenarioValidation && (
          <Callout>
            <pre>{JSON.stringify(scenarioValidation)}</pre>
          </Callout>
        )}
        <EditRule
          rule={rule}
          iterationId={iterationId}
          scenarioId={scenarioId}
        />
        <Form
          control={formMethods.control}
          onSubmit={({ data }) => {
            fetcher.submit(JSON.stringify(data), {
              method: 'PATCH',
              encType: 'application/json',
            });
          }}
        >
          <div className="max-w flex flex-col gap-4">
            <Paper.Container scrollable={false}>
              <EditorIdentifiersProvider identifiers={identifiers}>
                <EditorOperatorsProvider operators={operators}>
                  <FormProvider {...formMethods}>
                    {/* <RootOrOperator
                  renderAstNode={({ name }) => <WildEditAstNode name={name} />}
                /> */}
                    <RootOrOperator
                      renderAstNode={({ name }) => <EditAstNode name={name} />}
                    />
                  </FormProvider>
                </EditorOperatorsProvider>
              </EditorIdentifiersProvider>
              <div className="flex flex-row justify-end">
                <Button type="submit" className="w-fit">
                  {t('common:save')}
                </Button>
              </div>
            </Paper.Container>
          </div>
        </Form>
        <DeleteRule
          ruleId={ruleId}
          iterationId={iterationId}
          scenarioId={scenarioId}
        />
        <ClientOnly>
          {() => (
            <DevTool
              control={formMethods.control}
              placement="bottom-right"
              styles={{
                panel: { width: '450px' },
              }}
            />
          )}
        </ClientOnly>
      </ScenarioPage.Content>
    </ScenarioPage.Container>
  );
}
