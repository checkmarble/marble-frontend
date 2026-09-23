import { useOrganizationChange } from '@app-builder/contexts/OrganizationChangeContext';

export function useNewOrganizationId() {
  return useOrganizationChange().changeOrganizationId;
}
