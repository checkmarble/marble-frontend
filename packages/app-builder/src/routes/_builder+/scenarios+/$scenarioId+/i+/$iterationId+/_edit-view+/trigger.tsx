import { Callout, scenarioI18n } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { AstBuilder } from '@app-builder/components/Scenario/AstBuilder';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { ScheduleOption } from '@app-builder/components/Scenario/Trigger';
import { type AstNode, NewEmptyTriggerAstNode } from '@app-builder/models';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { useTriggerValidationFetcher } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/validate-with-given-trigger-or-rule';
import {
  createDecisionDocHref,
  executeAScenarioDocHref,
} from '@app-builder/services/documentation-href';
import { useEditorMode } from '@app-builder/services/editor';
import {
  useAstNodeEditor,
  useSaveAstNode,
  useValidateAstNode,
} from '@app-builder/services/editor/ast-editor';
import { serverServices } from '@app-builder/services/init.server';
import { useGetScenarioErrorMessage } from '@app-builder/services/validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Collapsible } from 'ui-design-system';

import {
  useCurrentScenarioIteration,
  useCurrentScenarioValidation,
} from '../_layout';

export const handle = {
  i18n: [...scenarioI18n, 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { customListsRepository, editor, dataModelRepository } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  const scenarioId = fromParams(params, 'scenarioId');

  const [accessors, dataModel, customLists] = await Promise.all([
    editor.listAccessors({
      scenarioId,
    }),
    dataModelRepository.getDataModel(),
    customListsRepository.listCustomLists(),
  ]);

  return json({
    databaseAccessors: accessors.databaseAccessors,
    payloadAccessors: accessors.payloadAccessors,
    dataModel,
    customLists,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const session = await getSession(request);
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  try {
    const iterationId = fromParams(params, 'iterationId');

    const { action, ...payload } = (await request.json()) as { action: string };

    if (action === 'save') {
      const { astNode: triggerConditionAstExpression, schedule } = payload as {
        astNode: AstNode;
        schedule: string;
      };
      await scenario.updateScenarioIteration(iterationId, {
        triggerConditionAstExpression,
        schedule,
      });

      setToastMessage(session, {
        type: 'success',
        messageKey: 'common:success.save',
      });

      return json(
        {
          success: true as const,
          error: null,
        },
        { headers: { 'Set-Cookie': await commitSession(session) } },
      );
    }
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(
      {
        success: false as const,
        error: null,
      },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}

export default function Trigger() {
  const { t } = useTranslation(handle.i18n);
  const scenarioIteration = useCurrentScenarioIteration();
  const scenarioValidation = useCurrentScenarioValidation();

  const { databaseAccessors, payloadAccessors, dataModel, customLists } =
    useLoaderData<typeof loader>();

  const fetcher = useFetcher<typeof action>();
  const editorMode = useEditorMode();

  const [schedule, setSchedule] = useState(scenarioIteration.schedule ?? '');

  const { validate, validation } = useTriggerValidationFetcher(
    scenarioIteration.scenarioId,
    scenarioIteration.id,
  );

  const scenario = useCurrentScenario();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  const astEditorStore = useAstNodeEditor({
    initialAstNode: scenarioIteration.trigger ?? NewEmptyTriggerAstNode(),
    initialEvaluation: scenarioValidation.trigger.triggerEvaluation,
  });

  useValidateAstNode(astEditorStore, validate, validation);

  const handleSave = useSaveAstNode(astEditorStore, (astNode) => {
    fetcher.submit(
      {
        action: 'save',
        astNode,
        schedule,
      },
      {
        method: 'PATCH',
        encType: 'application/json',
      },
    );
  });

  const getCopyToClipboardProps = useGetCopyToClipboard();
  return (
    <>
      <Collapsible.Container className="bg-grey-100 max-w-3xl">
        <Collapsible.Title>
          {t('scenarios:trigger.run_scenario.title')}
        </Collapsible.Title>
        <Collapsible.Content>
          <div className="flex flex-col">
            <div className="space-y-2">
              <p>
                <Trans
                  t={t}
                  i18nKey="scenarios:trigger.run_scenario.description"
                  components={{
                    DocLink: <ExternalLink href={executeAScenarioDocHref} />,
                  }}
                />
              </p>
              <ol className="list-outside list-decimal space-y-4 pl-6">
                <li>
                  <Trans
                    t={t}
                    i18nKey="scenarios:trigger.run_scenario.description.api_execution"
                    components={{
                      DocLink: <ExternalLink href={createDecisionDocHref} />,
                    }}
                  />
                  <ul className="list-outside space-y-1 pl-4">
                    <li>
                      <Trans
                        t={t}
                        i18nKey="scenarios:trigger.run_scenario.description.api_execution.scenario_id"
                        components={{
                          ScenarioIdLabel: <code className="select-none" />,
                          ScenarioIdValue: (
                            <code
                              className="border-grey-90 cursor-pointer select-none rounded-sm border px-1"
                              {...getCopyToClipboardProps(
                                scenarioIteration.scenarioId,
                              )}
                            />
                          ),
                        }}
                        values={{
                          scenarioId: scenarioIteration.scenarioId,
                        }}
                      />
                    </li>
                  </ul>
                </li>
                <li>
                  <Trans
                    t={t}
                    i18nKey="scenarios:trigger.run_scenario.description.batch_execution"
                  />
                  <ul className="list-outside space-y-1 pl-4">
                    <li>
                      <ScheduleOption
                        schedule={schedule}
                        setSchedule={setSchedule}
                        viewOnly={editorMode === 'view'}
                      />
                    </li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </Collapsible.Content>
      </Collapsible.Container>

      <Collapsible.Container className="bg-grey-100 max-w-3xl">
        <Collapsible.Title>
          {t('scenarios:trigger.trigger_object.title')}
        </Collapsible.Title>
        <Collapsible.Content>
          <Callout variant="outlined" className="mb-4 lg:mb-6">
            <p className="whitespace-pre text-wrap">
              <Trans
                t={t}
                i18nKey="scenarios:trigger.trigger_object.callout"
                components={{
                  DocLink: <ExternalLink href={executeAScenarioDocHref} />,
                }}
              />
            </p>
          </Callout>
          <div className="flex flex-col gap-2 lg:gap-4">
            <AstBuilder
              options={{
                databaseAccessors,
                payloadAccessors,
                dataModel,
                customLists,
                triggerObjectType: scenario.triggerObjectType,
              }}
              viewOnly={editorMode === 'view'}
              astEditorStore={astEditorStore}
            />

            {editorMode === 'edit' ? (
              <div className="flex flex-row-reverse items-center justify-between gap-2">
                <Button type="submit" onClick={handleSave}>
                  {t('common:save')}
                </Button>
                <EvaluationErrors
                  errors={scenarioValidation.trigger.errors
                    .filter((error) => error != 'TRIGGER_CONDITION_REQUIRED')
                    .map(getScenarioErrorMessage)}
                />
              </div>
            ) : (
              <EvaluationErrors
                errors={scenarioValidation.trigger.errors
                  .filter((error) => error != 'TRIGGER_CONDITION_REQUIRED')
                  .map(getScenarioErrorMessage)}
              />
            )}
          </div>
        </Collapsible.Content>
      </Collapsible.Container>
    </>
  );
}
