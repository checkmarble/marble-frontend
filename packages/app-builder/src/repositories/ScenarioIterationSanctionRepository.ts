import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptSanctionCheckConfig,
  adaptSanctionCheckConfigDto,
  type SanctionCheckConfig,
} from '@app-builder/models/sanction-check-config';

export interface ScenarioIterationSanctionRepository {
  createSanctionCheckConfig(args: {
    iterationId: string;
    changes: SanctionCheckConfig;
  }): Promise<SanctionCheckConfig>;
  updateSanctionCheckConfig(args: {
    iterationId: string;
    sanctionId: string;
    changes: SanctionCheckConfig;
  }): Promise<SanctionCheckConfig>;
  deleteSanctioncheckConfig(args: { iterationId: string; sanctionId: string }): Promise<void>;
}

export function makeGetScenarioIterationSanctionRepository() {
  return (client: MarbleCoreApi): ScenarioIterationSanctionRepository => ({
    deleteSanctioncheckConfig: async ({ iterationId, sanctionId }) => {
      await client.deleteSanctionCheckConfig(iterationId, sanctionId);
    },
    createSanctionCheckConfig: async ({ iterationId, changes }) =>
      adaptSanctionCheckConfig(
        await client.createSanctionCheckConfig(iterationId, adaptSanctionCheckConfigDto(changes)),
      ),
    updateSanctionCheckConfig: async ({ iterationId, sanctionId, changes }) =>
      adaptSanctionCheckConfig(
        await client.upsertSanctionCheckConfig(
          iterationId,
          sanctionId,
          adaptSanctionCheckConfigDto(changes),
        ),
      ),
  });
}
