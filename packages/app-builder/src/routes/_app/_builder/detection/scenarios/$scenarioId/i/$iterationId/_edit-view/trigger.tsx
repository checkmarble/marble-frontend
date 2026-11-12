import { Callout, CopyToClipboardButton, scenarioI18n } from '@app-builder/components';
import { AstBuilder } from '@app-builder/components/AstBuilder';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { useScheduleForm } from '@app-builder/components/Scenario/Trigger';
import { useDetectionScenarioData, useDetectionScenarioIterationData } from '@app-builder/hooks/routes-layout-data';
import { isUndefinedAstNode, NewEmptyTriggerAstNode, NewUndefinedAstNode } from '@app-builder/models';
import { useSaveTriggerMutation } from '@app-builder/queries/scenarios/save-trigger';
import { useValidateAstMutation } from '@app-builder/queries/validate-ast';
import { type FlatAstValidation, getBuilderOptionsFn } from '@app-builder/server-fns/scenarios';
import { createDecisionDocHref, executeAScenarioDocHref } from '@app-builder/services/documentation-href';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { useGetScenarioErrorMessage } from '@app-builder/services/validation';
import { fromSUUIDtoUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Collapsible } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const Route = createFileRoute(
  '/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/trigger',
)({
  loader: ({ params }) => getBuilderOptionsFn({ data: { scenarioId: fromSUUIDtoUUID(params.scenarioId) } }),
  component: Trigger,
});

function hasTriggerErrors(validation: FlatAstValidation) {
  return (
    validation.errors.some((error) => error !== 'TRIGGER_CONDITION_REQUIRED') ||
    validation.evaluation.some((row) => row.errors.length > 0)
  );
}

function Trigger() {
  const { t } = useTranslation([...scenarioI18n, 'common']);
  const { scenarioIteration, scenarioValidation } = useDetectionScenarioIterationData();
  const [validation, setValidation] = useState<FlatAstValidation>({
    errors: scenarioValidation.trigger.errors,
    evaluation: [],
  });
  const validationErrors = validation.errors.filter((error) => error !== 'TRIGGER_CONDITION_REQUIRED');
  const saveTriggerMutation = useSaveTriggerMutation();
  const { currentScenario } = useDetectionScenarioData();
  const validateTriggerMutation = useValidateAstMutation({ scenarioId: currentScenario.id });

  const builderOptions = Route.useLoaderData();

  const editorMode = useEditorMode();

  const router = useRouter();

  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  const initialTrigger =
    scenarioIteration.trigger && !isUndefinedAstNode(scenarioIteration.trigger) ? scenarioIteration.trigger : null;
  const [savedTrigger, setSavedTrigger] = useState(initialTrigger);
  const [trigger, setTrigger] = useState(initialTrigger);
  const isTriggerChanged = !R.isDeepEqual(trigger, savedTrigger);

  const form = useScheduleForm(scenarioIteration.schedule ?? '', async (schedule) => {
    if (trigger !== null) {
      // The builder validates each edit in the background, so its last result can predate the latest
      // edit. Validate the trigger being saved instead.
      let triggerValidation: FlatAstValidation;
      try {
        triggerValidation = await validateTriggerMutation.mutateAsync({
          node: trigger,
          expectedReturnType: 'bool',
          ac: new AbortController(),
        });
      } catch {
        toast.error(t('common:errors.unknown'));
        return;
      }
      setValidation(triggerValidation);
      if (hasTriggerErrors(triggerValidation)) {
        toast.error(t('scenarios:trigger.trigger_object.invalid'));
        return;
      }
    }

    try {
      await saveTriggerMutation.mutateAsync({
        iterationId: scenarioIteration.id,
        schedule,
        astNode: trigger ?? NewUndefinedAstNode(),
      });
    } catch {
      toast.error(t('common:errors.unknown'));
      return;
    }

    await router.invalidate();
    form.reset({ schedule });
    setSavedTrigger(trigger);
    toast.success(t('common:success.save'));
  });

  const handleAddTrigger = () => {
    setTrigger(NewEmptyTriggerAstNode());
  };

  const handleDeleteTrigger = () => {
    setTrigger(null);
  };

  const saving = validateTriggerMutation.isPending || saveTriggerMutation.isPending;
  const saveButton = (
    <Button variant="primary" type="button" onClick={() => void form.handleSubmit()} disabled={saving}>
      {saving ? <Icon icon="spinner" className="size-4" /> : null}
      {t('common:save')}
    </Button>
  );

  return (
    <>
      <Collapsible.Container className="bg-surface-card max-w-3xl">
        <Collapsible.Title>{t('scenarios:trigger.run_scenario.title')}</Collapsible.Title>
        <Collapsible.Content>
          <div className="flex flex-col">
            <div className="space-y-sm">
              <p>
                <Trans
                  t={t}
                  i18nKey="scenarios:trigger.run_scenario.description"
                  components={{
                    DocLink: <ExternalLink href={executeAScenarioDocHref} />,
                  }}
                />
              </p>
              <ol className="list-outside list-decimal space-y-md ps-lg">
                <li>
                  <Trans
                    t={t}
                    i18nKey="scenarios:trigger.run_scenario.description.api_execution"
                    components={{
                      DocLink: <ExternalLink href={createDecisionDocHref} />,
                    }}
                  />
                  <ul className="list-outside space-y-xs ps-md">
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
                  <ul className="list-outside space-y-xs ps-md">
                    <li>
                      <form.AppField name="schedule">
                        {(field) => (
                          <field.ScheduleOption
                            viewOnly={editorMode === 'view'}
                            deduplicationEnabled={currentScenario.deduplicateBatchObjects}
                          />
                        )}
                      </form.AppField>
                      <form.Subscribe selector={(state) => !state.isDefaultValue}>
                        {(scheduleChanged) =>
                          scheduleChanged ? <div className="mt-sm flex justify-end">{saveButton}</div> : null
                        }
                      </form.Subscribe>
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
          <Callout variant="outlined" className="mb-md lg:mb-lg">
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
          <div className="flex flex-col gap-sm lg:gap-md">
            {trigger === null ? (
              <div className="border-blue-58 bg-blue-96 text-blue-58 flex items-center rounded-sm border p-sm dark:bg-transparent">
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
                  onUpdate={setTrigger}
                  onValidationUpdate={setValidation}
                  returnType="bool"
                />
              </AstBuilder.Provider>
            )}

            {editorMode === 'edit' ? (
              <div className="flex flex-row-reverse items-center justify-between gap-sm">
                <div className="flex items-center gap-sm">
                  {trigger === null ? (
                    <Button type="button" variant="secondary" onClick={handleAddTrigger}>
                      {t('scenarios:trigger.trigger_object.add_trigger')}
                    </Button>
                  ) : (
                    <Button type="button" variant="secondary" onClick={handleDeleteTrigger}>
                      {t('scenarios:trigger.trigger_object.delete_trigger')}
                    </Button>
                  )}
                  {isTriggerChanged ? saveButton : null}
                </div>
                <EvaluationErrors errors={validationErrors.map(getScenarioErrorMessage)} />
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
