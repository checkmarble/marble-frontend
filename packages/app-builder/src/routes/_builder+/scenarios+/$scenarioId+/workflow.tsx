import { ErrorComponent, Page } from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { DetailPanel } from '@app-builder/components/Scenario/Workflow/DetailPanel/DetailPanel';
import {
  adaptScenarioUpdateWorkflowInput,
  adaptValidWorkflow,
  type ValidWorkflow,
} from '@app-builder/components/Scenario/Workflow/models/validation';
import {
  WorkflowFlow,
  workflowFlowStyles,
} from '@app-builder/components/Scenario/Workflow/WorkflowFlow';
import { WorkflowProvider } from '@app-builder/components/Scenario/Workflow/WorkflowProvider';
import { workflowI18n } from '@app-builder/components/Scenario/Workflow/workflow-i18n';
import {
  type ScenarioUpdateWorkflowInput,
  scenarioUpdateWorkflowInputSchema,
} from '@app-builder/models/scenario';
import { isCreateInboxAvailable, isWorkflowsAvailable } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LinksFunction, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher, useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';

import { useCurrentScenario } from './_layout';

export const handle = {
  i18n: workflowI18n satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['scenarios']);
      const currentScenario = useCurrentScenario();

      return (
        <BreadCrumbLink
          isLast={isLast}
          to={getRoute('/scenarios/:scenarioId/workflow', {
            scenarioId: fromUUIDtoSUUID(currentScenario.id),
          })}
        >
          {t('scenarios:home.workflow')}
        </BreadCrumbLink>
      );
    },
  ],
};

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: workflowFlowStyles }];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const scenarioId = fromParams(params, 'scenarioId');

  const { user, scenario, inbox, dataModelRepository, entitlements } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  if (!isWorkflowsAvailable(entitlements)) {
    return redirect(
      getRoute('/scenarios/:scenarioId/home', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
      }),
    );
  }

  const [scenarios, inboxes, pivotValues] = await Promise.all([
    scenario.listScenarios(),
    inbox.listInboxes(),
    dataModelRepository.listPivots({}),
  ]);

  const currentScenario = scenarios.find((s) => s.id === scenarioId);

  const hasPivotValue = pivotValues.some(
    (pivot) => pivot.baseTable === currentScenario?.triggerObjectType,
  );

  return {
    scenarios,
    inboxes,
    hasPivotValue,
    workflowDataFeatureAccess: {
      isCreateInboxAvailable: isCreateInboxAvailable(user),
    },
  };
}

export async function action({ request, params }: LoaderFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);
  const scenarioId = fromParams(params, 'scenarioId');
  const { scenario, entitlements } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  if (!isWorkflowsAvailable(entitlements)) {
    return redirect(
      getRoute('/scenarios/:scenarioId/home', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
      }),
    );
  }

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
        scenarioId: fromUUIDtoSUUID(scenarioId),
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
      scenarioId: fromUUIDtoSUUID(scenarioId),
    }),
    {
      headers: { 'Set-Cookie': await commitSession(session) },
    },
  );
}

export default function Workflow() {
  const { scenarios, inboxes, hasPivotValue, workflowDataFeatureAccess } =
    useLoaderData<typeof loader>();

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
        <BreadCrumbs />
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
          <DetailPanel onDelete={deleteWorkflow} onSave={saveWorkflow} />
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
