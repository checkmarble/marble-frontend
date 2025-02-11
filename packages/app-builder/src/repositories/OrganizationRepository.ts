import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { adaptUser, type User } from '@app-builder/models';
import {
  adaptOrganizationDto,
  type Organization,
  type OrganizationUpdateInput,
} from '@app-builder/models/organization';
import { type Tag } from 'marble-api';

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
  return (
    marbleCoreApiClient: MarbleCoreApi,
    organizationId: string,
  ): OrganizationRepository => ({
    getCurrentOrganization: async () => {
      const { organization } =
        await marbleCoreApiClient.getOrganization(organizationId);

      return adaptOrganizationDto(organization);
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
      const { organization } = await marbleCoreApiClient.updateOrganization(
        organizationId,
        {
          default_scenario_timezone: args.changes.defaultScenarioTimezone,
          sanction_limit: args.changes.sanctionLimit,
          sanction_threshold: args.changes.sanctionThreshold,
        },
      );

      return adaptOrganizationDto(organization);
    },
  });
}
