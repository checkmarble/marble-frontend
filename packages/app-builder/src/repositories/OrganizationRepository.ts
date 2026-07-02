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
  exportOrganization(): Promise<unknown>;
  importOrganization(body: unknown): Promise<{ org_id: string }>;
  importOrganizationFromFile(file: Blob): Promise<{ org_id: string }>;
  listUsers(args?: { withTfa?: boolean }): Promise<User[]>;
  listTags(args?: { target?: 'case' | 'object'; withCaseCount?: boolean }): Promise<Tag[]>;
  updateOrganization(args: { organizationId: string; changes: OrganizationUpdateInput }): Promise<Organization>;
  updateAllowedNetworks(organizationId: string, allowedNetworks: string[]): Promise<string[]>;
}

export function makeGetOrganizationRepository() {
  return (marbleCoreApiClient: MarbleCoreApi, organizationId: string): OrganizationRepository => ({
    getCurrentOrganization: async () => {
      const { organization } = await marbleCoreApiClient.getOrganization(organizationId);

      return adaptOrganizationDto(organization);
    },
    exportOrganization: async () => {
      return marbleCoreApiClient.exportOrganization();
    },
    importOrganization: async (body) => {
      return marbleCoreApiClient.importOrganization(body);
    },
    importOrganizationFromFile: async (file) => {
      return marbleCoreApiClient.importOrganizationFromFile({ file });
    },
    listUsers: async (args) => {
      const { users } = await marbleCoreApiClient.listOrganizationUsers(organizationId, {
        withTfa: args?.withTfa ?? false,
      });
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
        ...(args.changes.screeningProviders && {
          screening_providers: {
            manual_search: args.changes.screeningProviders.manualSearch,
            transaction_monitoring: args.changes.screeningProviders.transactionMonitoring,
            continuous_monitoring: args.changes.screeningProviders.continuousMonitoring,
          },
        }),
      });

      return adaptOrganizationDto(organization);
    },
    updateAllowedNetworks: async (organizationId: string, allowedNetworks: string[]) => {
      return await marbleCoreApiClient.updateOrganizationSubnets(organizationId, {
        subnets: allowedNetworks,
      });
    },
  });
}
