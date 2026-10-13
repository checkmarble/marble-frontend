import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { getClientEnv, isFlagActive } from '../environment';

export function useIsFlagActive(flag: Parameters<typeof getClientEnv>[0]) {
  const { org } = useOrganizationDetails();
  return isFlagActive(getClientEnv(flag), org.id);
}
