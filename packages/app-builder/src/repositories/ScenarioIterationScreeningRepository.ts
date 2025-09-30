import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptScreeningConfig,
  adaptScreeningConfigDto,
  type ScreeningConfig,
} from '@app-builder/models/screening-config';

export interface ScenarioIterationScreeningRepository {
  createScreeningConfig(args: {
    iterationId: string;
    changes: ScreeningConfig;
  }): Promise<ScreeningConfig>;
  updateScreeningConfig(args: {
    iterationId: string;
    screeningId: string;
    changes: ScreeningConfig;
  }): Promise<ScreeningConfig>;
  deleteScreeningConfig(args: { iterationId: string; sanctionId: string }): Promise<void>;
}

export function makeGetScenarioIterationScreeningRepository() {
  return (client: MarbleCoreApi): ScenarioIterationScreeningRepository => ({
    deleteScreeningConfig: async ({ iterationId, sanctionId }) => {
      await client.deleteScreeningConfig(iterationId, sanctionId);
    },
    createScreeningConfig: async ({ iterationId, changes }) =>
      adaptScreeningConfig(
        await client.createScreeningConfig(iterationId, adaptScreeningConfigDto(changes)),
      ),
    updateScreeningConfig: async ({ iterationId, screeningId, changes }) =>
      adaptScreeningConfig(
        await client.upsertScreeningConfig(
          iterationId,
          screeningId,
          adaptScreeningConfigDto(changes),
        ),
      ),
  });
}
