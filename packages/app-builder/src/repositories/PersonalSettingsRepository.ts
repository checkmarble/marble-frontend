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
      console.log('getUnavailability');
      const data = await client.getUnavailability();
      console.log('data', data);
      return adaptUnavailability(data);
    },
    setUnavailability: async (unavailability: PersonalSettings) => {
      console.log('setUnavailability', unavailability);
      console.log('transformUnavailability', transformUnavailability(unavailability));
      await client.setUnavailability(transformUnavailability(unavailability));
    },
    cancelUnavailability: async () => {
      await client.cancelUnavailability();
    },
  });
