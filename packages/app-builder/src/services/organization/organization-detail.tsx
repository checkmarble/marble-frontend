import { type CurrentUser } from '@app-builder/models';
import { type Organization, type UserOrganization } from '@app-builder/models/organization';
// import { useUnavailabilitySettings } from '@app-builder/queries/personal-settings';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useMemo } from 'react';

interface OrganizationDetailsContext {
  org: Organization;
  currentUser: CurrentUser;
  organizations: UserOrganization[];
}

const OrganizationDetailsContext = createSimpleContext<OrganizationDetailsContext>('OrganizationDetails');

export function OrganizationDetailsContextProvider({
  org,
  currentUser,
  organizations,
  children,
}: {
  org: Organization;
  currentUser: CurrentUser;
  organizations: UserOrganization[];
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ org, currentUser, organizations }), [org, currentUser, organizations]);
  return <OrganizationDetailsContext.Provider value={value}>{children}</OrganizationDetailsContext.Provider>;
}

export const useOrganizationDetails = () => OrganizationDetailsContext.useValue();
