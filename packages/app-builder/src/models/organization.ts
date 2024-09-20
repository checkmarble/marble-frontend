import { type OrganizationDto } from 'marble-api';

export interface Organization {
  id: string;
  name: string;
}

export const adaptOrganizationDto = (
  organizationDto: OrganizationDto,
): Organization => ({
  id: organizationDto.id,
  name: organizationDto.name,
});
