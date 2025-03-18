import { Callout, scenarioI18n } from '@app-builder/components';
import { AstBuilder } from '@app-builder/components/AstBuilder';
import { type AstBuilderNodeStore } from '@app-builder/components/AstBuilder/edition/node-store';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { ScheduleOption } from '@app-builder/components/Scenario/Trigger';
import {
  type AstNode,
  isUndefinedAstNode,
  NewEmptyTriggerAstNode,
  NewUndefinedAstNode,
} from '@app-builder/models';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import {
  createDecisionDocHref,
  executeAScenarioDocHref,
} from '@app-builder/services/documentation-href';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { initServerServices } from '@app-builder/services/init.server';
import { useGetScenarioErrorMessage } from '@app-builder/services/validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Collapsible } from 'ui-design-system';

import { useCurrentScenarioIteration, useCurrentScenarioValidation } from '../_layout';

export const handle = {
  i18n: [...scenarioI18n, 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { customListsRepository, editor, dataModelRepository, scenario } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  const scenarioId = fromParams(params, 'scenarioId');
  const [currentScenario, customLists, dataModel, accessors] = await Promise.all([
    scenario.getScenario({ scenarioId }),
    customListsRepository.listCustomLists(),
    dataModelRepository.getDataModel(),
    editor.listAccessors({ scenarioId }),
  ]);

  return json({
    databaseAccessors: accessors.databaseAccessors,
    payloadAccessors: accessors.payloadAccessors,
    dataModel,
    customLists,
    triggerObjectType: currentScenario.triggerObjectType,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);
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

  const builderOptions = useLoaderData<typeof loader>();

  const fetcher = useFetcher<typeof action>();
  const editorMode = useEditorMode();

  const [schedule, setSchedule] = useState(scenarioIteration.schedule ?? '');

  const scenario = useCurrentScenario();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  const [trigger, setTrigger] = useState(scenarioIteration.trigger ?? NewUndefinedAstNode());
  const isTriggerNull = isUndefinedAstNode(trigger);
  const nodeStoreRef = useRef<AstBuilderNodeStore | null>(null);

  const handleSave = () => {
    const node = nodeStoreRef.current
      ? nodeStoreRef.current.select((s) => s.$node).peek()
      : NewUndefinedAstNode();

    fetcher.submit(
      {
        action: 'save',
        astNode: node,
        schedule,
      },
      {
        method: 'PATCH',
        encType: 'application/json',
      },
    );
  };

  const handleAddTrigger = () => {
    setTrigger(NewEmptyTriggerAstNode());
  };

  const handleDeleteTrigger = () => {
    setTrigger(NewUndefinedAstNode());
  };

  const getCopyToClipboardProps = useGetCopyToClipboard();
  return (
    <>
      <Collapsible.Container className="bg-grey-100 max-w-3xl">
        <Collapsible.Title>{t('scenarios:trigger.run_scenario.title')}</Collapsible.Title>
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
                              {...getCopyToClipboardProps(scenarioIteration.scenarioId)}
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
        <Collapsible.Title>{t('scenarios:trigger.trigger_object.title')}</Collapsible.Title>
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
            {isTriggerNull ? (
              <div className="border-blue-58 bg-blue-96 text-blue-58 flex items-center rounded border p-2">
                <span>
                  <Trans
                    t={t}
                    i18nKey="scenarios:trigger.trigger_object.no_trigger"
                    values={{ objectType: scenario.triggerObjectType }}
                  />
                </span>
              </div>
            ) : (
              <AstBuilder.Provider
                scenarioId={scenario.id}
                initialData={{ ...builderOptions }}
                mode={editorMode}
              >
                <AstBuilder.Root
                  node={trigger}
                  onStoreChange={(nodeStore) => {
                    nodeStoreRef.current = nodeStore;
                  }}
                  returnType="bool"
                />
              </AstBuilder.Provider>
            )}

            {editorMode === 'edit' ? (
              <div className="flex flex-row-reverse items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isTriggerNull ? (
                    <Button type="button" variant="secondary" onClick={handleAddTrigger}>
                      {t('scenarios:trigger.trigger_object.add_trigger')}
                    </Button>
                  ) : (
                    <Button type="button" variant="secondary" onClick={handleDeleteTrigger}>
                      {t('scenarios:trigger.trigger_object.delete_trigger')}
                    </Button>
                  )}
                  <Button type="submit" onClick={handleSave}>
                    {t('common:save')}
                  </Button>
                </div>
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
