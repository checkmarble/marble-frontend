import { type OrganizationDto } from 'marble-api';

export interface Organization {
  id: string;
  name: string;
  defaultScenarioTimezone: string | null;
  sanctionThreshold?: number;
  sanctionLimit?: number;
  autoAssignQueueLimit?: number;
}

export const adaptOrganizationDto = (organizationDto: OrganizationDto): Organization => ({
  id: organizationDto.id,
  name: organizationDto.name,
  defaultScenarioTimezone: organizationDto.default_scenario_timezone
    ? organizationDto.default_scenario_timezone
    : null,
  sanctionLimit: organizationDto.sanctions_limit,
  sanctionThreshold: organizationDto.sanctions_threshold,
  autoAssignQueueLimit: organizationDto.auto_assign_queue_limit,
});

export interface OrganizationUpdateInput {
  defaultScenarioTimezone?: string;
  sanctionThreshold?: number;
  sanctionLimit?: number;
  autoAssignQueueLimit?: number;
}
