import type { CurrentUser } from '@app-builder/models';
import type { Organization } from '@app-builder/models/organization';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useMemo } from 'react';

interface OrganizationDetailsContext {
  org: Organization;
  currentUser: CurrentUser;
}

const OrganizationDetailsContext =
  createSimpleContext<OrganizationDetailsContext>('OrganizationDetails');

export function OrganizationDetailsContextProvider({
  org,
  currentUser,
  children,
}: {
  org: Organization;
  currentUser: CurrentUser;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ org, currentUser }), [org, currentUser]);
  return (
    <OrganizationDetailsContext.Provider value={value}>
      {children}
    </OrganizationDetailsContext.Provider>
  );
}

export const useOrganizationDetails = () => OrganizationDetailsContext.useValue();
