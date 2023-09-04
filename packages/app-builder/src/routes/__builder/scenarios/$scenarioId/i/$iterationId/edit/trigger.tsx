import { Callout, Paper } from '@app-builder/components';
import { EditAstNode, RootOrOperator } from '@app-builder/components/Edit';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { ScenarioBox } from '@app-builder/components/Scenario/ScenarioBox';
import {
  adaptAstNode,
  type AstNode,
  wrapInOrAndGroups,
} from '@app-builder/models';
import { useCurrentScenario } from '@app-builder/routes/__builder/scenarios/$scenarioId';
import { serverServices } from '@app-builder/services/init.server';
import { fromParams } from '@app-builder/utils/short-uuid';
import { type ActionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { Button } from '@ui-design-system';
import { type Namespace } from 'i18next';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';

import { useCurrentScenarioIteration } from '../../$iterationId';

export const handle = {
  i18n: ['scenarios', 'common'] satisfies Namespace,
};

export async function action({ request, params }: ActionArgs) {
  const {
    authService,
    sessionService: { getSession, commitSession },
  } = serverServices;
  const session = await getSession(request);
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  try {
    const iterationId = fromParams(params, 'iterationId');

    const expression = (await request.json()) as {
      astNode: AstNode;
    };

    await apiClient.updateScenarioIteration(iterationId, {
      body: {
        trigger_condition_ast_expression: adaptNodeDto(expression.astNode),
      },
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

export default function Trigger() {
  const scenarioIteration = useCurrentScenarioIteration();
  const { triggerObjectType } = useCurrentScenario();
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  // @ts-ignore
  const formMethods = useForm({
    defaultValues: {
      astNode: scenarioIteration.trigger ?? wrapInOrAndGroups(),
    },
  });

  return (
    <div>
      <Form
        className="h-full"
        control={formMethods.control}
        onSubmit={({ data }) => {
          fetcher.submit(JSON.stringify(data), {
            method: 'PATCH',
            encType: 'application/json',
          });
        }}
      >
        <Paper.Container scrollable={false} className="max-w-3xl">
          <div className="flex flex-col gap-2 lg:gap-4">
            <Paper.Title>
              {t('scenarios:trigger.run_scenario.title')}
            </Paper.Title>
            <p className="text-s text-grey-100 font-normal">
              <Trans
                t={t}
                i18nKey="scenarios:trigger.run_scenario.description.docs"
                components={{
                  DocLink: (
                    // eslint-disable-next-line jsx-a11y/anchor-has-content
                    <a
                      className="text-purple-100"
                      href="https://docs.checkmarble.com/reference/introduction-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              />
              <br />
              <Trans
                t={t}
                i18nKey="scenarios:trigger.run_scenario.description.scenario_id"
                components={{
                  ScenarioIdLabel: <code className="select-none" />,
                  ScenarioIdValue: (
                    <code
                      aria-hidden="true"
                      className="border-grey-10 cursor-pointer select-none rounded-sm border px-1"
                      onClick={() => {
                        void navigator.clipboard
                          .writeText(scenarioIteration.scenarioId)
                          .then(() => {
                            toast.success(
                              t('common:clipboard.copy', {
                                replace: {
                                  value: scenarioIteration.scenarioId,
                                },
                              })
                            );
                          });
                      }}
                    />
                  ),
                }}
                values={{
                  scenarioId: scenarioIteration.scenarioId,
                }}
              />
            </p>
          </div>

          <div className="flex flex-col gap-2 lg:gap-4">
            <Paper.Title>
              {t('scenarios:trigger.trigger_object.title')}
            </Paper.Title>
            <Callout>{t('scenarios:trigger.trigger_object.callout')}</Callout>
          </div>
          <ScenarioBox className="bg-grey-02 col-span-4 w-fit p-2 font-semibold text-purple-100">
            {triggerObjectType}
          </ScenarioBox>
          <FormProvider {...formMethods}>
            <RootOrOperator
              renderAstNode={({ name }) => <EditAstNode name={name} />}
            />
          </FormProvider>
          <div className="flex flex-row justify-end">
            <Button type="submit" className="w-fit p-3">
              {t('common:save')}
            </Button>
          </div>
        </Paper.Container>
      </Form>
    </div>
  );
}
