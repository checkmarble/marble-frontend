import { NewPermissions, type UserPermissions } from '@app-builder/models';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useNavigate } from '@remix-run/react';
import { type PropsWithChildren, useEffect } from 'react';

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

export const usePermissionRedirect = (
  permission: keyof UserPermissions,
  options: { redirectUrl: string },
) => {
  const userPermissions = usePermissionsContext();
  const navigate = useNavigate();

  const permissionValue = userPermissions[permission];

  useEffect(() => {
    if (!permissionValue) {
      navigate(options.redirectUrl, { replace: true });
    }
  }, [navigate, options.redirectUrl, permissionValue]);
};
