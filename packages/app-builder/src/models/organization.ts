import { type OrganizationDto } from 'marble-api';

export interface Organization {
  name: string;
  databaseName: string;
  exportScheduledExecutionS3: string | undefined;
}

export const adaptOrganizationDto = (
  organizationDto: OrganizationDto,
): Organization => ({
  name: organizationDto.name,
  databaseName: organizationDto.database_name,
  exportScheduledExecutionS3: organizationDto.export_scheduled_execution_s3,
});
