import { DevTool } from '@hookform/devtools';
import {
  Callout,
  Paper,
  scenarioI18n,
  ScenarioPage,
} from '@marble-front/builder/components';
import {
  EditAstNode,
  RootOrOperator,
} from '@marble-front/builder/components/Edit';
import { Consequence } from '@marble-front/builder/components/Scenario/Rule/Consequence';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { getServerEnv } from '@marble-front/builder/utils/environment.server';
import { fromParams, fromUUID } from '@marble-front/builder/utils/short-uuid';
import { getScenarioIterationRule } from '@marble-front/repositories';
import { Button, Tag } from '@marble-front/ui/design-system';
import { json, type LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ClientOnly } from 'remix-utils';

export const handle = {
  i18n: [...scenarioI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { tokenService } = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const ruleId = fromParams(params, 'ruleId');

  const scenarioIterationRule = await getScenarioIterationRule({
    ruleId,
    tokenService,
    baseUrl: getServerEnv('MARBLE_API_DOMAIN'),
  });

  return json(scenarioIterationRule);
}

export default function RuleView() {
  const rule = useLoaderData<typeof loader>();

  const formMethods = useForm({
    // defaultValues: {
    //   astNode: rule.astNode as RootAstNode<any, any>,
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
            Edit
          </Tag>
        </div>
      </ScenarioPage.Header>
      <ScenarioPage.Content className="max-w-3xl">
        <Callout>{rule.description}</Callout>
        <div className="max-w flex flex-col gap-4">
          <Consequence scoreIncrease={rule.scoreModifier} />
          <Paper.Container scrollable={false}>
            <FormProvider {...formMethods}>
              {/* <RootOrOperator
                renderAstNode={({ name }) => <WildEditAstNode name={name} />}
              /> */}
              <RootOrOperator
                renderAstNode={({ name }) => <EditAstNode name={name} />}
              />
            </FormProvider>
          </Paper.Container>
          <Button
            onClick={formMethods.handleSubmit(
              (values) => {
                console.log(
                  'SUCCESS',
                  JSON.stringify(values.astNode, undefined, 2)
                );
                toast.success(() => (
                  <div className="flex flex-col gap-1">
                    <p className="text-s text-grey-100">Successfully saved!</p>
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
            )}
          >
            Save
          </Button>
        </div>
        <ClientOnly>
          {() => (
            <DevTool
              control={formMethods.control}
              placement="bottom-right"
              // styles={{ panel: { width: '1000px' } }}
            />
          )}
        </ClientOnly>
      </ScenarioPage.Content>
    </ScenarioPage.Container>
  );
}
