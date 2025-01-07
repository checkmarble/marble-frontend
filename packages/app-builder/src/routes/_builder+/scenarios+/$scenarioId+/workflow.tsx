import { ErrorComponent, Page } from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { TriggerObjectTag } from '@app-builder/components/Scenario/TriggerObjectTag';
import { DetailPanel } from '@app-builder/components/Scenario/Workflow/DetailPanel/DetailPanel';
import {
  adaptScenarioUpdateWorkflowInput,
  adaptValidWorkflow,
  type ValidWorkflow,
} from '@app-builder/components/Scenario/Workflow/models/validation';
import { workflowI18n } from '@app-builder/components/Scenario/Workflow/workflow-i18n';
import {
  WorkflowFlow,
  workflowFlowStyles,
} from '@app-builder/components/Scenario/Workflow/WorkflowFlow';
import { WorkflowProvider } from '@app-builder/components/Scenario/Workflow/WorkflowProvider';
import {
  type ScenarioUpdateWorkflowInput,
  scenarioUpdateWorkflowInputSchema,
} from '@app-builder/models/scenario';
import { OptionsProvider } from '@app-builder/services/editor/options';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import {
  type LinksFunction,
  type LoaderFunctionArgs,
  redirect,
} from '@remix-run/node';
import { useFetcher, useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';

import { useCurrentScenario } from './_layout';

export const handle = {
  i18n: workflowI18n satisfies Namespace,
};

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: workflowFlowStyles },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;

  const scenarioId = fromParams(params, 'scenarioId');

  if (!(await featureAccessService.isWorkflowsAvailable())) {
    return redirect(
      getRoute('/scenarios/:scenarioId/home', {
        scenarioId: fromUUID(scenarioId),
      }),
    );
  }

  const {
    user,
    scenario,
    inbox,
    dataModelRepository,
    editor,
    customListsRepository,
  } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const [scenarios, inboxes, pivotValues] = await Promise.all([
    scenario.listScenarios(),
    inbox.listInboxes(),
    dataModelRepository.listPivots({}),
  ]);

  const currentScenario = scenarios.find((s) => s.id === scenarioId);

  const hasPivotValue = pivotValues.some(
    (pivot) => pivot.baseTable === currentScenario?.triggerObjectType,
  );

  const [operators, accessors, dataModel, customLists] = await Promise.all([
    editor.listOperators({
      scenarioId,
    }),
    editor.listAccessors({
      scenarioId,
    }),
    dataModelRepository.getDataModel(),
    customListsRepository.listCustomLists(),
  ]);

  return {
    scenarios,
    inboxes,
    hasPivotValue,
    workflowDataFeatureAccess: {
      isCreateInboxAvailable: featureAccessService.isCreateInboxAvailable(user),
    },
    builderOptions: {
      databaseAccessors: accessors.databaseAccessors,
      payloadAccessors: accessors.payloadAccessors,
      operators,
      dataModel,
      customLists,
    },
  };
}

export async function action({ request, params }: LoaderFunctionArgs) {
  const {
    authService,
    featureAccessService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;

  const scenarioId = fromParams(params, 'scenarioId');

  if (!(await featureAccessService.isWorkflowsAvailable())) {
    return redirect(
      getRoute('/scenarios/:scenarioId/home', {
        scenarioId: fromUUID(scenarioId),
      }),
    );
  }

  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const input = scenarioUpdateWorkflowInputSchema.parse(await request.json());

  const session = await getSession(request);

  try {
    await scenario.updateScenarioWorkflow(scenarioId, input);
  } catch {
    setToastMessage(session, {
      type: 'error',
      message: 'Something went wrong',
    });
    return redirect(
      getRoute('/scenarios/:scenarioId/workflow', {
        scenarioId: fromUUID(scenarioId),
      }),
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  const t = await getFixedT(request, ['workflows']);
  setToastMessage(session, {
    type: 'success',
    message:
      input.decisionToCaseWorkflowType === 'DISABLED'
        ? t('workflows:toast.success.delete_workflow')
        : t('workflows:toast.success.create_workflow'),
  });

  return redirect(
    getRoute('/scenarios/:scenarioId/home', {
      scenarioId: fromUUID(scenarioId),
    }),
    {
      headers: { 'Set-Cookie': await commitSession(session) },
    },
  );
}

export default function Workflow() {
  const {
    scenarios,
    inboxes,
    hasPivotValue,
    workflowDataFeatureAccess,
    builderOptions,
  } = useLoaderData<typeof loader>();

  const currentScenario = useCurrentScenario();
  const initialWorkflow = adaptValidWorkflow(currentScenario);

  const fetcher = useFetcher();

  const saveWorkflow = (workflow: ValidWorkflow) => {
    const input = adaptScenarioUpdateWorkflowInput(workflow);
    fetcher.submit(input, {
      method: 'POST',
      encType: 'application/json',
    });
  };

  const deleteWorkflow = () => {
    const input: ScenarioUpdateWorkflowInput = {
      decisionToCaseWorkflowType: 'DISABLED',
    };
    fetcher.submit(input, {
      method: 'POST',
      encType: 'application/json',
    });
  };

  return (
    <Page.Main>
      <Page.Header className="gap-4">
        <Page.BackLink
          to={getRoute('/scenarios/:scenarioId/home', {
            scenarioId: fromUUID(currentScenario.id),
          })}
        />
        <p className="line-clamp-2 text-start">{currentScenario.name}</p>

        <TriggerObjectTag>{currentScenario.triggerObjectType}</TriggerObjectTag>
      </Page.Header>
      <WorkflowProvider
        data={{
          scenarios,
          inboxes,
          nonEditableData: { scenarioId: currentScenario.id },
          hasPivotValue,
        }}
        workflowDataFeatureAccess={workflowDataFeatureAccess}
        initialWorkflow={initialWorkflow}
      >
        <div className="grid size-full grid-cols-[2fr_1fr]">
          <WorkflowFlow />
          <OptionsProvider
            {...{
              ...builderOptions,
              triggerObjectType: currentScenario.triggerObjectType,
            }}
          >
            <DetailPanel onDelete={deleteWorkflow} onSave={saveWorkflow} />
          </OptionsProvider>
        </div>
      </WorkflowProvider>
    </Page.Main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  return <ErrorComponent error={error} />;
}
