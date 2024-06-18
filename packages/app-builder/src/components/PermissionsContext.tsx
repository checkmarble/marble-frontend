import { NewPermissions, type UserPermissions } from '@app-builder/models';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { type PropsWithChildren } from 'react';

const PermissionsContext = createSimpleContext<UserPermissions>(
  'PermissionsProvider',
);

export const PermissionsProvider = ({
  userPermissions,
  children,
}: PropsWithChildren<{ userPermissions?: UserPermissions }>) => {
  return (
    <PermissionsContext.Provider value={userPermissions ?? NewPermissions()}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissionsContext = PermissionsContext.useValue;
