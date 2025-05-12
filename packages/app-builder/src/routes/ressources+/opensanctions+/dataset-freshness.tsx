import { isHttpError } from '@app-builder/models';
import type { ScenarioIteration } from '@app-builder/models/scenario-iteration';
import type { SanctionCheckRepository } from '@app-builder/repositories/SanctionCheckRepository';
import type { ScenarioRepository } from '@app-builder/repositories/ScenarioRepository';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { captureRemixServerException } from '@sentry/remix';
import * as R from 'remeda';

export type OpenSanctionDatasetFreshnessInfoResource = {
  datasetFreshnessInfo: {
    lastExport: string;
  } | null;
};

async function getDatasetFreshnessInfo(
  sanctionCheckRepository: SanctionCheckRepository,
  scenarioRepository: ScenarioRepository,
): Promise<{ lastExport: string } | null> {
  const datasetFreshness = await sanctionCheckRepository.getDatasetFreshness();

  if (datasetFreshness.upToDate) {
    return null;
  }

  const allScenarios = await scenarioRepository.listScenarios();
  const iterationsWithSanctionCheck = R.pipe(
    await Promise.all(
      allScenarios.map((scenario) => {
        return scenario.liveVersionId
          ? scenarioRepository.getScenarioIteration({ iterationId: scenario.liveVersionId })
          : null;
      }),
    ),
    R.flat(),
    R.filter((iteration) => R.isNonNullish(iteration?.sanctionCheckConfig)),
  ) as ScenarioIteration[];

  if (iterationsWithSanctionCheck.length > 0) {
    return { lastExport: datasetFreshness.upstream.lastExport };
  }

  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { sanctionCheck, scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  let datasetFreshnessInfo: { lastExport: string } | null = null;
  try {
    datasetFreshnessInfo = await getDatasetFreshnessInfo(sanctionCheck, scenario);
  } catch (err) {
    if (!isHttpError(err)) {
      captureRemixServerException(err, 'remix.server', request, true);
    }
  }

  return Response.json({ datasetFreshnessInfo });
}
