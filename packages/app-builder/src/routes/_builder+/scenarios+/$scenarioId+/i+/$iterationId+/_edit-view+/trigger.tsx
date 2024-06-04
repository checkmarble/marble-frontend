import {
  Callout,
  Paper,
  scenarioI18n,
  usePermissionsContext,
} from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { AstBuilder } from '@app-builder/components/Scenario/AstBuilder';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { ScheduleOption } from '@app-builder/components/Scenario/Trigger';
import {
  adaptNodeDto,
  type AstNode,
  NewEmptyTriggerAstNode,
} from '@app-builder/models';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { useTriggerValidationFetcher } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/validate-with-given-trigger-or-rule';
import {
  createDecisionDocHref,
  executeAScenarioDocHref,
} from '@app-builder/services/documentation-href';
import {
  useCurrentScenarioIteration,
  useEditorMode,
} from '@app-builder/services/editor';
import {
  adaptAstNodeFromEditorViewModel,
  useAstBuilder,
} from '@app-builder/services/editor/ast-editor';
import { serverServices } from '@app-builder/services/init.server';
import {
  useCurrentScenarioValidation,
  useGetScenarioErrorMessage,
} from '@app-builder/services/validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';

export const handle = {
  i18n: [...scenarioI18n, 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { apiClient, editor, organization, dataModelRepository } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  const scenarioId = fromParams(params, 'scenarioId');

  const [
    operators,
    accessors,
    dataModel,
    customLists,
    currentOrganization,
    scheduledExecutions,
  ] = await Promise.all([
    editor.listOperators({
      scenarioId,
    }),
    editor.listAccessors({
      scenarioId,
    }),
    dataModelRepository.getDataModel(),
    apiClient.listCustomLists(),
    organization.getCurrentOrganization(),
    apiClient.listScheduledExecutions({
      scenarioId,
    }),
  ]);

  return json({
    databaseAccessors: accessors.databaseAccessors,
    payloadAccessors: accessors.payloadAccessors,
    operators,
    dataModel,
    customLists: customLists.custom_lists,
    organization: currentOrganization,
    scheduledExecutions: scheduledExecutions.scheduled_executions,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const session = await getSession(request);
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  try {
    const iterationId = fromParams(params, 'iterationId');

    const { action, ...payload } = (await request.json()) as { action: string };

    if (action === 'trigger') {
      await apiClient.scheduleScenarioExecution(iterationId);
      return json({ success: true, error: null });
    }

    if (action === 'save') {
      const { astNode, schedule } = payload as {
        astNode: AstNode;
        schedule: string;
      };
      await apiClient.updateScenarioIteration(iterationId, {
        body: {
          trigger_condition_ast_expression: adaptNodeDto(astNode),
          schedule,
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

  const {
    databaseAccessors,
    payloadAccessors,
    operators,
    dataModel,
    customLists,
    organization,
    scheduledExecutions,
  } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<typeof action>();
  const editorMode = useEditorMode();
  const { canManageDecision } = usePermissionsContext();

  const [schedule, setSchedule] = useState(scenarioIteration.schedule ?? '');

  const { validate, validation: localValidation } = useTriggerValidationFetcher(
    scenarioIteration.scenarioId,
    scenarioIteration.id,
  );

  const scenario = useCurrentScenario();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  const astEditor = useAstBuilder({
    backendAst: scenarioIteration.trigger ?? NewEmptyTriggerAstNode(),
    backendEvaluation: scenarioValidation.trigger.triggerEvaluation,
    localEvaluation: localValidation,
    onValidate: validate,
  });

  const handleSave = () => {
    fetcher.submit(
      {
        action: 'save',
        astNode: adaptAstNodeFromEditorViewModel(astEditor.editorNodeViewModel),
        schedule,
      },
      {
        method: 'PATCH',
        encType: 'application/json',
      },
    );
  };

  const isLive = scenarioIteration.id == scenario.liveVersionId;
  const pendingExecutions = scheduledExecutions.filter((execution) =>
    ['pending', 'processing'].includes(execution.status),
  );
  const triggerFetcher = useFetcher<typeof action>();
  const handleTriggerExecution = () => {
    triggerFetcher.submit(
      { action: 'trigger' },
      { method: 'POST', encType: 'application/json' },
    );
  };

  return (
    <Paper.Container scrollable={false} className="bg-grey-00 max-w-3xl">
      <div className="flex flex-col gap-2 lg:gap-4">
        <Paper.Title>{t('scenarios:trigger.run_scenario.title')}</Paper.Title>
        <RunByApiInfo scenarioId={scenarioIteration.scenarioId} />
        <ScheduleOption
          schedule={schedule}
          setSchedule={setSchedule}
          hasExportBucket={!!organization.exportScheduledExecutionS3}
          viewOnly={editorMode === 'view'}
        />
      </div>
      {isLive && canManageDecision ? (
        <ManualTriggerButton
          handleTriggerExecution={handleTriggerExecution}
          hasPendingExecution={pendingExecutions.length > 0}
        />
      ) : null}

      <div className="flex flex-col gap-2 lg:gap-4">
        <Paper.Title>{t('scenarios:trigger.trigger_object.title')}</Paper.Title>
        <Callout className="w-fit" variant="outlined">
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
      </div>

      <AstBuilder
        options={{
          databaseAccessors,
          payloadAccessors,
          operators,
          dataModel,
          customLists,
          triggerObjectType: scenario.triggerObjectType,
        }}
        setOperand={astEditor.setOperand}
        setOperator={astEditor.setOperator}
        appendChild={astEditor.appendChild}
        remove={astEditor.remove}
        editorNodeViewModel={astEditor.editorNodeViewModel}
        viewOnly={editorMode === 'view'}
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
    </Paper.Container>
  );
}

function ManualTriggerButton({
  hasPendingExecution,
  handleTriggerExecution,
}: {
  hasPendingExecution: boolean;
  handleTriggerExecution: () => void;
}) {
  const { t } = useTranslation(handle.i18n);
  return (
    <div>
      <Button
        type="submit"
        disabled={hasPendingExecution}
        onClick={handleTriggerExecution}
        className={clsx({ 'cursor-not-allowed': hasPendingExecution })}
      >
        {t('scenarios:trigger.trigger_manual_execution.button')}
      </Button>
      {hasPendingExecution ? (
        <p className="my-2 text-xs">
          <Trans
            t={t}
            i18nKey="scenarios:trigger.trigger_manual_execution.warning"
            components={{
              Link: (
                // eslint-disable-next-line jsx-a11y/anchor-has-content
                <Link
                  to={getRoute('/scheduled-executions')}
                  className="text-purple-100"
                />
              ),
            }}
          />
        </p>
      ) : null}
    </div>
  );
}

function RunByApiInfo({ scenarioId }: { scenarioId: string }) {
  const { t } = useTranslation(handle.i18n);
  const getCopyToClipboardProps = useGetCopyToClipboard();

  return (
    <p className="text-s text-grey-100 font-normal">
      <Trans
        t={t}
        i18nKey="scenarios:trigger.run_scenario.description.docs"
        components={{
          DocLink: <ExternalLink href={createDecisionDocHref} />,
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
              className="border-grey-10 cursor-pointer select-none rounded-sm border px-1"
              {...getCopyToClipboardProps(scenarioId)}
            />
          ),
        }}
        values={{
          scenarioId,
        }}
      />
    </p>
  );
}
