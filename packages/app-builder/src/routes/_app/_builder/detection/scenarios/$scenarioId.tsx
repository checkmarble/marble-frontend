import { ErrorComponent } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { TriggerObjectTag } from '@app-builder/components/Scenario/TriggerObjectTag';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { adaptScenarioIterationSummaryWithType } from '@app-builder/models/scenario/iteration';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const scenarioLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function scenarioLayoutLoader({ data, context }) {
    const scenarioId = fromParams(data?.params ?? {}, 'scenarioId');

    const [currentScenario, scenarioIterations] = await Promise.all([
      context.authInfo.scenario.getScenario({ scenarioId }),
      context.authInfo.scenario.listScenarioIterationsMetadata({ scenarioId }),
    ]);

    return {
      currentScenario,
      scenarioIterations: scenarioIterations.map((dto) =>
        adaptScenarioIterationSummaryWithType(dto, currentScenario.liveVersionId),
      ),
    };
  });

export const Route = createFileRoute('/_app/_builder/detection/scenarios/$scenarioId')({
  loader: ({ params }) => scenarioLayoutLoader({ data: { params } }),
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { currentScenario } = Route.useLoaderData();

        return (
          <div className="flex flex-row items-center gap-4">
            <BreadCrumbLink
              isLast={isLast}
              to="/detection/scenarios/$scenarioId"
              params={{ scenarioId: fromUUIDtoSUUID(currentScenario.id) }}
            >
              {currentScenario.name}
            </BreadCrumbLink>
            <TriggerObjectTag>{currentScenario.triggerObjectType}</TriggerObjectTag>
          </div>
        );
      },
    ],
  },
  errorComponent: ({ error }) => {
    Sentry.captureException(error);
    return <ErrorComponent error={error} />;
  },
  component: () => <Outlet />,
});
