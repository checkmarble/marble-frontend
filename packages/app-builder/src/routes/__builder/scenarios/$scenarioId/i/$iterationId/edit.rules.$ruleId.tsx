import {
  Callout,
  Paper,
  scenarioI18n,
  ScenarioPage,
} from '@app-builder/components';
import { EditAstNode, RootOrOperator } from '@app-builder/components/Edit';
import { Consequence } from '@app-builder/components/Scenario/Rule/Consequence';
import { type AstNode } from '@app-builder/models';
import { editor, getScenarioIterationRule } from '@app-builder/repositories';
import { EditorIdentifiersProvider } from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import { getServerEnv } from '@app-builder/utils/environment.server';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { DevTool } from '@hookform/devtools';
import { json, type LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { Button, Tag } from '@ui-design-system';
import { type Namespace } from 'i18next';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ClientOnly } from 'remix-utils';

export const handle = {
  i18n: [...scenarioI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { tokenService } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const ruleId = fromParams(params, 'ruleId');
  const scenarioId = fromParams(params, 'scenarioId');

  const scenarioIterationRule = getScenarioIterationRule({
    ruleId,
    tokenService,
    baseUrl: getServerEnv('MARBLE_API_DOMAIN'),
  });

  const identifiers = editor.listIdentifiers({
    scenarioId,
    tokenService,
    baseUrl: getServerEnv('MARBLE_API_DOMAIN'),
  });

  return json({
    rule: await scenarioIterationRule,
    identifiers: await identifiers,
  });
}

export default function RuleView() {
  const { rule, identifiers } = useLoaderData<typeof loader>();

  const formMethods = useForm<{ astNode: AstNode }>({
    // TODO(builder): defaultValues is not working
    // defaultValues: {
    //   astNode: rule.astNode,
    // },
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
        <Callout>{rule.description}</Callout>
        <div className="max-w flex flex-col gap-4">
          <Consequence scoreIncrease={rule.scoreModifier} />
          <Paper.Container scrollable={false}>
            <EditorIdentifiersProvider identifiers={identifiers}>
              <FormProvider {...formMethods}>
                {/* <RootOrOperator
                  renderAstNode={({ name }) => <WildEditAstNode name={name} />}
                /> */}
                <RootOrOperator
                  renderAstNode={({ name }) => <EditAstNode name={name} />}
                />
              </FormProvider>
            </EditorIdentifiersProvider>
          </Paper.Container>
          <Button
            onClick={
              void formMethods.handleSubmit(
                (values) => {
                  console.log(
                    'SUCCESS',
                    JSON.stringify(values.astNode, undefined, 2)
                  );
                  toast.success(() => (
                    <div className="flex flex-col gap-1">
                      <p className="text-s text-grey-100">
                        Successfully saved!
                      </p>
                      <p className="text-grey-50 text-xs">
                        astNode print as JSON in the console
                      </p>
                    </div>
                  ));
                },
                (error) => {
                  console.log('ERROR', error);
                  toast.error(() => (
                    <div className="flex flex-col gap-1">
                      <p className="text-s text-grey-100">Error saving!</p>
                      <p className="text-grey-50 text-xs">
                        error print in the console
                      </p>
                    </div>
                  ));
                }
              )
            }
          >
            {/* TODO(builder): use transaltion */}
            Save
          </Button>
        </div>
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
