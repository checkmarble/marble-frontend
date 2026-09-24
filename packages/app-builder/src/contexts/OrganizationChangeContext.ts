import { createSimpleContext } from '@app-builder/utils/create-context';

interface OrganizationChangeContextValue {
  changeOrganizationId: (organizationId: string) => void;
  isSwitching: boolean;
}

export const OrganizationChangeContext = createSimpleContext<OrganizationChangeContextValue>('OrganizationChange');

export function useOrganizationChange() {
  return OrganizationChangeContext.useValue();
}
