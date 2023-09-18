import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptOrganizationDto,
  type Organization,
} from '@app-builder/models/organization';

export interface OrganizationRepository {
  getCurrentOrganization(): Promise<Organization>;
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
  });
}
