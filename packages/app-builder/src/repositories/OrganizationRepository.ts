import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { adaptUser, type User } from '@app-builder/models';
import {
  adaptOrganizationDto,
  type Organization,
  type OrganizationUpdateInput,
} from '@app-builder/models/organization';
import { type OrganizationDto, type Tag } from 'marble-api';

export interface OrganizationRepository {
  getCurrentOrganization(): Promise<Organization>;
  listUsers(): Promise<User[]>;
  listTags(args?: { withCaseCount: boolean }): Promise<Tag[]>;
  updateOrganization(args: {
    organizationId: string;
    changes: OrganizationUpdateInput;
  }): Promise<Organization>;
}

export function makeGetOrganizationRepository() {
  const sanctionCheckSettings: Organization['sanctionCheck'] = {
    forcedOutcome: 'block_and_review',
    similarityScore: 60,
  };

  return (
    marbleCoreApiClient: MarbleCoreApi,
    organizationId: string,
  ): OrganizationRepository => ({
    getCurrentOrganization: async () => {
      const { organization } =
        await marbleCoreApiClient.getOrganization(organizationId);

      return adaptOrganizationDto({
        ...organization,
        sanction_check: {
          forced_outcome: sanctionCheckSettings.forcedOutcome,
          similarity_score: sanctionCheckSettings.similarityScore,
        },
      });
    },
    listUsers: async () => {
      const { users } =
        await marbleCoreApiClient.listOrganizationUsers(organizationId);
      return users.map(adaptUser);
    },
    listTags: async (args) => {
      const withCaseCount = args?.withCaseCount ?? false;
      const { tags } = await marbleCoreApiClient.listTags({ withCaseCount });
      return tags;
    },
    updateOrganization: async (args) => {
      let organizationDto: OrganizationDto;
      if (args.changes.defaultScenarioTimezone) {
        const { organization } = await marbleCoreApiClient.updateOrganization(
          organizationId,
          { default_scenario_timezone: args.changes.defaultScenarioTimezone },
        );
        organizationDto = organization;
      } else {
        const { organization } =
          await marbleCoreApiClient.getOrganization(organizationId);
        organizationDto = organization;
      }
      if (args.changes.sanctionCheck?.forcedOutcome)
        sanctionCheckSettings.forcedOutcome =
          args.changes.sanctionCheck.forcedOutcome;
      if (args.changes.sanctionCheck?.similarityScore)
        sanctionCheckSettings.similarityScore =
          args.changes.sanctionCheck.similarityScore;
      return adaptOrganizationDto({
        ...organizationDto,
        sanction_check: {
          forced_outcome: sanctionCheckSettings.forcedOutcome,
          similarity_score: sanctionCheckSettings.similarityScore,
        },
      });
    },
  });
}
