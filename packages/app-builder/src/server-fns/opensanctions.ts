import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isHttpError } from '@app-builder/models';
import { type ScenarioIteration } from '@app-builder/models/scenario/iteration';
import { type ScenarioRepository } from '@app-builder/repositories/ScenarioRepository';
import { type ScreeningRepository } from '@app-builder/repositories/ScreeningRepository';
import * as Sentry from '@sentry/tanstackstart-react';
import { createServerFn } from '@tanstack/react-start';
import * as R from 'remeda';

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

export const getDatasetFreshnessFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    let datasetFreshnessInfo: { lastExport: string } | null = null;
    try {
      datasetFreshnessInfo = await getDatasetFreshnessInfo(context.authInfo.screening, context.authInfo.scenario);
    } catch (err) {
      if (!isHttpError(err)) {
        Sentry.captureException(err);
      }
    }

    return { datasetFreshnessInfo };
  });
