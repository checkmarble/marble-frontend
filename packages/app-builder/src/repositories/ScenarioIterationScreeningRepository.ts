import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptScreeningConfig,
  adaptScreeningConfigDto,
  type ScreeningConfig,
} from '@app-builder/models/screening-config';

export interface ScenarioIterationSanctionRepository {
  createScreeningConfig(args: {
    iterationId: string;
    changes: ScreeningConfig;
  }): Promise<ScreeningConfig>;
  updateScreeningConfig(args: {
    iterationId: string;
    sanctionId: string;
    changes: ScreeningConfig;
  }): Promise<ScreeningConfig>;
  deleteScreeningConfig(args: { iterationId: string; sanctionId: string }): Promise<void>;
}

export function makeGetScenarioIterationSanctionRepository() {
  return (client: MarbleCoreApi): ScenarioIterationSanctionRepository => ({
    deleteScreeningConfig: async ({ iterationId, sanctionId }) => {
      await client.deleteScreeningConfig(iterationId, sanctionId);
    },
    createScreeningConfig: async ({ iterationId, changes }) =>
      adaptScreeningConfig(
        await client.createScreeningConfig(iterationId, adaptScreeningConfigDto(changes)),
      ),
    updateScreeningConfig: async ({ iterationId, sanctionId, changes }) =>
      adaptScreeningConfig(
        await client.upsertScreeningConfig(
          iterationId,
          sanctionId,
          adaptScreeningConfigDto(changes),
        ),
      ),
  });
}
