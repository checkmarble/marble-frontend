import { OrganizationImportData } from '@bo/components/types/organizations';

export type OrganizationCreationFlow =
  | { type: 'import'; data: OrganizationImportData }
  | { type: 'template'; data: string };
