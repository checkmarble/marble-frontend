import { Callout, CopyToClipboardButton, scenarioI18n } from '@app-builder/components';
import { AstBuilder } from '@app-builder/components/AstBuilder';
import { type AstBuilderNodeStore } from '@app-builder/components/AstBuilder/edition/node-store';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { ScheduleOption } from '@app-builder/components/Scenario/Trigger';
import { useDetectionScenarioData } from '@app-builder/hooks/routes-layout-data';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isUndefinedAstNode, NewEmptyTriggerAstNode, NewUndefinedAstNode } from '@app-builder/models';
import { type ScenarioValidationErrorCode } from '@app-builder/models/ast-validation';
import { useSaveTriggerMutation } from '@app-builder/queries/scenarios/save-trigger';
import {
  buildDatabaseAccessorsFromDataModel,
  buildPayloadAccessorsFromDataModel,
} from '@app-builder/server-fns/scenarios';
import { createDecisionDocHref, executeAScenarioDocHref } from '@app-builder/services/documentation-href';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { hasAnyEntitlement, isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import { useGetScenarioErrorMessage } from '@app-builder/services/validation';
import { fromParams } from '@app-builder/utils/short-uuid';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Collapsible } from 'ui-design-system';
import { Icon } from 'ui-icons';

const triggerLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function triggerLoader({ data, context }) {
    const { customListsRepository, dataModelRepository, scenario, entitlements, continuousScreening } =
      context.authInfo;

    const scenarioId = fromParams(data?.params ?? {}, 'scenarioId');
    const [currentScenario, customLists, dataModel, screeningConfigs] = await Promise.all([
      scenario.getScenario({ scenarioId }),
      customListsRepository.listCustomLists(),
      dataModelRepository.getDataModel(),
      isContinuousScreeningAvailable(entitlements) ? continuousScreening.listConfigurations() : Promise.resolve([]),
    ]);

    return {
      databaseAccessors: buildDatabaseAccessorsFromDataModel(dataModel, currentScenario.triggerObjectType),
      payloadAccessors: buildPayloadAccessorsFromDataModel(dataModel, currentScenario.triggerObjectType),
      dataModel,
      customLists,
      triggerObjectType: currentScenario.triggerObjectType,
      hasValidLicense: hasAnyEntitlement(entitlements),
      hasContinuousScreening: isContinuousScreeningAvailable(entitlements),
      screeningConfigs,
    };
  });

export const Route = createFileRoute(
  '/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/trigger',
)({
  loader: ({ params }) => triggerLoader({ data: { params } }),
  component: Trigger,
});

function Trigger() {
  const { t } = useTranslation([...scenarioI18n, 'common']);
  const { scenarioIteration, scenarioValidation } = useLoaderData({
    from: '/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId',
  });
  const [validationErrors, setValidationErrors] = useState<ScenarioValidationErrorCode[]>(
    scenarioValidation.trigger.errors,
  );
  const saveTriggerMutation = useSaveTriggerMutation();

  const builderOptions = Route.useLoaderData();

  const editorMode = useEditorMode();

  const [schedule, setSchedule] = useState(scenarioIteration.schedule ?? '');

  const { currentScenario } = useDetectionScenarioData();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  const [trigger, setTrigger] = useState(scenarioIteration.trigger ?? NewUndefinedAstNode());
  const isTriggerNull = isUndefinedAstNode(trigger);
  const nodeStoreRef = useRef<AstBuilderNodeStore | null>(null);

  const handleSave = async () => {
    const node = nodeStoreRef.current ? nodeStoreRef.current.select((s) => s.$node).peek() : NewUndefinedAstNode();

    try {
      await saveTriggerMutation.mutateAsync({
        iterationId: scenarioIteration.id,
        schedule,
        astNode: node,
      });
      toast.success(t('common:success.save'));
    } catch {
      toast.error(t('common:errors.unknown'));
    }
  };

  const handleAddTrigger = () => {
    setTrigger(NewEmptyTriggerAstNode());
  };

  const handleDeleteTrigger = () => {
    setTrigger(NewUndefinedAstNode());
  };

  return (
    <>
      <Collapsible.Container className="bg-surface-card max-w-3xl">
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
                            <CopyToClipboardButton toCopy={scenarioIteration.scenarioId} className="inline-flex" />
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
                  <Trans t={t} i18nKey="scenarios:trigger.run_scenario.description.batch_execution" />
                  <ul className="list-outside space-y-1 pl-4">
                    <li>
                      <ScheduleOption schedule={schedule} setSchedule={setSchedule} viewOnly={editorMode === 'view'} />
                    </li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </Collapsible.Content>
      </Collapsible.Container>

      <Collapsible.Container className="bg-surface-card max-w-3xl">
        <Collapsible.Title>{t('scenarios:trigger.trigger_object.title')}</Collapsible.Title>
        <Collapsible.Content>
          <Callout variant="outlined" className="mb-4 lg:mb-6">
            <p className="whitespace-pre-wrap">
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
              <div className="border-blue-58 bg-blue-96 text-blue-58 flex items-center rounded-sm border p-2 dark:bg-transparent">
                <span>
                  <Trans
                    t={t}
                    i18nKey="scenarios:trigger.trigger_object.no_trigger"
                    values={{ objectType: currentScenario.triggerObjectType }}
                  />
                </span>
              </div>
            ) : (
              <AstBuilder.Provider
                scenarioId={currentScenario.id}
                initialData={{ ...builderOptions }}
                mode={editorMode}
              >
                <AstBuilder.Root
                  node={trigger}
                  onStoreChange={(nodeStore) => {
                    nodeStoreRef.current = nodeStore;
                  }}
                  onValidationUpdate={(validation) => {
                    setValidationErrors(validation.errors);
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
                  <Button variant="primary" type="submit" onClick={handleSave} disabled={saveTriggerMutation.isPending}>
                    {saveTriggerMutation.isPending ? <Icon icon="spinner" className="size-4" /> : null}
                    {t('common:save')}
                  </Button>
                </div>
                <EvaluationErrors
                  errors={validationErrors
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
