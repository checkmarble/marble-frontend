import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptSanctionCheckConfig,
  adaptSanctionCheckConfigDto,
  type SanctionCheckConfig,
} from '@app-builder/models/sanction-check-config';

export interface ScenarioIterationSanctionRepository {
  upsertSanctionCheckConfig(args: {
    iterationId: string;
    changes: SanctionCheckConfig;
  }): Promise<SanctionCheckConfig>;
  deleteSanctioncheckConfig(args: { iterationId: string }): Promise<void>;
}

export function makeGetScenarioIterationSanctionRepository() {
  return (client: MarbleCoreApi): ScenarioIterationSanctionRepository => ({
    deleteSanctioncheckConfig: async ({ iterationId }) => {
      await client.deleteSanctionCheckConfig(iterationId);
    },
    upsertSanctionCheckConfig: async ({ iterationId, changes }) => {
      const config = await client.upsertSanctionCheckConfig(
        iterationId,
        adaptSanctionCheckConfigDto(changes),
      );
      return adaptSanctionCheckConfig(config);
    },
  });
}
