import { type User } from '@app-builder/models';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useMemo } from 'react';

interface OrganizationUsersContext {
  orgUsers: User[];
  getOrgUserById: (userId: string) => User | undefined;
}

const OrganizationUsersContext =
  createSimpleContext<OrganizationUsersContext>('OrganizationUsers');

export function OrganizationUsersContextProvider({
  orgUsers,
  children,
}: {
  orgUsers: User[];
  children: React.ReactNode;
}) {
  const value = useMemo(() => {
    const orgUserMap = new Map<string, User>(
      orgUsers.map((user) => [user.userId, user])
    );

    return {
      orgUsers,
      getOrgUserById: (userId: string) => orgUserMap.get(userId),
    };
  }, [orgUsers]);
  return (
    <OrganizationUsersContext.Provider value={value}>
      {children}
    </OrganizationUsersContext.Provider>
  );
}

export const useOrganizationUsers = () => OrganizationUsersContext.useValue();
