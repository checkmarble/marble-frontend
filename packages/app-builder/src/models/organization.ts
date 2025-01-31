import { type OrganizationDto } from 'marble-api';

import { type KnownOutcome } from './outcome';

export interface Organization {
  id: string;
  name: string;
  defaultScenarioTimezone: string | null;
  sanctionCheck: {
    forcedOutcome: Omit<KnownOutcome, 'approve'>;
    similarityScore: number;
  };
}

export const adaptOrganizationDto = (
  organizationDto: OrganizationDto & {
    sanction_check: {
      forced_outcome: Organization['sanctionCheck']['forcedOutcome'];
      similarity_score: number;
    };
  },
): Organization => ({
  id: organizationDto.id,
  name: organizationDto.name,
  defaultScenarioTimezone: organizationDto.default_scenario_timezone
    ? organizationDto.default_scenario_timezone
    : null,
  sanctionCheck: {
    forcedOutcome: organizationDto.sanction_check
      .forced_outcome as KnownOutcome,
    similarityScore: organizationDto.sanction_check.similarity_score,
  },
});

export interface OrganizationUpdateInput {
  defaultScenarioTimezone?: string;
  sanctionCheck?: {
    forcedOutcome?: Omit<KnownOutcome, 'approve'>;
    similarityScore?: number;
  };
}
