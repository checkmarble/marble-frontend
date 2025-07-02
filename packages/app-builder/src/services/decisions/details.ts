import { type Pivot } from '@app-builder/models/data-model';
import { type DecisionDetails } from '@app-builder/models/decision';
import { type SanctionCheck } from '@app-builder/models/sanction-check';
import { type ScenarioIterationRule } from '@app-builder/models/scenario-iteration-rule';
import { type DataModelRepository } from '@app-builder/repositories/DataModelRepository';
import { type DecisionRepository } from '@app-builder/repositories/DecisionRepository';
import { type SanctionCheckRepository } from '@app-builder/repositories/SanctionCheckRepository';
import { type ScenarioRepository } from '@app-builder/repositories/ScenarioRepository';
import * as Sentry from '@sentry/remix';

export interface DecisionDetailsData {
  decision: DecisionDetails;
  scenarioRules: ScenarioIterationRule[];
  pivots: Pivot[];
  sanctionCheck: SanctionCheck[];
}

export interface DecisionDetailsRepositories {
  decision: DecisionRepository;
  scenario: ScenarioRepository;
  dataModel: DataModelRepository;
  sanctionCheck: SanctionCheckRepository;
}

export class DecisionDetailsService {
  constructor(private repositories: DecisionDetailsRepositories) {}

  async fetchDecisionDetails(decisionId: string): Promise<DecisionDetailsData> {
    const {
      decision: decisionRepository,
      scenario: scenarioRepository,
      dataModel: dataModelRepository,
      sanctionCheck: sanctionCheckRepository,
    } = this.repositories;

    let decision: DecisionDetails;
    try {
      decision = await decisionRepository.getDecisionById(decisionId);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        throw new Response(null, { status: 404, statusText: (error as any).statusText });
      }
      Sentry.captureException(error, {
        tags: {
          component: 'DecisionDetailsService',
          operation: 'fetchDecisionDetails',
          errorType: 'decision',
        },
      });
      throw new Response(null, { status: 500, statusText: 'Internal Server Error' });
    }

    const [scenarioResult, pivotsResult, sanctionCheckResult] = await Promise.allSettled([
      scenarioRepository
        .getScenarioIteration({
          iterationId: decision.scenario.scenarioIterationId,
        })
        .then((iteration) => iteration.rules),

      dataModelRepository.listPivots({}),
      sanctionCheckRepository.listSanctionChecks({ decisionId }),
    ]);

    if (scenarioResult.status === 'rejected') {
      Sentry.captureException(scenarioResult.reason, {
        tags: {
          component: 'DecisionDetailsService',
          operation: 'fetchDecisionDetails',
          errorType: 'scenario',
        },
        extra: {
          decisionId,
          scenarioIterationId: decision.scenario.scenarioIterationId,
        },
      });
      throw new Response(null, { status: 500, statusText: 'Internal Server Error' });
    }
    const scenarioRules = scenarioResult.value;

    if (pivotsResult.status === 'rejected') {
      Sentry.captureException(pivotsResult.reason, {
        tags: {
          component: 'DecisionDetailsService',
          operation: 'fetchDecisionDetails',
          errorType: 'pivots',
        },
        extra: {
          decisionId,
        },
      });
      throw new Response(null, { status: 500, statusText: 'Internal Server Error' });
    }
    const pivots = pivotsResult.value;

    if (sanctionCheckResult.status === 'rejected') {
      Sentry.captureException(sanctionCheckResult.reason, {
        tags: {
          component: 'DecisionDetailsService',
          operation: 'fetchDecisionDetails',
          errorType: 'sanction-checks',
        },
        extra: {
          decisionId,
        },
      });
      throw new Response(null, { status: 500, statusText: 'Internal Server Error' });
    }

    let sanctionCheck: SanctionCheck[];

    //test if sanction check has datasets
    if (
      !sanctionCheckResult.value.some(({ matches }) =>
        matches.some(({ payload }) => payload.datasets),
      )
    ) {
      sanctionCheck = sanctionCheckResult.value;
    } else {
      try {
        const { sections } = await sanctionCheckRepository.listDatasets();

        const datasets: Map<string, string> = new Map(
          sections?.flatMap(
            ({ datasets }) => datasets?.map(({ name, title }) => [name, title]) ?? [],
          ) ?? [],
        );

        const sanctionsDatasets = [
          ...new Set(
            sanctionCheckResult.value.flatMap(({ matches }) =>
              matches.flatMap(({ payload }) => payload.datasets),
            ),
          ),
        ];

        sanctionCheck = sanctionCheckResult.value.map(({ matches, ...rest }) => ({
          ...rest,
          matches: matches.map(({ payload, ...rest }) => ({
            ...rest,
            payload: {
              ...payload,
              datasets: payload.datasets
                ?.filter((dataset) => !sanctionsDatasets.includes(dataset))
                .map((dataset) => datasets.get(dataset) ?? dataset),
            },
          })),
        }));
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            component: 'DecisionDetailsService',
            operation: 'fetchDecisionDetails',
            errorType: 'datasets',
          },
        });
        sanctionCheck = sanctionCheckResult.value;
      }
    }

    return {
      decision,
      scenarioRules,
      pivots,
      sanctionCheck,
    };
  }
}

export function createDecisionDetailsService(
  repositories: DecisionDetailsRepositories,
): DecisionDetailsService {
  return new DecisionDetailsService(repositories);
}
