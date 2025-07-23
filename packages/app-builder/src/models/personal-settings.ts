import { PersonalSettingsUnavailableDto } from 'marble-api';

export type PersonalSettings = {
  unavailableUntil: Date | null;
};

export const adaptUnavailability = (data: PersonalSettingsUnavailableDto): PersonalSettings => ({
  unavailableUntil: data.until ? new Date(data.until) : null,
});
