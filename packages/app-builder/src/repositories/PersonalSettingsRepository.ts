import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptUnavailability,
  PersonalSettings,
  transformUnavailability,
} from '@app-builder/models/personal-settings';

export interface PersonalSettingsRepository {
  getUnavailability(): Promise<PersonalSettings>;
  setUnavailability(unavailability: PersonalSettings): Promise<void>;
  cancelUnavailability(): Promise<void>;
}

export const makeGetPersonalSettingsRepository =
  () =>
  (client: MarbleCoreApi): PersonalSettingsRepository => ({
    getUnavailability: async () => {
      const data = await client.getUnavailability();
      return adaptUnavailability(data);
    },
    setUnavailability: async (unavailability: PersonalSettings) => {
      await client.setUnavailability(transformUnavailability(unavailability));
    },
    cancelUnavailability: async () => {
      await client.cancelUnavailability();
    },
  });
