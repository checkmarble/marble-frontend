import { type OrganizationDto } from 'marble-api';

export interface Organization {
  id: string;
  name: string;
  defaultScenarioTimezone?: string;
}

export const adaptOrganizationDto = (
  organizationDto: OrganizationDto,
): Organization => ({
  id: organizationDto.id,
  name: organizationDto.name,
  defaultScenarioTimezone: organizationDto.default_scenario_timezone,
});
