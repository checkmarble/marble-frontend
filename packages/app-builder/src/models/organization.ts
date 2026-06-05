import { type OrganizationDto } from 'marble-api';

export type ScreeningProvider = 'opensanctions' | 'lexisnexis';
export interface Organization {
  id: string;
  name: string;
  defaultScenarioTimezone: string | null;
  sanctionThreshold?: number;
  sanctionLimit?: number;
  autoAssignQueueLimit?: number;
  allowedNetworks: string[];
  sentryReplayEnabled: boolean;
  screeningProviders?: {
    transactionMonitoring?: ScreeningProvider;
    continuousMonitoring?: ScreeningProvider;
    manualSearch?: ScreeningProvider;
  };
}

export const adaptOrganizationDto = (organizationDto: OrganizationDto): Organization => ({
  id: organizationDto.id,
  name: organizationDto.name,
  defaultScenarioTimezone: organizationDto.default_scenario_timezone ? organizationDto.default_scenario_timezone : null,
  sanctionLimit: organizationDto.sanctions_limit,
  sanctionThreshold: organizationDto.sanctions_threshold,
  autoAssignQueueLimit: organizationDto.auto_assign_queue_limit,
  allowedNetworks: organizationDto.allowed_networks,
  sentryReplayEnabled: organizationDto.sentry_replay_enabled ?? false,
  screeningProviders: {
    continuousMonitoring: organizationDto.screening_providers?.continuous_monitoring,
    transactionMonitoring: organizationDto.screening_providers?.transaction_monitoring,
    manualSearch: organizationDto.screening_providers?.manual_search,
  },
});

export interface OrganizationUpdateInput {
  defaultScenarioTimezone?: string;
  sanctionThreshold?: number;
  sanctionLimit?: number;
  autoAssignQueueLimit?: number;
  screeningProviders?: Organization['screeningProviders'];
}
