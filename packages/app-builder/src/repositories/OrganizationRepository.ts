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
  listTags(args?: { target?: 'case' | 'object'; withCaseCount?: boolean }): Promise<Tag[]>;
  updateOrganization(args: {
    organizationId: string;
    changes: OrganizationUpdateInput;
  }): Promise<Organization>;
  updateAllowedNetworks(organizationId: string, allowedNetworks: string[]): Promise<void>;
}

export function makeGetOrganizationRepository() {
  return (marbleCoreApiClient: MarbleCoreApi, organizationId: string): OrganizationRepository => ({
    getCurrentOrganization: async () => {
      const { organization } = await marbleCoreApiClient.getOrganization(organizationId);

      return adaptOrganizationDto(organization);
    },
    listUsers: async () => {
      const { users } = await marbleCoreApiClient.listOrganizationUsers(organizationId);
      return users.map(adaptUser);
    },
    listTags: async (args) => {
      const withCaseCount = args?.withCaseCount ?? false;
      const { tags } = await marbleCoreApiClient.listTags({ target: args?.target, withCaseCount });
      return tags;
    },
    updateOrganization: async (args) => {
      const { organization } = await marbleCoreApiClient.updateOrganization(organizationId, {
        ...(args.changes.defaultScenarioTimezone && {
          default_scenario_timezone: args.changes.defaultScenarioTimezone,
        }),
        ...(args.changes.sanctionLimit && {
          sanctions_limit: args.changes.sanctionLimit,
        }),
        ...(args.changes.sanctionThreshold && {
          sanctions_threshold: args.changes.sanctionThreshold,
        }),
        ...(args.changes.autoAssignQueueLimit && {
          auto_assign_queue_limit: args.changes.autoAssignQueueLimit,
        }),
      });

      return adaptOrganizationDto(organization);
    },
    updateAllowedNetworks: async (organizationId: string, allowedNetworks: string[]) => {
      await marbleCoreApiClient.updateOrganizationSubnets(organizationId, {
        subnets: allowedNetworks,
      });
    },
  });
}
