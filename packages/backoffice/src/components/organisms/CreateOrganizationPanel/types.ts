import { OrgImportSpec } from '@bo/schemas/org-import';

export type OrganizationCreationFlow = { type: 'import'; data: OrgImportSpec } | { type: 'template'; data: string };
