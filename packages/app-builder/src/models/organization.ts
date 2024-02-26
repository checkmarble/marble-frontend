import { type OrganizationDto } from 'marble-api';

export interface Organization {
  id: string;
  name: string;
  exportScheduledExecutionS3?: string;
}

export const adaptOrganizationDto = (
  organizationDto: OrganizationDto,
): Organization => ({
  id: organizationDto.id,
  name: organizationDto.name,
  exportScheduledExecutionS3: organizationDto.export_scheduled_execution_s3,
});
