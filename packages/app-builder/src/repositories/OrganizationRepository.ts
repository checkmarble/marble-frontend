import { type MarbleApi } from '@app-builder/infra/marble-api';
import { adaptUser, type User } from '@app-builder/models';
import {
  adaptOrganizationDto,
  type Organization,
} from '@app-builder/models/organization';

export interface OrganizationRepository {
  getCurrentOrganization(): Promise<Organization>;
  listUsers(): Promise<User[]>;
}

export function getOrganizationRepository() {
  return (
    marbleApiClient: MarbleApi,
    organizationId: string
  ): OrganizationRepository => ({
    getCurrentOrganization: async () => {
      const { organization } = await marbleApiClient.getOrganization(
        organizationId
      );

      return adaptOrganizationDto(organization);
    },
    listUsers: async () => {
      const { users } = await marbleApiClient.listOrganizationUsers(
        organizationId
      );
      return users.map(adaptUser);
    },
  });
}
