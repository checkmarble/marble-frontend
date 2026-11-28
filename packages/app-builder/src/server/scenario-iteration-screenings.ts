import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptScreeningConfig,
  adaptScreeningConfigDto,
  type ScreeningConfig,
} from '@app-builder/models/screening-config';

export async function createScreeningConfig(
  api: MarbleCoreApi,
  { iterationId, changes }: { iterationId: string; changes: ScreeningConfig },
): Promise<ScreeningConfig> {
  return adaptScreeningConfig(await api.createScreeningConfig(iterationId, adaptScreeningConfigDto(changes)));
}

export async function updateScreeningConfig(
  api: MarbleCoreApi,
  { iterationId, screeningId, changes }: { iterationId: string; screeningId: string; changes: ScreeningConfig },
): Promise<ScreeningConfig> {
  return adaptScreeningConfig(
    await api.upsertScreeningConfig(iterationId, screeningId, adaptScreeningConfigDto(changes)),
  );
}
