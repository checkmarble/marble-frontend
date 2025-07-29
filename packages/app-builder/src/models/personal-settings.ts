import { add } from 'date-fns';
import { PersonalSettingsUnavailableDto } from 'marble-api';

export type PersonalSettings = {
  until: Date | null;
};

export const adaptUnavailability = (data: PersonalSettingsUnavailableDto): PersonalSettings => ({
  until: data.until ? new Date(data.until) : null,
});

export const transformUnavailability = (
  unavailability: PersonalSettings,
): PersonalSettingsUnavailableDto => {
  if (unavailability.until === null) {
    throw new Error('Unavailability should not be null');
  }
  return {
    until: add(unavailability.until, {
      hours: 23,
      minutes: 59,
      seconds: 59,
    }).toISOString(),
  } as unknown as PersonalSettingsUnavailableDto;
};
