import { isHttpError } from '@app-builder/models';
import { type ScenarioIteration } from '@app-builder/models/scenario/iteration';
import { type ScenarioRepository } from '@app-builder/repositories/ScenarioRepository';
import { type ScreeningRepository } from '@app-builder/repositories/ScreeningRepository';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { captureRemixServerException } from '@sentry/remix';
import * as R from 'remeda';

export type OpenSanctionDatasetFreshnessInfoResource = {
  datasetFreshnessInfo: {
    lastExport: string;
  } | null;
};

async function getDatasetFreshnessInfo(
  screeningRepository: ScreeningRepository,
  scenarioRepository: ScenarioRepository,
): Promise<{ lastExport: string } | null> {
  const datasetFreshness = await screeningRepository.getDatasetFreshness();

  if (datasetFreshness.upToDate) {
    return null;
  }

  const allScenarios = await scenarioRepository.listScenarios();
  const iterationsWithScreening = R.pipe(
    await Promise.all(
      allScenarios.map((scenario) => {
        return scenario.liveVersionId
          ? scenarioRepository.getScenarioIteration({ iterationId: scenario.liveVersionId })
          : null;
      }),
    ),
    R.filter((iteration): iteration is ScenarioIteration => !!iteration && iteration.screeningConfigs.length > 0),
  );

  if (iterationsWithScreening.length > 0) {
    return { lastExport: datasetFreshness.upstream.lastExport };
  }

  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { screening, scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  let datasetFreshnessInfo: { lastExport: string } | null = null;
  try {
    datasetFreshnessInfo = await getDatasetFreshnessInfo(screening, scenario);
  } catch (err) {
    if (!isHttpError(err)) {
      captureRemixServerException(err, 'remix.server', request, true);
    }
  }

  return Response.json({ datasetFreshnessInfo });
}
