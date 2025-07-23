import { type CurrentUser } from '@app-builder/models';
import { type Organization } from '@app-builder/models/organization';
import { type PersonalSettings } from '@app-builder/models/personal-settings';
import { useGetUnavailabilityQuery } from '@app-builder/queries/personal-settings';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';

interface OrganizationDetailsContext {
  org: Organization;
  currentUser: CurrentUser;
  unavailabilityQuery: UseQueryResult<PersonalSettings, Error>;
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
  const unavailabilityQuery = useGetUnavailabilityQuery();

  const value = useMemo(
    () => ({ org, currentUser, unavailabilityQuery }),
    [org, currentUser, unavailabilityQuery],
  );
  return (
    <OrganizationDetailsContext.Provider value={value}>
      {children}
    </OrganizationDetailsContext.Provider>
  );
}

export const useOrganizationDetails = () => OrganizationDetailsContext.useValue();
