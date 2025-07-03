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

export const createDecisionDetailsService = (repositories: DecisionDetailsRepositories) => {
  const fetchDecision = async (
    decisionId: string,
    decisionRepository: DecisionDetailsRepositories['decision'],
  ): Promise<DecisionDetails> => {
    try {
      return await decisionRepository.getDecisionById(decisionId);
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
  };

  const enrichSanctionCheck = async (
    sanctionCheck: SanctionCheck[],
    sanctionCheckRepository: DecisionDetailsRepositories['sanctionCheck'],
  ): Promise<SanctionCheck[]> => {
    //test if sanction check has datasets
    if (!sanctionCheck.some(({ matches }) => matches.some(({ payload }) => payload.datasets))) {
      return sanctionCheck;
    }

    try {
      const { sections } = await sanctionCheckRepository.listDatasets();

      const datasets: Map<string, string> = new Map(
        sections?.flatMap(
          ({ datasets }) => datasets?.map(({ name, title }) => [name, title]) ?? [],
        ) ?? [],
      );

      return sanctionCheck.map(({ matches, ...rest }) => ({
        ...rest,
        matches: matches.map(({ payload, ...rest }) => ({
          ...rest,
          payload: {
            ...payload,
            // remove datasets that are already in a sanction
            datasets: payload.datasets
              ?.filter(
                (dataset) =>
                  !payload.properties.sanctions?.some((sanction) =>
                    sanction.properties?.['datasets']?.includes(dataset),
                  ),
              )
              // replace dataset name with title
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
      return sanctionCheck;
    }
  };

  return {
    fetchDecisionDetails: async (decisionId: string) => {
      const decision = await fetchDecision(decisionId, repositories.decision);

      try {
        const [scenarioRules, pivots, sanctionCheck]: [
          ScenarioIterationRule[],
          Pivot[],
          SanctionCheck[],
        ] = await Promise.all([
          repositories.scenario
            .getScenarioIteration({
              iterationId: decision.scenario.scenarioIterationId,
            })
            .then((iteration) => iteration.rules),

          repositories.dataModel.listPivots({}),
          repositories.sanctionCheck
            .listSanctionChecks({ decisionId })
            .then((sanctionCheck) =>
              enrichSanctionCheck(sanctionCheck, repositories.sanctionCheck),
            ),
        ]);
        return {
          decision,
          scenarioRules,
          pivots,
          sanctionCheck,
        };
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            component: 'DecisionDetailsService',
            operation: 'fetchDecisionDetails',
            errorType: 'internal',
          },
        });
        throw new Response(null, { status: 500, statusText: 'Internal Server Error' });
      }
    },
  };
};
