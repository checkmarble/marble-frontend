import { Callout, Paper, scenarioI18n } from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { AstBuilder } from '@app-builder/components/Scenario/AstBuilder';
import { ScheduleOption } from '@app-builder/components/Scenario/Trigger';
import {
  adaptDataModelDto,
  adaptNodeDto,
  type AstNode,
} from '@app-builder/models';
import { useCurrentScenario } from '@app-builder/routes/__builder/scenarios/$scenarioId';
import { useTriggerOrRuleValidationFetcher } from '@app-builder/routes/ressources/scenarios/$scenarioId/$iterationId/validate-with-given-trigger-or-rule';
import { useEditorMode } from '@app-builder/services/editor';
import {
  adaptAstNodeFromEditorViewModel,
  useAstBuilder,
} from '@app-builder/services/editor/ast-editor';
import { serverServices } from '@app-builder/services/init.server';
import { fromParams } from '@app-builder/utils/short-uuid';
import { useGetCopyToClipboard } from '@app-builder/utils/use-get-copy-to-clipboard';
import { type ActionArgs, json, type LoaderArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { Button } from '@ui-design-system';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useCurrentScenarioIteration } from '../../$iterationId';

export const handle = {
  i18n: [...scenarioI18n, 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { authService, makeScenarioService } = serverServices;
  const { apiClient, editor, organization, scenario } =
    await authService.isAuthenticated(request, {
      failureRedirect: '/login',
    });

  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  const operatorsPromise = editor.listOperators({
    scenarioId,
  });

  const identifiersPromise = editor.listIdentifiers({
    scenarioId,
  });

  const dataModelPromise = apiClient.getDataModel();
  const { custom_lists } = await apiClient.listCustomLists();
  const organizationPromise = organization.getCurrentOrganization();

  const scenarioService = makeScenarioService(scenario);
  const scenarioIterationTriggerPromise =
    scenarioService.getScenarioIterationTrigger({
      iterationId,
    });

  return json({
    identifiers: await identifiersPromise,
    operators: await operatorsPromise,
    trigger: await scenarioIterationTriggerPromise,
    dataModel: adaptDataModelDto((await dataModelPromise).data_model),
    customLists: custom_lists,
    organization: await organizationPromise,
  });
}

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

    const { astNode, schedule } = (await request.json()) as {
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
      },
      { headers: { 'Set-Cookie': await commitSession(session) } }
    );
  }
}

export default function Trigger() {
  const { t } = useTranslation(handle.i18n);
  const scenarioIteration = useCurrentScenarioIteration();
  const {
    identifiers,
    operators,
    trigger,
    dataModel,
    customLists,
    organization,
  } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<typeof action>();
  const mode = useEditorMode();

  const [schedule, setSchedule] = useState(scenarioIteration.schedule ?? '');

  const { validate, validation: localValidation } =
    useTriggerOrRuleValidationFetcher(
      scenarioIteration.scenarioId,
      scenarioIteration.id
    );

  const scenario = useCurrentScenario();

  const astEditor = useAstBuilder({
    backendAst: trigger.ast,
    backendValidation: trigger.validation,
    localValidation,
    identifiers,
    operators,
    dataModel,
    customLists,
    triggerObjectType: scenario.triggerObjectType,
    onValidate: validate,
  });

  const handleSave = () => {
    fetcher.submit(
      {
        astNode: adaptAstNodeFromEditorViewModel(astEditor.editorNodeViewModel),
        schedule,
      },
      {
        method: 'PATCH',
        encType: 'application/json',
      }
    );
  };

  return (
    <Paper.Container scrollable={false} className="max-w-3xl">
      <div className="flex flex-col gap-2 lg:gap-4">
        <Paper.Title>{t('scenarios:trigger.run_scenario.title')}</Paper.Title>
        <RunByApiInfo scenarioId={scenarioIteration.scenarioId} />
        <ScheduleOption
          schedule={schedule}
          setSchedule={setSchedule}
          hasExportBucket={!!organization.exportScheduledExecutionS3}
          viewOnly={mode === 'view'}
        />
      </div>

      <div className="flex flex-col gap-2 lg:gap-4">
        <Paper.Title>{t('scenarios:trigger.trigger_object.title')}</Paper.Title>
        <Callout className="w-fit">
          {t('scenarios:trigger.trigger_object.callout')}
        </Callout>
      </div>

      <AstBuilder builder={astEditor} viewOnly={mode === 'view'} />

      {mode === 'edit' && (
        <div className="flex flex-row justify-end">
          <Button type="submit" className="w-fit" onClick={handleSave}>
            {t('common:save')}
          </Button>
        </div>
      )}
    </Paper.Container>
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
