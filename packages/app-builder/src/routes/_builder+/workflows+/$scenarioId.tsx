import { ErrorComponent, Page } from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
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
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
  redirect,
} from '@remix-run/node';
import { useFetcher, useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: workflowI18n satisfies Namespace,
};

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: workflowFlowStyles },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { scenario, inbox, dataModelRepository } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  const scenarioId = fromParams(params, 'scenarioId');

  const [scenarios, inboxes, pivotValues] = await Promise.all([
    scenario.listScenarios(),
    inbox.listInboxes(),
    dataModelRepository.listPivots({}),
  ]);

  const currentScenario = scenarios.find((s) => s.id === scenarioId);
  const initialWorkflow = currentScenario
    ? adaptValidWorkflow(currentScenario)
    : undefined;

  const hasPivotValue = pivotValues.some(
    (pivot) => pivot.baseTable === currentScenario?.triggerObjectType,
  );

  return json({
    nonEditableData: { scenarioId },
    scenarioName: currentScenario?.name,
    initialWorkflow,
    scenarios,
    inboxes,
    hasPivotValue,
  });
}

export async function action({ request, params }: LoaderFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioId = fromParams(params, 'scenarioId');

  const input = scenarioUpdateWorkflowInputSchema.parse(await request.json());

  await scenario.updateScenarioWorkflow(scenarioId, input);

  const session = await getSession(request);
  const t = await getFixedT(request, ['workflows']);
  setToastMessage(session, {
    type: 'success',
    message:
      input.decisionToCaseWorkflowType === 'DISABLED'
        ? t('workflows:toast.success.delete_workflow')
        : t('workflows:toast.success.create_workflow'),
  });

  return redirect(getRoute('/workflows/'), {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}

export default function Workflow() {
  const {
    nonEditableData,
    scenarioName,
    initialWorkflow,
    scenarios,
    inboxes,
    hasPivotValue,
  } = useLoaderData<typeof loader>();

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
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Page.BackButton />
          {scenarioName}
        </div>
      </Page.Header>
      <WorkflowProvider
        data={{ scenarios, inboxes, nonEditableData, hasPivotValue }}
        initialWorkflow={initialWorkflow}
      >
        <div className="grid size-full grid-cols-[2fr_1fr]">
          <WorkflowFlow />
          <DetailPanel onDelete={deleteWorkflow} onSave={saveWorkflow} />
        </div>
      </WorkflowProvider>
    </Page.Container>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  return <ErrorComponent error={error} />;
}
